"""MTProto-based public-channel listener.

Why Telethon and not the bot API:
  Bots can't read public channels they're not admins of. Only a user session
  (API_ID + API_HASH + SESSION_STRING) can listen to arbitrary public channels.

The user generates SESSION_STRING once by running `python -m parsers.login`
from their own machine — the string goes into .env and the bot never touches
their password.

This module exposes `start_listener(app, channels)` that runs forever and
pushes every new message into the dispatcher.
"""
from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Iterable

from parsers import dispatcher

if TYPE_CHECKING:
    from telegram.ext import Application

log = logging.getLogger("mypage.telethon")

try:
    from telethon import TelegramClient, events
    from telethon.sessions import StringSession
    _TELETHON_OK = True
except ImportError:  # pragma: no cover
    _TELETHON_OK = False
    TelegramClient = None  # type: ignore
    events = None  # type: ignore
    StringSession = None  # type: ignore


async def _listen(app: "Application", channels: list[str]) -> None:
    cfg = app.bot_data["cfg"]
    if not cfg.tg_api_id or not cfg.tg_api_hash or not cfg.tg_session:
        log.warning("parser: TELEGRAM_API_ID/HASH/SESSION missing — parser idle")
        return
    if not channels:
        log.warning("parser: PARSER_CHANNELS is empty — parser idle")
        return

    client = TelegramClient(
        StringSession(cfg.tg_session), int(cfg.tg_api_id), cfg.tg_api_hash
    )
    await client.start()  # non-interactive: session is pre-baked
    log.info("parser: connected, watching %d channel(s)", len(channels))

    @client.on(events.NewMessage(chats=channels))
    async def _handler(event):
        try:
            text = event.raw_text or ""
            chan = getattr(event.chat, "username", None) or str(event.chat_id)
            await dispatcher.ingest(
                app=app,
                channel=chan,
                message_id=event.id,
                text=text,
            )
        except Exception as e:
            log.warning("parser ingest failed: %s", e)

    # run forever; cancellation from caller shuts it down cleanly
    try:
        await client.run_until_disconnected()
    finally:
        await client.disconnect()


async def start_listener(app: "Application", channels: Iterable[str]) -> asyncio.Task | None:
    """Kick off the listener as a background task tied to the bot's event loop."""
    if not _TELETHON_OK:
        log.warning("parser: telethon not installed — skip")
        return None
    chans = [c.strip() for c in channels if c and c.strip()]
    return asyncio.create_task(_listen(app, chans), name="parser-listener")
