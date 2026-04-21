"""Pipeline: topic -> 7 slide texts (Ollama) -> 7 images (ComfyUI).

Never raises on outage. Rule #5: if AI is offline, return fallback templates so
the user still gets a carousel.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Optional

from ai_services.comfyui_client import ComfyUIClient
from ai_services.fallback import template_for
from ai_services.ollama_client import OllamaClient

log = logging.getLogger("mypage.generator")

_SLIDE_COUNT = 7

_SYSTEM_PROMPT = (
    "Ты — редактор карусели для Instagram. Пиши лаконично, на русском, без воды. "
    "Формат строго JSON без комментариев."
)


def _build_prompt(topic: str, topic_type: str) -> str:
    return (
        f"Сделай карусель из 7 слайдов по теме: «{topic}». "
        f"Тип карусели: {topic_type}. "
        "Каждый слайд — объект с полями title (до 6 слов) и subtitle (одно предложение, до 120 символов). "
        'Ответ строго в JSON: {"slides":[{"title":"...","subtitle":"..."}, ... 7 штук]}'
    )


@dataclass
class Slide:
    title: str
    subtitle: str
    image_bytes: Optional[bytes] = None


@dataclass
class Carousel:
    topic: str
    topic_type: str
    slides: list[Slide] = field(default_factory=list)
    used_fallback: bool = False


class CarouselGenerator:
    def __init__(self, *, ollama_url: str, comfyui_url: str):
        self.ollama = OllamaClient(ollama_url)
        self.comfyui = ComfyUIClient(comfyui_url)

    async def _slides_from_ollama(self, topic: str, topic_type: str) -> Optional[list[Slide]]:
        try:
            data = await self.ollama.generate_json(
                _build_prompt(topic, topic_type), system=_SYSTEM_PROMPT
            )
        except Exception as e:
            log.warning("ollama failed: %s", e)
            return None
        if not data:
            return None
        raw = data.get("slides") if isinstance(data, dict) else data
        if not isinstance(raw, list) or not raw:
            return None
        slides: list[Slide] = []
        for item in raw[:_SLIDE_COUNT]:
            if not isinstance(item, dict):
                continue
            title = str(item.get("title") or "").strip()[:80]
            subtitle = str(item.get("subtitle") or "").strip()[:180]
            if title:
                slides.append(Slide(title=title, subtitle=subtitle))
        return slides if len(slides) >= 3 else None

    async def _image_for(self, slide: Slide, *, topic: str) -> Optional[bytes]:
        prompt = (
            f"editorial instagram slide, minimal, high contrast, "
            f"topic: {topic}, headline: {slide.title}. "
            "cinematic lighting, soft grain, 1:1, negative space for text"
        )
        try:
            return await self.comfyui.txt2img(prompt)
        except Exception as e:
            log.warning("comfyui slide failed (%s): %s", slide.title[:30], e)
            return None

    async def generate(self, *, topic: str, topic_type: str = "free") -> Carousel:
        carousel = Carousel(topic=topic, topic_type=topic_type)

        slides = await self._slides_from_ollama(topic, topic_type)
        if slides is None:
            tmpl = template_for(topic_type)
            carousel.slides = [Slide(title=t.title, subtitle=t.subtitle) for t in tmpl]
            carousel.used_fallback = True
            return carousel

        carousel.slides = slides

        # Try to attach images in parallel; failures are silent.
        image_tasks = [asyncio.create_task(self._image_for(s, topic=topic)) for s in slides]
        results = await asyncio.gather(*image_tasks, return_exceptions=True)
        got_any = False
        for slide, img in zip(slides, results):
            if isinstance(img, (bytes, bytearray)) and img:
                slide.image_bytes = bytes(img)
                got_any = True
        if not got_any:
            log.info("comfyui produced 0 images; text-only carousel")
        return carousel
