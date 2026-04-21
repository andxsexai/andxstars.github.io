"""YouTube channel monitor.

Polls the public RSS feed of each configured channel every N minutes and
pushes a short card to the bot admins whenever a new video appears.

Flow:
    1. Resolve @handle → UC-channel-id by fetching the channel page HTML
       and extracting `"channelId":"UC…"` (cached in youtube_channels table).
    2. Fetch `https://www.youtube.com/feeds/videos.xml?channel_id=UC…`.
    3. Parse entries, take first-sight by video_id (youtube_seen table).
    4. Fan out to admins via app.bot.send_message(parse_mode="HTML").

No API key required — the RSS feed is fully public and cheap to poll.
"""
from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass
from html import unescape

try:
    import httpx  # type: ignore
except Exception:  # pragma: no cover
    httpx = None  # type: ignore

from database import storage

log = logging.getLogger(__name__)

_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Safari/605.1.15"
)

# Entry shape:  <entry>
#                 <yt:videoId>...</yt:videoId>
#                 <title>...</title>
#                 <link href="https://www.youtube.com/watch?v=..."/>
#                 <published>2024-...</published>
#               </entry>
_ENTRY_RE = re.compile(r"<entry\b[^>]*>(.*?)</entry>", re.DOTALL)
_VIDEO_ID_RE = re.compile(r"<yt:videoId>([^<]+)</yt:videoId>")
_TITLE_RE = re.compile(r"<title>([^<]+)</title>")
_LINK_RE = re.compile(r'<link[^>]+href="([^"]+)"')
_CHANNEL_TITLE_RE = re.compile(r"<author>\s*<name>([^<]+)</name>", re.DOTALL)
_CHANNEL_ID_RE = re.compile(r'"channelId":"(UC[^"]+)"')


@dataclass(frozen=True)
class Video:
    video_id: str
    title: str
    url: str


def _normalize_handle(raw: str) -> str:
    s = raw.strip()
    if not s:
        return ""
    if s.startswith("http"):
        m = re.search(r"youtube\.com/(@[A-Za-z0-9._-]+)", s)
        if m:
            return m.group(1)
    if not s.startswith("@"):
        s = "@" + s
    return s


async def _resolve_channel_id(handle: str) -> tuple[str, str]:
    """Returns (channel_id, title). Reads cache first; on miss, fetches page."""
    cached = await storage.get_youtube_channel(handle)
    if cached and cached[0]:
        return cached

    if httpx is None:
        return "", ""

    url = f"https://www.youtube.com/{handle}"
    try:
        async with httpx.AsyncClient(
            timeout=15.0, headers={"User-Agent": _UA, "Accept-Language": "en;q=0.9"}
        ) as client:
            r = await client.get(url, follow_redirects=True)
    except Exception as e:  # pragma: no cover
        log.warning("youtube: resolve %s failed: %s", handle, e)
        return "", ""

    if r.status_code != 200:
        log.warning("youtube: resolve %s -> HTTP %s", handle, r.status_code)
        return "", ""

    m = _CHANNEL_ID_RE.search(r.text)
    if not m:
        log.warning("youtube: channelId not found on %s", url)
        return "", ""

    channel_id = m.group(1)
    title_m = re.search(r'<meta property="og:title" content="([^"]+)"', r.text)
    title = unescape(title_m.group(1)) if title_m else handle
    await storage.save_youtube_channel(handle, channel_id, title)
    return channel_id, title


async def _fetch_feed(channel_id: str) -> tuple[str, list[Video]]:
    """Returns (channel_title, [Video...]) — newest first."""
    if httpx is None or not channel_id:
        return "", []
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    try:
        async with httpx.AsyncClient(timeout=15.0, headers={"User-Agent": _UA}) as client:
            r = await client.get(url)
    except Exception as e:  # pragma: no cover
        log.warning("youtube: feed %s failed: %s", channel_id, e)
        return "", []
    if r.status_code != 200:
        log.warning("youtube: feed %s -> HTTP %s", channel_id, r.status_code)
        return "", []

    text = r.text
    title_m = _CHANNEL_TITLE_RE.search(text)
    channel_title = unescape(title_m.group(1)) if title_m else ""

    videos: list[Video] = []
    for entry in _ENTRY_RE.findall(text):
        vid_m = _VIDEO_ID_RE.search(entry)
        title_m2 = _TITLE_RE.search(entry)
        link_m = _LINK_RE.search(entry)
        if not vid_m or not title_m2:
            continue
        vid = vid_m.group(1).strip()
        title = unescape(title_m2.group(1)).strip()
        link = link_m.group(1).strip() if link_m else f"https://www.youtube.com/watch?v={vid}"
        videos.append(Video(video_id=vid, title=title, url=link))
    return channel_title, videos


def _escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


async def _notify(app, admin_ids: list[int], channel_title: str, handle: str, video: Video) -> None:
    bot = getattr(app, "bot", None)
    if not bot or not admin_ids:
        return
    text = (
        f"🎬 <b>Новое видео</b> · <b>{_escape_html(channel_title or handle)}</b>\n"
        f"<a href=\"{_escape_html(video.url)}\">{_escape_html(video.title)}</a>"
    )
    for uid in admin_ids:
        try:
            await bot.send_message(
                chat_id=uid,
                text=text,
                parse_mode="HTML",
                disable_web_page_preview=False,
            )
        except Exception as e:  # pragma: no cover
            log.warning("youtube: notify %s failed: %s", uid, e)


async def _poll_once(app, handles: list[str], admin_ids: list[int], prime: bool) -> None:
    for raw in handles:
        handle = _normalize_handle(raw)
        if not handle:
            continue
        channel_id, cached_title = await _resolve_channel_id(handle)
        if not channel_id:
            continue
        feed_title, videos = await _fetch_feed(channel_id)
        title = feed_title or cached_title or handle
        # Newest first — YouTube feed already orders this way, but process
        # oldest→newest so "first-sight" doesn't spam the most recent upload
        # first if multiple new ones appeared at once.
        for video in reversed(videos):
            fresh = await storage.remember_youtube_video(video.video_id, handle)
            if not fresh:
                continue
            if prime:
                # First-run: mark everything as seen without notifying.
                continue
            await _notify(app, admin_ids, title, handle, video)


async def _poll_loop(app, handles: list[str], admin_ids: list[int], minutes: int) -> None:
    interval = max(60, int(minutes) * 60)
    # Prime on first pass so we don't dump the entire back-catalogue on boot.
    try:
        await _poll_once(app, handles, admin_ids, prime=True)
    except Exception as e:  # pragma: no cover
        log.exception("youtube: prime failed: %s", e)

    while True:
        try:
            await asyncio.sleep(interval)
            await _poll_once(app, handles, admin_ids, prime=False)
        except asyncio.CancelledError:
            raise
        except Exception as e:  # pragma: no cover
            log.exception("youtube: poll failed: %s", e)


def start_monitor(app, handles: list[str], admin_ids: list[int], minutes: int = 30):
    """Launch the polling task. Returns the asyncio.Task (or None if disabled)."""
    if not handles:
        log.info("youtube: no channels configured, monitor disabled")
        return None
    if not admin_ids:
        log.info("youtube: no admin_ids, monitor has nowhere to push — disabled")
        return None
    if httpx is None:
        log.warning("youtube: httpx missing, monitor disabled")
        return None
    log.info("youtube: monitoring %s every %s min", ", ".join(handles), minutes)
    return asyncio.create_task(_poll_loop(app, handles, admin_ids, minutes))
