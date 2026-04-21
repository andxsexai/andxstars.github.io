"""Command and callback handlers.

All user-facing output goes through safe_send / safe_edit (Rule #2).
"""
from __future__ import annotations

import logging

from telegram import Update
from telegram.ext import ContextTypes

from ai_services.carousel_generator import CarouselGenerator
from bot import keyboards, states
from bot.safe_send import esc, safe_answer, safe_edit, safe_send
from config import Config
from database import storage
from payments import crypto as crypto_pay
from payments import lava as lava_pay

log = logging.getLogger("mypage.handlers")


def _cfg(ctx: ContextTypes.DEFAULT_TYPE) -> Config:
    return ctx.application.bot_data["cfg"]


def _gen(ctx: ContextTypes.DEFAULT_TYPE) -> CarouselGenerator:
    gen = ctx.application.bot_data.get("gen")
    if gen is None:
        cfg = _cfg(ctx)
        gen = CarouselGenerator(ollama_url=cfg.ollama_url, comfyui_url=cfg.comfyui_url)
        ctx.application.bot_data["gen"] = gen
    return gen


# --------------------------------------------------------------------------- #
# commands
# --------------------------------------------------------------------------- #

async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if user is not None:
        await storage.upsert_user(user.id, user.username or "", user.full_name or "")
    states.reset(ctx.user_data)
    name = esc(user.first_name) if user else "друг"
    text = (
        f"<b>Привет, {name}!</b>\n\n"
        "Я соберу тебе <b>Instagram-карусель из 7 слайдов</b> под твою тему.\n"
        "Текст — Ollama, картинки — ComfyUI. Если оба offline — у меня есть готовые шаблоны, "
        "ты всё равно получишь результат.\n\n"
        "Что сделаем?"
    )
    await safe_send(update, text, reply_markup=keyboards.main_menu())


async def cmd_help(update: Update, _ctx: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "<b>MYPAGE — карусель-бот</b>\n\n"
        "/carousel — собрать карусель\n"
        "/subscribe — оплатить подписку 990 ₽/мес\n"
        "/help — это сообщение\n\n"
        "Если бот не отвечает на картинки — значит ComfyUI offline. Текст всё равно придёт."
    )
    await safe_send(update, text, reply_markup=keyboards.main_menu())


