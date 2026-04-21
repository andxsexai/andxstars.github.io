"""Async SQLite wrapper. Opens a new connection per call — good enough for
bot scale (hundreds of req/min), and keeps the code trivially correct.
"""
from __future__ import annotations

import time
from typing import Optional

import aiosqlite

from database.models import SCHEMA

_db_path: str = "./mypage.db"


async def init_db(path: str) -> None:
    global _db_path
    _db_path = path
    async with aiosqlite.connect(_db_path) as db:
        await db.executescript(SCHEMA)
        await db.commit()


def _now() -> int:
    return int(time.time())


async def upsert_user(user_id: int, username: str, full_name: str) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """
            INSERT INTO users (user_id, username, full_name, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                username  = excluded.username,
                full_name = excluded.full_name
            """,
            (user_id, username, full_name, _now()),
        )
        await db.commit()


async def set_paid_until(user_id: int, until_ts: int) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            "UPDATE users SET paid_until = ? WHERE user_id = ?",
            (until_ts, user_id),
        )
        await db.commit()


async def is_paid(user_id: int) -> bool:
    async with aiosqlite.connect(_db_path) as db:
        cur = await db.execute(
            "SELECT paid_until FROM users WHERE user_id = ?", (user_id,)
        )
        row = await cur.fetchone()
        return bool(row and row[0] > _now())


async def log_generation(
    *, user_id: int, topic: str, topic_type: str, used_fallback: bool
) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """
            INSERT INTO generations (user_id, topic, topic_type, used_fallback, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, topic[:500], topic_type, int(used_fallback), _now()),
        )
        await db.commit()


async def log_payment(
    *, user_id: int, provider: str, invoice_id: str, amount: int, status: str = "pending"
) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """
            INSERT INTO payments (user_id, provider, invoice_id, amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, provider, invoice_id, amount, status, _now()),
        )
        await db.commit()


async def mark_payment_paid(invoice_id: str) -> Optional[int]:
    """Mark a payment row as paid; returns user_id or None if not found."""
    async with aiosqlite.connect(_db_path) as db:
        cur = await db.execute(
            "SELECT user_id FROM payments WHERE invoice_id = ?", (invoice_id,)
        )
        row = await cur.fetchone()
        if not row:
            return None
        await db.execute(
            "UPDATE payments SET status = 'paid' WHERE invoice_id = ?", (invoice_id,)
        )
        await db.commit()
        return int(row[0])


async def stats() -> dict:
    async with aiosqlite.connect(_db_path) as db:
        users = (await (await db.execute("SELECT COUNT(*) FROM users")).fetchone())[0]
        gens = (await (await db.execute("SELECT COUNT(*) FROM generations")).fetchone())[0]
        paid = (await (
            await db.execute("SELECT COUNT(*) FROM payments WHERE status='paid'")
        ).fetchone())[0]
        return {"users": users, "generations": gens, "paid": paid}
