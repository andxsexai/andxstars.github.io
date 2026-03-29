JPEG 1280×720, quality ~70. Сгенерированы скриптом scripts/gen_brand_assets.py (Pillow).
При смене роликов можно заменить кадром из ffmpeg:
  ffmpeg -i video.mp4 -vframes 1 -q:v 8 poster.jpg