async def cmd_carousel(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await safe_send(
        update,
        "Выбери тип карусели:",
        reply_markup=keyboards.topic_menu(),
    )


async def cmd_subscribe(update: Update, _ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await safe_send(
        update,
        "<b>Подписка ANDXSTARS · Club — 990 ₽/мес</b>\n\n"
        "• Библиотека цигун-практик\n• Карусели и Reels-шаблоны\n• Треки для видео без авторских\n• Закрытый Telegram-чат",
        reply_markup=keyboards.payment_menu(),
    )


async def cmd_stats(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    cfg = _cfg(ctx)
    user = update.effective_user
    if user is None or user.id not in cfg.admin_ids:
        await safe_send(update, "Команда только для администраторов.")
        return
    s = await storage.stats()
    await safe_send(
        update,
        f"<b>Статистика</b>\n\nПользователей: {s['users']}\n"
        f"Генераций: {s['generations']}\nОплачено: {s['paid']}",
    )


# --------------------------------------------------------------------------- #
# callbacks
# --------------------------------------------------------------------------- #

async def on_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    cq = update.callback_query
    if cq is None or cq.data is None:
        return
    await safe_answer(update)
    data = cq.data

    if data == "nav:main":
        states.reset(ctx.user_data)
        await safe_edit(update, "Главное меню:", reply_markup=keyboards.main_menu())
        return

    if data == "info:how":
        await safe_edit(
            update,
            "<b>Как я делаю карусель</b>\n\n"
            "1. Ты пишешь тему.\n"
            "2. Ollama пишет 7 слайдов (заголовок + подзаголовок).\n"
            "3. ComfyUI рисует 7 картинок.\n"
            "4. Если AI offline — отдам шаблон, чтобы ты не ждал зря.\n\n"
            "Никаких приватных токенов не храню. Весь контент — твой.",
            reply_markup=keyboards.main_menu(),
        )
        return

    if data == "carousel:new":
        await safe_edit(
            update,
            "Выбери тип карусели:",
            reply_markup=keyboards.topic_menu(),
        )
        return

    if data.startswith("topic:"):
        topic_type = data.split(":", 1)[1]
        ctx.user_data["topic_type"] = topic_type
        states.set_state(ctx.user_data, states.WAITING_TOPIC)
        await safe_edit(
            update,
            "Опиши тему <b>одной-двумя строками</b>. Пример: "
            "<i>«как восстанавливаться после тяжёлого дня через цигун»</i>.",
        )
        return

    if data == "pay:subscribe":
        await safe_edit(
            update,
            "Выбери способ оплаты:",
            reply_markup=keyboards.payment_menu(),
        )
        return

    if data == "pay:lava":
        cfg = _cfg(ctx)
        link = await lava_pay.make_invoice(cfg, user_id=update.effective_user.id)
        await safe_edit(
            update,
            f"<b>Оплата картой (Lava)</b>\n\nСсылка: {esc(link)}\n\n"
            "После оплаты я включу подписку автоматически (webhook).",
            reply_markup=keyboards.main_menu(),
        )
        return

    if data == "pay:crypto":
        cfg = _cfg(ctx)
        link = await crypto_pay.make_invoice(cfg, user_id=update.effective_user.id)
        await safe_edit(
            update,
            f"<b>Оплата криптой (CryptoCloud)</b>\n\nСсылка: {esc(link)}",
            reply_markup=keyboards.main_menu(),
        )
        return

    log.warning("unhandled callback: %s", data)


# --------------------------------------------------------------------------- #
# free-form text = the topic for carousel
# --------------------------------------------------------------------------- #

async def on_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if states.get_state(ctx.user_data) != states.WAITING_TOPIC:
        await safe_send(
            update,
            "Нажми /carousel чтобы собрать карусель, или /help.",
            reply_markup=keyboards.main_menu(),
        )
        return

    topic = (update.message.text or "").strip()
    if len(topic) < 3:
        await safe_send(update, "Слишком коротко. Опиши тему одним предложением.")
        return

    topic_type = ctx.user_data.get("topic_type", "free")
    states.reset(ctx.user_data)

    await safe_send(update, "⏳ Собираю карусель. Это займёт 20–60 секунд…")

    gen = _gen(ctx)
    try:
        carousel = await gen.generate(topic=topic, topic_type=topic_type)
    except Exception as e:
        log.exception("generation failed: %s", e)
        await safe_send(
            update,
            "Что-то сломалось при генерации. Попробуй ещё раз — обычно со второй попытки получается.",
            reply_markup=keyboards.main_menu(),
        )
        return

    await storage.log_generation(
        user_id=update.effective_user.id,
        topic=topic,
        topic_type=topic_type,
        used_fallback=carousel.used_fallback,
    )

    # Render text block: numbered slides
    lines = [f"<b>Карусель: {esc(topic)}</b>"]
    for i, slide in enumerate(carousel.slides, 1):
        lines.append(f"\n<b>{i}. {esc(slide.title)}</b>\n{esc(slide.subtitle)}")
    if carousel.used_fallback:
        lines.append("\n<i>⚠️ AI-сервисы недоступны — использован шаблон.</i>")

    await safe_send(
        update,
        "\n".join(lines),
        reply_markup=keyboards.after_generation(),
    )

    # Send images if any
    for slide in carousel.slides:
        if slide.image_bytes:
            try:
                await update.effective_chat.send_photo(photo=slide.image_bytes, caption=esc(slide.title)[:1000])
            except Exception as e:
                log.warning("send_photo failed: %s", e)


# --------------------------------------------------------------------------- #
# global error handler
# --------------------------------------------------------------------------- #

async def on_error(update: object, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    log.exception("Handler error: %s", ctx.error)
    if isinstance(update, Update):
        try:
            await safe_send(update, "Внутренняя ошибка. Напиши /start — и попробуем заново.")
        except Exception:
            pass
