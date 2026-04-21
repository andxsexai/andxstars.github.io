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


async def subscribe(user_id: int, niche: str) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """
            INSERT OR IGNORE INTO subscriptions (user_id, niche, created_at)
            VALUES (?, ?, ?)
            """,
            (user_id, niche, _now()),
        )
        await db.commit()


async def unsubscribe(user_id: int, niche: str) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            "DELETE FROM subscriptions WHERE user_id = ? AND niche = ?",
            (user_id, niche),
        )
        await db.commit()


async def unsubscribe_all(user_id: int) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
        await db.commit()


async def user_niches(user_id: int) -> list[str]:
    async with aiosqlite.connect(_db_path) as db:
        cur = await db.execute(
            "SELECT niche FROM subscriptions WHERE user_id = ? ORDER BY niche",
            (user_id,),
        )
        rows = await cur.fetchall()
    return [r[0] for r in rows]


async def subscribers_for(niches: list[str]) -> list[int]:
    if not niches:
        return []
    placeholders = ",".join(["?"] * len(niches))
    async with aiosqlite.connect(_db_path) as db:
        cur = await db.execute(
            f"SELECT DISTINCT user_id FROM subscriptions WHERE niche IN ({placeholders})",
            niches,
        )
        rows = await cur.fetchall()
    return [int(r[0]) for r in rows]


async def remember_order(dedup_key: str) -> bool:
    """Store dedup key. Returns True if this is the first time we see it."""
    async with aiosqlite.connect(_db_path) as db:
        try:
            await db.execute(
                "INSERT INTO orders_seen (dedup_key, created_at) VALUES (?, ?)",
                (dedup_key, _now()),
            )
            await db.commit()
            return True
        except aiosqlite.IntegrityError:
            return False


async def remember_youtube_video(video_id: str, channel: str) -> bool:
    """Returns True the first time we see a video id."""
    async with aiosqlite.connect(_db_path) as db:
        try:
            await db.execute(
                "INSERT INTO youtube_seen (video_id, channel, created_at) VALUES (?, ?, ?)",
                (video_id, channel, _now()),
            )
            await db.commit()
            return True
        except aiosqlite.IntegrityError:
            return False


async def get_youtube_channel(handle: str) -> Optional[tuple[str, str]]:
    """Returns (channel_id, title) or None."""
    async with aiosqlite.connect(_db_path) as db:
        cur = await db.execute(
            "SELECT channel_id, title FROM youtube_channels WHERE handle = ?",
            (handle,),
        )
        row = await cur.fetchone()
    if not row or not row[0]:
        return None
    return str(row[0]), str(row[1] or "")


async def save_youtube_channel(handle: str, channel_id: str, title: str) -> None:
    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """
            INSERT INTO youtube_channels (handle, channel_id, title, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(handle) DO UPDATE SET
                channel_id = excluded.channel_id,
                title      = excluded.title,
                updated_at = excluded.updated_at
            """,
            (handle, channel_id, title, _now()),
        )
        await db.commit()


async def stats() -> dict:
    async with aiosqlite.connect(_db_path) as db:
        users = (await (await db.execute("SELECT COUNT(*) FROM users")).fetchone())[0]
        gens = (await (await db.execute("SELECT COUNT(*) FROM generations")).fetchone())[0]
        paid = (await (
            await db.execute("SELECT COUNT(*) FROM payments WHERE status='paid'")
        ).fetchone())[0]
        return {"users": users, "generations": gens, "paid": paid}
