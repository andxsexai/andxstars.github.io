"""Lightweight per-user FSM without conversations — stored in context.user_data.

Keys:
  state: one of WAITING_TOPIC, IDLE
  topic_type: expert | product | wellness | free
"""
from __future__ import annotations

IDLE = "idle"
WAITING_TOPIC = "waiting_topic"


def get_state(user_data: dict) -> str:
    return user_data.get("state", IDLE)


def set_state(user_data: dict, state: str) -> None:
    user_data["state"] = state


def reset(user_data: dict) -> None:
    user_data.pop("state", None)
    user_data.pop("topic_type", None)
