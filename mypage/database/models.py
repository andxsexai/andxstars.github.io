"""SQL schema. One file = one source of truth for table definitions."""
from __future__ import annotations

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    user_id      INTEGER PRIMARY KEY,
    username     TEXT    NOT NULL DEFAULT '',
    full_name    TEXT    NOT NULL DEFAULT '',
    paid_until   INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS generations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    topic         TEXT    NOT NULL,
    topic_type    TEXT    NOT NULL DEFAULT 'free',
    used_fallback INTEGER NOT NULL DEFAULT 0,
    created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    provider     TEXT    NOT NULL,
    invoice_id   TEXT    NOT NULL,
    amount       INTEGER NOT NULL DEFAULT 0,
    status       TEXT    NOT NULL DEFAULT 'pending',
    created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gen_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_pay_user ON payments(user_id);
"""
