"""Single entry point for all outgoing messages.

Rule #2: every bot reply goes through safe_send / safe_edit.
Rule #4: parse_mode is HTML or None. Markdown is forbidden — it explodes on
user input that contains _*[](){} characters.
"""
from __future__ import annotations

import html
import logging
from typing import Optional

from telegram import InlineKeyboardMarkup, Message, Update
from telegram.constants import ParseMode
from telegram.error import BadRequest, Forbidden, RetryAfter, TimedOut

log = logging.getLogger("mypage.send")

_MAX_LEN = 4096


def esc(text: str) -> str:
    """HTML-escape user-supplied text before putting it into an HTML message."""
    return html.escape(str(text or ""), quote=False)


def _chunk(text: str) -> list[str]:
    text = text or ""
    if len(text) <= _MAX_LEN:
        return [text]
    out, buf = [], ""
    for line in text.split("\n"):
        if len(buf) + len(line) + 1 > _MAX_LEN:
            out.append(buf)
            buf = line
        else:
            buf = f"{buf}\n{line}" if buf else line
    if buf:
        out.append(buf)
    return out


async def safe_send(
    update: Update,
    text: str,
    *,
    reply_markup: Optional[InlineKeyboardMarkup] = None,
    disable_web_page_preview: bool = True,
    parse_mode: Optional[str] = ParseMode.HTML,
) -> Optional[Message]:
    """Send a message, degrading gracefully on every known Telegram error."""
    chat = update.effective_chat
    if chat is None:
        return None

    last_msg: Optional[Message] = None
    for chunk in _chunk(text):
        try:
            last_msg = await chat.send_message(
                text=chunk,
                parse_mode=parse_mode,
                reply_markup=reply_markup,
                disable_web_page_preview=disable_web_page_preview,
            )
        except BadRequest as e:
            # Most common: bad HTML entities from user content. Strip and retry once.
            log.warning("BadRequest (%s) — retrying as plain text", e)
            try:
                last_msg = await chat.send_message(
                    text=chunk, parse_mode=None,
                    reply_markup=reply_markup,
                    disable_web_page_preview=disable_web_page_preview,
                )
            except Exception as inner:
                log.error("send failed even as plain: %s", inner)
        except Forbidden:
            log.info("blocked by user %s", chat.id)
            return None
        except RetryAfter as e:
            log.warning("flood wait %ss", e.retry_after)
            return None
        except TimedOut:
            log.warning("timed out sending message")
            return None
        except Exception as e:
            log.exception("unknown send error: %s", e)
            return None
    return last_msg


async def safe_edit(
    update: Update,
    text: str,
    *,
    reply_markup: Optional[InlineKeyboardMarkup] = None,
    parse_mode: Optional[str] = ParseMode.HTML,
) -> None:
    """Edit a callback-query message; if edit fails, send a new one."""
    cq = update.callback_query
    if cq is None or cq.message is None:
        await safe_send(update, text, reply_markup=reply_markup, parse_mode=parse_mode)
        return
    try:
        await cq.message.edit_text(
            text=text[:_MAX_LEN],
            parse_mode=parse_mode,
            reply_markup=reply_markup,
            disable_web_page_preview=True,
        )
    except BadRequest as e:
        if "not modified" in str(e).lower():
            return
        log.warning("edit BadRequest (%s) — falling back to send", e)
        await safe_send(update, text, reply_markup=reply_markup, parse_mode=parse_mode)
    except Exception as e:
        log.exception("edit failed, falling back to send: %s", e)
        await safe_send(update, text, reply_markup=reply_markup, parse_mode=parse_mode)


async def safe_answer(update: Update, text: str = "", show_alert: bool = False) -> None:
    cq = update.callback_query
    if cq is None:
        return
    try:
        await cq.answer(text=text or None, show_alert=show_alert)
    except Exception as e:
        log.warning("answer_callback failed: %s", e)
