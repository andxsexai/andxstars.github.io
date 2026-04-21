# MYPAGE · Carousel Bot

Telegram-бот для генерации Instagram-каруселей через Ollama (текст) и ComfyUI (картинки). С полным fallback, если сервисы offline.

## 5 золотых правил

1. `load_dotenv()` — первой строкой в `bot/main.py`, до любых других импортов, которые читают env.
2. Все исходящие сообщения — через `safe_send()` из `bot/safe_send.py`. Никаких голых `message.edit_text(...)` — только через обёртку.
3. Модели Ollama/ComfyUI выбираются автоматически по тегам возможностей. Никаких жёстко зашитых имён (`llama3.1:8b` и т.п.) — всегда resolve через клиент.
4. `parse_mode="HTML"` или `None`. Markdown V1/V2 запрещён — он ломается на пользовательском контенте.
5. Каждый внешний вызов (Ollama, ComfyUI, платёжка) обёрнут в try/except с fallback на шаблон.

## Быстрый старт

```bash
cd mypage
cp .env.example .env
# впиши BOT_TOKEN и (опционально) URL Ollama, ComfyUI, Lava, CryptoCloud
pip install -r requirements.txt
python -m bot.main
```

## Структура

```
mypage/
├── bot/
│   ├── main.py              — точка входа, load_dotenv первой
│   ├── handlers.py          — /start, /carousel, callback handlers
│   ├── keyboards.py         — inline-клавиатуры
│   ├── safe_send.py         — единая обёртка для send/edit
│   └── states.py            — FSM-состояния
├── ai_services/
│   ├── ollama_client.py     — авто-выбор текстовой модели
│   ├── comfyui_client.py    — авто-выбор workflow + checkpoint
│   ├── carousel_generator.py — пайплайн: idea → 7 слайдов
│   └── fallback.py          — шаблоны на случай offline
├── payments/
│   ├── lava.py              — Lava.top invoice + webhook verify
│   └── crypto.py            — CryptoCloud invoice + callback
└── database/
    ├── models.py            — SQLite схема (users, orders, generations)
    └── storage.py           — CRUD, async-safe через aiosqlite
```

## Переменные окружения

| Ключ | Обязательно | Описание |
|------|-------------|----------|
| `BOT_TOKEN` | да | Токен от @BotFather |
| `OLLAMA_URL` | нет | http://localhost:11434 по умолчанию |
| `COMFYUI_URL` | нет | http://localhost:8188 по умолчанию |
| `LAVA_API_KEY` | опц. | если продаёшь подписку |
| `LAVA_PRODUCT_ID` | опц. | ID подписочного продукта |
| `CRYPTOCLOUD_API_KEY` | опц. | для крипто-оплат |
| `CRYPTOCLOUD_SHOP_ID` | опц. | id магазина |
| `DB_PATH` | нет | `./mypage.db` по умолчанию |
| `ADMIN_IDS` | нет | через запятую, получают /stats |

## Команды бота

- `/start` — приветствие и выбор продукта
- `/carousel` — генерация карусели (тема → 7 слайдов)
- `/subscribe` — оплата подписки 990 ₽/мес
- `/help` — справка
- `/stats` — только для ADMIN_IDS

## Что бот умеет без AI

Если Ollama/ComfyUI недоступны — `fallback.py` отдаёт готовые шаблоны из `ai_services/templates/` плюс случайные картинки-заглушки. Пользователь получит результат, а не ошибку.
