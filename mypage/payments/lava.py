"""Lava.top subscription invoice.

- If LAVA_API_KEY + LAVA_PRODUCT_ID are set, create an invoice via API v2.
- If not, return the public product link so the user still has a clickable URL
  (Rule #5 — fallback everywhere).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import httpx

from database import storage

if TYPE_CHECKING:
    from config import Config

log = logging.getLogger("mypage.lava")

_API = "https://api.lava.top/api/v2/invoice"
_TIMEOUT = httpx.Timeout(connect=5.0, read=15.0, write=10.0, pool=5.0)
_FALLBACK_URL = "https://app.lava.top/products/andxstars-club"


async def make_invoice(cfg: "Config", *, user_id: int) -> str:
    """Return a payment URL; fall back to a public link if API is not configured."""
    if not cfg.lava_api_key or not cfg.lava_product_id:
        log.info("lava not configured — returning public link")
        return _FALLBACK_URL

    payload = {
        "email": f"tg{user_id}@mypage.bot",
        "offerId": cfg.lava_product_id,
        "currency": "RUB",
        "buyerLanguage": "RU",
        "customFields": {"telegram_user_id": str(user_id)},
    }
    headers = {"X-Api-Key": cfg.lava_api_key, "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.post(_API, json=payload, headers=headers)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        log.warning("lava invoice failed: %s", e)
        return _FALLBACK_URL

    url = data.get("paymentUrl") or data.get("url") or _FALLBACK_URL
    invoice_id = str(data.get("id") or data.get("invoiceId") or "")
    if invoice_id:
        try:
            await storage.log_payment(
                user_id=user_id, provider="lava", invoice_id=invoice_id, amount=99000
            )
        except Exception as e:
            log.warning("log_payment failed: %s", e)
    return url


async def handle_webhook(body: dict) -> bool:
    """Parse a Lava webhook body and mark payment as paid. Returns True if matched."""
    invoice_id = str(body.get("id") or body.get("invoiceId") or "")
    status = str(body.get("status") or "").lower()
    if not invoice_id or status not in {"paid", "success", "completed"}:
        return False
    user_id = await storage.mark_payment_paid(invoice_id)
    if user_id is None:
        return False
    # 31 days of subscription
    import time
    await storage.set_paid_until(user_id, int(time.time()) + 31 * 24 * 3600)
    return True
