"""CryptoCloud invoice.

API: POST https://api.cryptocloud.plus/v2/invoice/create
Auth: Authorization: Token <API_KEY>

Falls back to a public shop link if API key is missing (Rule #5).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import httpx

from database import storage

if TYPE_CHECKING:
    from config import Config

log = logging.getLogger("mypage.crypto")

_API = "https://api.cryptocloud.plus/v2/invoice/create"
_TIMEOUT = httpx.Timeout(connect=5.0, read=15.0, write=10.0, pool=5.0)
_FALLBACK_URL = "https://cryptocloud.plus/"


async def make_invoice(cfg: "Config", *, user_id: int) -> str:
    if not cfg.cryptocloud_api_key or not cfg.cryptocloud_shop_id:
        log.info("cryptocloud not configured — returning fallback link")
        return _FALLBACK_URL

    payload = {
        "shop_id": cfg.cryptocloud_shop_id,
        "amount": 990,
        "currency": "RUB",
        "order_id": f"tg-{user_id}",
    }
    headers = {
        "Authorization": f"Token {cfg.cryptocloud_api_key}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.post(_API, json=payload, headers=headers)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        log.warning("cryptocloud invoice failed: %s", e)
        return _FALLBACK_URL

    result = data.get("result") if isinstance(data, dict) else None
    url = None
    invoice_id = ""
    if isinstance(result, dict):
        url = result.get("link") or result.get("pay_url")
        invoice_id = str(result.get("uuid") or result.get("invoice_id") or "")
    url = url or _FALLBACK_URL
    if invoice_id:
        try:
            await storage.log_payment(
                user_id=user_id, provider="cryptocloud", invoice_id=invoice_id, amount=99000
            )
        except Exception as e:
            log.warning("log_payment failed: %s", e)
    return url


async def handle_webhook(body: dict) -> bool:
    invoice_id = str(body.get("invoice_id") or body.get("uuid") or "")
    status = str(body.get("status") or "").lower()
    if not invoice_id or status not in {"paid", "success", "completed", "overpaid"}:
        return False
    user_id = await storage.mark_payment_paid(invoice_id)
    if user_id is None:
        return False
    import time
    await storage.set_paid_until(user_id, int(time.time()) + 31 * 24 * 3600)
    return True
