"""Async Ollama client with auto-model-select (Rule #3).

- /api/tags to list installed models
- pick a sensible default by family preference (llama3 > qwen > mistral > ...)
- /api/generate with stream=False
"""
from __future__ import annotations

import json
import logging
from typing import Optional

import httpx

log = logging.getLogger("mypage.ollama")

_FAMILY_PREFERENCE = [
    "llama3.1", "llama3", "qwen2.5", "qwen2", "mistral", "gemma2", "phi3",
]

_TIMEOUT = httpx.Timeout(connect=5.0, read=120.0, write=30.0, pool=5.0)


class OllamaClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self._model: Optional[str] = None

    async def _list_models(self) -> list[str]:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.get(f"{self.base_url}/api/tags")
            r.raise_for_status()
            data = r.json()
        return [m.get("name", "") for m in data.get("models", []) if m.get("name")]

    async def pick_model(self) -> str:
        if self._model:
            return self._model
        names = await self._list_models()
        if not names:
            raise RuntimeError("no ollama models installed")
        # prefer by family order; fall back to first installed
        for fam in _FAMILY_PREFERENCE:
            for n in names:
                if n.startswith(fam):
                    self._model = n
                    log.info("ollama: picked %s", n)
                    return n
        self._model = names[0]
        log.info("ollama: falling back to %s", self._model)
        return self._model

    async def generate(self, prompt: str, *, system: str = "") -> str:
        model = await self.pick_model()
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7},
        }
        if system:
            payload["system"] = system
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.post(f"{self.base_url}/api/generate", json=payload)
            r.raise_for_status()
            data = r.json()
        return (data.get("response") or "").strip()

    async def generate_json(self, prompt: str, *, system: str = "") -> Optional[dict]:
        """Ask Ollama for JSON; return parsed dict or None if it can't parse."""
        raw = await self.generate(prompt, system=system)
        # common case: model wraps json in ```json ... ```
        if "```" in raw:
            chunks = raw.split("```")
            for chunk in chunks:
                chunk = chunk.strip()
                if chunk.startswith("json"):
                    chunk = chunk[4:].strip()
                if chunk.startswith("{") or chunk.startswith("["):
                    try:
                        return json.loads(chunk)
                    except json.JSONDecodeError:
                        continue
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # last-ditch: extract the first {...} block
            i = raw.find("{")
            j = raw.rfind("}")
            if i != -1 and j != -1 and j > i:
                try:
                    return json.loads(raw[i : j + 1])
                except json.JSONDecodeError:
                    return None
            return None
