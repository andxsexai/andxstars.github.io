"""Inline keyboards. Kept declarative to make handler code easy to read."""
from __future__ import annotations

from telegram import InlineKeyboardButton, InlineKeyboardMarkup

from parsers.niches import NICHES


def main_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🎨 Создать карусель", callback_data="carousel:new")],
        [InlineKeyboardButton("🎯 Парсер заказов", callback_data="parser:menu")],
        [InlineKeyboardButton("⭐ Подписка 990 ₽/мес", callback_data="pay:subscribe")],
        [InlineKeyboardButton("ℹ️ Как это работает", callback_data="info:how")],
    ])


def parser_menu(active: set[str]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for key, niche in NICHES.items():
        mark = "✅" if key in active else "▫️"
        rows.append([
            InlineKeyboardButton(f"{mark} {niche.label}", callback_data=f"parser:toggle:{key}")
        ])
    rows.append([
        InlineKeyboardButton("⏸ Отписаться от всех", callback_data="parser:off"),
    ])
    rows.append([InlineKeyboardButton("⬅️ Назад", callback_data="nav:main")])
    return InlineKeyboardMarkup(rows)


def topic_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💎 Экспертный пост", callback_data="topic:expert")],
        [InlineKeyboardButton("📦 Упаковка продукта", callback_data="topic:product")],
        [InlineKeyboardButton("🧘 Практика / wellness", callback_data="topic:wellness")],
        [InlineKeyboardButton("✍️ Свободная тема", callback_data="topic:free")],
        [InlineKeyboardButton("⬅️ Назад", callback_data="nav:main")],
    ])


def payment_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💳 Картой (Lava)", callback_data="pay:lava")],
        [InlineKeyboardButton("🪙 Криптой (CryptoCloud)", callback_data="pay:crypto")],
        [InlineKeyboardButton("⬅️ Назад", callback_data="nav:main")],
    ])


def after_generation() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔁 Ещё одна карусель", callback_data="carousel:new")],
        [InlineKeyboardButton("🏠 В меню", callback_data="nav:main")],
    ])
