"""Post -> niche match -> fan-out to subscribed users via the bot.

Dedups on (channel, message_id) to survive restarts.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from database import storage
from parsers import niches
from parsers.matcher import extract

if TYPE_CHECKING:
    from telegram.ext import Application

log = logging.getLogger("mypage.dispatcher")


def _format(*, channel: str, message_id: int, text: str, matched: list[str]) -> str:
    ex = extract(text)
    preview = text.strip().replace("\n\n", "\n")
    if len(preview) > 700:
        preview = preview[:700].rstrip() + "…"

    # escape HTML for the preview body
    import html as _html
    preview = _html.escape(preview, quote=False)

    lines = [
        f"<b>🎯 Новый заказ</b> · {', '.join(niches.label_of(k) for k in matched)}",
        f"Источник: @{channel} · <a href=\"https://t.me/{channel}/{message_id}\">пост</a>",
    ]
    if ex.budget:
        lines.append(f"💰 Бюджет: {_html.escape(ex.budget, quote=False)}")
    contacts: list[str] = []
    for u in ex.usernames[:3]:
        contacts.append(f"<a href=\"https://t.me/{u}\">@{u}</a>")
    contacts.extend(_html.escape(l, quote=False) for l in ex.links[:2])
    contacts.extend(_html.escape(p, quote=False) for p in ex.phones[:2])
    contacts.extend(_html.escape(e, quote=False) for e in ex.emails[:2])
    if contacts:
        lines.append("📨 Контакт: " + " · ".join(contacts))
    lines.append("")
    lines.append(f"<i>{preview}</i>")
    return "\n".join(lines)


async def ingest(*, app, channel: str, message_id: int, text: str) -> None:
    matched = niches.match_niches(text)
    if not matched:
        return

    dedup_key = f"{channel}:{message_id}"
    if not await storage.remember_order(dedup_key):
        return  # already dispatched

    ex = extract(text)
    if not ex.has_contact():
        log.info("skipped %s: no contact in post", dedup_key)
        return

    body = _format(channel=channel, message_id=message_id, text=text, matched=matched)

    # fan-out to every subscriber of any matched niche
    subs = await storage.subscribers_for(matched)
    if not subs:
        return

    from bot.safe_send import _MAX_LEN  # noqa
    for user_id in subs:
        try:
            await app.bot.send_message(
                chat_id=user_id,
                text=body[:_MAX_LEN],
                parse_mode="HTML",
                disable_web_page_preview=True,
            )
        except Exception as e:
            log.warning("deliver to %s failed: %s", user_id, e)
