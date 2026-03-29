#!/usr/bin/env python3
"""Генерация JPEG-постеров (1280×720) и og-preview (1200×630) для ANDXSTARS."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
POSTERS = ROOT / "posters"
PHOTOS = ROOT / "photos"

BG = "#0a0618"
ACCENT = "#b026ff"
ACCENT2 = "#8a2be2"


def _font(size: int):
    for p in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_poster(path: Path, subtitle: str) -> None:
    w, h = 1280, 720
    im = Image.new("RGB", (w, h), BG)
    dr = ImageDraw.Draw(im)
    for x in range(0, w, 48):
        dr.line([(x, 0), (x, h)], fill="#140c22", width=1)
    dr.rectangle([0, int(h * 0.62), w, h], fill="#0e0616")
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-w * 0.1, -h * 0.05, w * 0.55, h * 0.55], fill=(176, 38, 255, 35))
    im.paste(glow, (0, 0), glow)
    dr = ImageDraw.Draw(im)
    f1 = _font(72)
    f2 = _font(28)
    dr.text((56, 120), "ANDXSTARS", fill=ACCENT, font=f1)
    dr.text((56, 220), subtitle, fill="#c4b8d8", font=f2)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=70, optimize=True)


def make_og(path: Path) -> None:
    w, h = 1200, 630
    im = Image.new("RGB", (w, h), BG)
    dr = ImageDraw.Draw(im)
    dr.rectangle([0, 0, w, 8], fill=ACCENT)
    dr.rectangle([0, h - 8, w, h], fill=ACCENT2)
    f1 = _font(64)
    f2 = _font(32)
    f3 = _font(24)
    dr.text((48, 160), "ANDXSTARS", fill=ACCENT, font=f1)
    dr.text((48, 270), "Бизнес · AI · Видео · Код", fill="#ffffff", font=f2)
    dr.text((48, 360), "Архитектор цифровой реальности", fill="#b8a8c8", font=f3)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=82, optimize=True)


def main() -> None:
    specs = [
        ("service-content.jpg", "Фото и видео · контент"),
        ("service-neuro.jpg", "Нейромультики · AI"),
        ("service-podcast.jpg", "Выездные подкасты"),
        ("service-dev.jpg", "IT · автоматизация"),
        ("dopoln-sites.jpg", "Сайты и веб"),
        ("dopoln-music.jpg", "Музыка · ANDXSOUND"),
        ("dopoln-ai.jpg", "Нейросети"),
        ("dopoln-auto.jpg", "Автоматизация n8n"),
        ("dopoln-qigong.jpg", "Цигун · практики"),
    ]
    for name, sub in specs:
        make_poster(POSTERS / name, sub)
    # Та же визуальная линия, что и фото/видео каталог
    make_poster(POSTERS / "dopoln-photo.jpg", "Фотосессии · бренд")
    make_og(PHOTOS / "og-preview.jpg")
    print("OK:", POSTERS, PHOTOS)


if __name__ == "__main__":
    main()
