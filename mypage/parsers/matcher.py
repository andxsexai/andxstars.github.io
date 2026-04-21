"""Extract contact handles and links from a post body.

We pull @usernames, t.me links, phone numbers, and emails — so the user can
reach out directly without paid bids or intermediary platforms.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

_RE_USERNAME = re.compile(r"(?<![\w@])@([a-zA-Z][a-zA-Z0-9_]{3,31})")
_RE_TME = re.compile(r"https?://t\.me/[a-zA-Z0-9_+/-]+", re.I)
_RE_PHONE = re.compile(r"(?:\+?7|\+?8)[\s\-()]?\d{3}[\s\-()]?\d{3}[\s\-()]?\d{2}[\s\-()]?\d{2}")
_RE_EMAIL = re.compile(r"[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+")
_RE_BUDGET = re.compile(
    r"(?:бюджет|оплата|гонорар|ставка|цена|стоимость|плач[уе]|pay|budget)"
    r"[^.\n]{0,40}?(\d[\d\s.,]{1,12}\s*(?:руб|р\.|₽|rub|usd|\$|€|eur|тыс|k))",
    re.I,
)


@dataclass
class Extracted:
    usernames: list[str]
    links: list[str]
    phones: list[str]
    emails: list[str]
    budget: str = ""

    def has_contact(self) -> bool:
        return bool(self.usernames or self.links or self.phones or self.emails)


def _dedup(seq: list[str]) -> list[str]:
    seen, out = set(), []
    for x in seq:
        k = x.lower()
        if k not in seen:
            seen.add(k)
            out.append(x)
    return out


def extract(text: str) -> Extracted:
    text = text or ""
    usernames = _dedup(_RE_USERNAME.findall(text))
    # filter bot-like service handles we definitely don't want to contact
    usernames = [u for u in usernames if not u.lower().endswith("_bot")]
    links = _dedup(_RE_TME.findall(text))
    phones = _dedup(_RE_PHONE.findall(text))
    emails = _dedup(_RE_EMAIL.findall(text))
    m = _RE_BUDGET.search(text)
    budget = m.group(1).strip() if m else ""
    return Extracted(
        usernames=usernames,
        links=links,
        phones=phones,
        emails=emails,
        budget=budget,
    )
