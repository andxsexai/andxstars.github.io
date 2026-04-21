"""Niche definitions: keyword packs for ANDXSTARS / ANDXSOUND / AIMONAX / SFERASTARS.

Each niche has two keyword groups:
  must_any  — at least one must appear (topic filter)
  also_any  — at least one must also appear (order-intent filter)

Order-intent words catch только посты про заказы, а не обычный контент.
"""
from __future__ import annotations

from dataclasses import dataclass

ORDER_INTENT = [
    "ищу", "нужен", "нужна", "нужно", "требуется", "требую",
    "заказ", "заказчик", "задача", "проект", "вакансия", "работа",
    "бюджет", "оплата", "гонорар", "ставка",
    "рассмотрю", "откликнитесь", "откликайтесь", "напишите", "пишите",
    "hiring", "looking for", "need",
]


@dataclass(frozen=True)
class Niche:
    key: str
    label: str
    must_any: tuple[str, ...]


NICHES: dict[str, Niche] = {
    "ai": Niche(
        key="ai",
        label="AI-контент / нейросети",
        must_any=(
            "нейросет", "ai", "ии ", " ai", "midjourney", "mj ",
            "stable diffusion", "sd ", "comfy", "comfyui",
            "runway", "sora", "kling", "luma",
            "промпт", "генерац", "chatgpt", "gpt", "claude",
            "автоматизац", "n8n", "make.com", "zapier",
        ),
    ),
    "qigong": Niche(
        key="qigong",
        label="Цигун / практики / wellness",
        must_any=(
            "цигун", "дао", "тайцз", "тайч", "медитац", "практик",
            "йога", "wellness", "ретрит", "дыхательн",
            "осознанн", "mindfulness", "шавасан",
        ),
    ),
    "music": Niche(
        key="music",
        label="Музыка / саунд",
        must_any=(
            "бит ", "бита ", "трек", "музык", "mixing", "mastering",
            "свед", "мастеринг", "саунд", "sound design", "фонограмм",
            "аранжир", "аранжиров", "композит",
        ),
    ),
    "content": Niche(
        key="content",
        label="Карусели / Reels / монтаж",
        must_any=(
            "карусел", "reels", "рилс", "сторис", "монтаж", "видеомонтаж",
            "tiktok", "шортс", "shorts", "youtube", "вертикал",
            "упаков", "смм", "smm", "инстаграм", "instagram",
        ),
    ),
}


def _contains_any(text: str, words) -> bool:
    t = text.lower()
    return any(w in t for w in words)


def match_niches(text: str) -> list[str]:
    """Return list of niche keys this text matches. Requires order-intent too."""
    if not text or not _contains_any(text, ORDER_INTENT):
        return []
    return [n.key for n in NICHES.values() if _contains_any(text, n.must_any)]


def label_of(key: str) -> str:
    n = NICHES.get(key)
    return n.label if n else key
