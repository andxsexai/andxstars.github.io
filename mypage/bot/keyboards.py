"""Inline keyboards. Kept declarative to make handler code easy to read."""
from __future__ import annotations

from telegram import InlineKeyboardButton, InlineKeyboardMarkup


def main_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🎨 Создать карусель", callback_data="carousel:new")],
        [InlineKeyboardButton("⭐ Подписка 990 ₽/мес", callback_data="pay:subscribe")],
        [InlineKeyboardButton("ℹ️ Как это работает", callback_data="info:how")],
    ])


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
