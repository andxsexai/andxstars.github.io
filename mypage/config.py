"""Env-backed config. Import AFTER load_dotenv() has run in main.py."""
from __future__ import annotations

import os
from dataclasses import dataclass, field


def _csv_ids(raw: str) -> list[int]:
    out = []
    for piece in (raw or "").split(","):
        piece = piece.strip()
        if piece.isdigit():
            out.append(int(piece))
    return out


@dataclass(frozen=True)
class Config:
    bot_token: str
    ollama_url: str
    comfyui_url: str
    lava_api_key: str
    lava_product_id: str
    cryptocloud_api_key: str
    cryptocloud_shop_id: str
    db_path: str
    admin_ids: list[int] = field(default_factory=list)

    @classmethod
    def from_env(cls) -> "Config":
        token = os.getenv("BOT_TOKEN", "").strip()
        if not token:
            raise RuntimeError("BOT_TOKEN is required (see .env.example)")
        return cls(
            bot_token=token,
            ollama_url=os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/"),
            comfyui_url=os.getenv("COMFYUI_URL", "http://localhost:8188").rstrip("/"),
            lava_api_key=os.getenv("LAVA_API_KEY", ""),
            lava_product_id=os.getenv("LAVA_PRODUCT_ID", ""),
            cryptocloud_api_key=os.getenv("CRYPTOCLOUD_API_KEY", ""),
            cryptocloud_shop_id=os.getenv("CRYPTOCLOUD_SHOP_ID", ""),
            db_path=os.getenv("DB_PATH", "./mypage.db"),
            admin_ids=_csv_ids(os.getenv("ADMIN_IDS", "")),
        )
