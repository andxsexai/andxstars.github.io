"""Entry point.

Rule #1: load_dotenv() runs BEFORE anything that reads env variables.
"""
from __future__ import annotations

# --- MUST be first ---
from dotenv import load_dotenv
load_dotenv()
# ---------------------

import logging

from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, MessageHandler, filters

from config import Config
from bot import handlers
from database import storage
from parsers import telethon_client, youtube as youtube_monitor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
log = logging.getLogger("mypage")


async def _post_init(app) -> None:
    cfg: Config = app.bot_data["cfg"]
    await storage.init_db(cfg.db_path)
    log.info("DB ready at %s", cfg.db_path)
    me = await app.bot.get_me()
    log.info("Bot started: @%s", me.username)

    task = await telethon_client.start_listener(app, cfg.parser_channels)
    app.bot_data["parser_task"] = task

    yt_task = youtube_monitor.start_monitor(
        app, cfg.youtube_channels, cfg.admin_ids, cfg.youtube_poll_minutes
    )
    app.bot_data["youtube_task"] = yt_task


async def _post_shutdown(app) -> None:
    for key in ("parser_task", "youtube_task"):
        task = app.bot_data.get(key)
        if task and not task.done():
            task.cancel()


def build_app() -> "Application":
    cfg = Config.from_env()

    app = (
        ApplicationBuilder()
        .token(cfg.bot_token)
        .post_init(_post_init)
        .post_shutdown(_post_shutdown)
        .build()
    )

    app.bot_data["cfg"] = cfg

    app.add_handler(CommandHandler("start", handlers.cmd_start))
    app.add_handler(CommandHandler("help", handlers.cmd_help))
    app.add_handler(CommandHandler("carousel", handlers.cmd_carousel))
    app.add_handler(CommandHandler("subscribe", handlers.cmd_subscribe))
    app.add_handler(CommandHandler("stats", handlers.cmd_stats))
    app.add_handler(CallbackQueryHandler(handlers.on_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handlers.on_text))

    app.add_error_handler(handlers.on_error)
    return app


def main() -> None:
    app = build_app()
    app.run_polling(drop_pending_updates=True, allowed_updates=None)


if __name__ == "__main__":
    main()
