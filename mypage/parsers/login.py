"""One-shot helper: generate a TELEGRAM_SESSION string.

Run locally (not on the server):

    python -m parsers.login

Enter API_ID / API_HASH (from https://my.telegram.org), phone, code.
Copy the printed string into .env as TELEGRAM_SESSION.
"""
from __future__ import annotations


def main() -> None:
    try:
        from telethon import TelegramClient
        from telethon.sessions import StringSession
    except ImportError:
        print("telethon is not installed. Run: pip install telethon==1.36.0")
        return

    api_id = int(input("API_ID: ").strip())
    api_hash = input("API_HASH: ").strip()

    with TelegramClient(StringSession(), api_id, api_hash) as client:
        print("\n------ TELEGRAM_SESSION ------")
        print(client.session.save())
        print("------------------------------")
        print("Put this string into .env as TELEGRAM_SESSION=...")


if __name__ == "__main__":
    main()
