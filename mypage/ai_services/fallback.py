"""Static carousel templates used when Ollama/ComfyUI are offline (Rule #5).

Each template gives 7 slides with title + subtitle that actually make sense for
the chosen topic_type. User still gets a usable result — this is the whole
point of the fallback.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TemplateSlide:
    title: str
    subtitle: str


_EXPERT = [
    TemplateSlide("Вступление", "Коротко про проблему и почему это важно."),
    TemplateSlide("В чём подвох", "Где ошибаются 9 из 10 — и как это видно."),
    TemplateSlide("Правило №1", "Первый принцип, без которого дальше не работает."),
    TemplateSlide("Правило №2", "Как применять на практике, пример из жизни."),
    TemplateSlide("Частая ошибка", "Что ломает результат даже у опытных."),
    TemplateSlide("Что делать", "3 конкретных шага на сегодня-завтра."),
    TemplateSlide("Итог", "Главный тейк. Сохраняй карусель, чтобы вернуться."),
]

_PRODUCT = [
    TemplateSlide("Кто ты", "Имя + одна сильная фраза про тебя."),
    TemplateSlide("Что ты делаешь", "Формулировка услуги/продукта в одном предложении."),
    TemplateSlide("Для кого", "Чёткий образ клиента — без «для всех»."),
    TemplateSlide("Боль клиента", "Что болит до встречи с тобой."),
    TemplateSlide("Как ты это решаешь", "Метод / формат работы за 2 строки."),
    TemplateSlide("Результат", "Что получит человек — в цифрах или ощущениях."),
    TemplateSlide("Следующий шаг", "Пиши в личку / кнопка / ссылка."),
]

_WELLNESS = [
    TemplateSlide("Зачем", "Что ты получишь от этой практики за 7 дней."),
    TemplateSlide("Дыхание", "Короткая техника: 4-7-8, 2 минуты утром."),
    TemplateSlide("Тело", "Одно упражнение цигун / мягкой растяжки."),
    TemplateSlide("Внимание", "Куда смотреть внутри — и что отмечать."),
    TemplateSlide("Вечер", "Ритуал выгрузки дня за 5 минут."),
    TemplateSlide("Ошибки", "Что сбивает прогресс новичков."),
    TemplateSlide("Итог", "Сохраняй и возвращайся каждое утро."),
]

_FREE = [
    TemplateSlide("Тема", "Коротко: о чём эта карусель."),
    TemplateSlide("Почему сейчас", "Контекст и актуальность."),
    TemplateSlide("Главный тезис", "Основная мысль в одну строку."),
    TemplateSlide("Аргумент 1", "Факт, пример или цифра."),
    TemplateSlide("Аргумент 2", "Контр-пример, чтобы не было плоско."),
    TemplateSlide("Что делать", "Практический шаг для читателя."),
    TemplateSlide("Финал", "Вопрос в комменты / CTA."),
]

_BY_TYPE = {
    "expert": _EXPERT,
    "product": _PRODUCT,
    "wellness": _WELLNESS,
    "free": _FREE,
}


def template_for(topic_type: str) -> list[TemplateSlide]:
    return _BY_TYPE.get(topic_type, _FREE)
