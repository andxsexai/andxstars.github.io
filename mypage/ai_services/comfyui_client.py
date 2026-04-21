"""Async ComfyUI client.

Keeps the workflow tiny and portable: a SDXL-style txt2img with a ckpt model
auto-selected from /object_info. No custom nodes required.

If /object_info is unreachable or no checkpoint found -> caller handles the
fallback (Rule #5).
"""
from __future__ import annotations

import asyncio
import json
import logging
import random
import uuid
from typing import Optional

import httpx

log = logging.getLogger("mypage.comfyui")

_TIMEOUT = httpx.Timeout(connect=5.0, read=180.0, write=30.0, pool=5.0)

_CHECKPOINT_PREFERENCE = ["sdxl", "xl", "dreamshaper", "juggernaut", "realistic"]


class ComfyUIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self._ckpt: Optional[str] = None

    async def _object_info(self) -> dict:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.get(f"{self.base_url}/object_info")
            r.raise_for_status()
            return r.json()

    async def pick_checkpoint(self) -> str:
        if self._ckpt:
            return self._ckpt
        info = await self._object_info()
        loader = info.get("CheckpointLoaderSimple", {})
        required = loader.get("input", {}).get("required", {})
        ckpts: list[str] = []
        if "ckpt_name" in required and required["ckpt_name"]:
            raw = required["ckpt_name"][0]
            if isinstance(raw, list):
                ckpts = raw
        if not ckpts:
            raise RuntimeError("no checkpoints available in ComfyUI")
        lowered = [c.lower() for c in ckpts]
        for pref in _CHECKPOINT_PREFERENCE:
            for i, name in enumerate(lowered):
                if pref in name:
                    self._ckpt = ckpts[i]
                    log.info("comfyui: picked checkpoint %s", self._ckpt)
                    return self._ckpt
        self._ckpt = ckpts[0]
        log.info("comfyui: falling back to %s", self._ckpt)
        return self._ckpt

    def _workflow(self, *, prompt: str, ckpt: str, seed: int) -> dict:
        # Minimal stock ComfyUI graph: load ckpt -> 2 CLIP encodes -> empty latent
        # -> KSampler -> VAEDecode -> SaveImage.
        negative = "text, watermark, logo, bad hands, extra fingers, blurry, low quality"
        return {
            "3": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": seed,
                    "steps": 22,
                    "cfg": 6.5,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1.0,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0],
                },
            },
            "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": ckpt}},
            "5": {
                "class_type": "EmptyLatentImage",
                "inputs": {"width": 1024, "height": 1024, "batch_size": 1},
            },
            "6": {
                "class_type": "CLIPTextEncode",
                "inputs": {"text": prompt, "clip": ["4", 1]},
            },
            "7": {
                "class_type": "CLIPTextEncode",
                "inputs": {"text": negative, "clip": ["4", 1]},
            },
            "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
            "9": {
                "class_type": "SaveImage",
                "inputs": {"filename_prefix": "mypage", "images": ["8", 0]},
            },
        }

    async def _queue(self, workflow: dict, client_id: str) -> str:
        payload = {"prompt": workflow, "client_id": client_id}
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.post(f"{self.base_url}/prompt", json=payload)
            r.raise_for_status()
            data = r.json()
        pid = data.get("prompt_id")
        if not pid:
            raise RuntimeError(f"comfyui queue rejected: {data}")
        return pid

    async def _wait_history(self, prompt_id: str, *, timeout_s: int = 180) -> dict:
        deadline = asyncio.get_event_loop().time() + timeout_s
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            while asyncio.get_event_loop().time() < deadline:
                r = await c.get(f"{self.base_url}/history/{prompt_id}")
                if r.status_code == 200:
                    data = r.json()
                    if data.get(prompt_id):
                        return data[prompt_id]
                await asyncio.sleep(1.2)
        raise TimeoutError(f"comfyui generation timed out for {prompt_id}")

    async def _download(self, filename: str, subfolder: str, kind: str) -> bytes:
        params = {"filename": filename, "subfolder": subfolder, "type": kind}
        async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
            r = await c.get(f"{self.base_url}/view", params=params)
            r.raise_for_status()
            return r.content

    async def txt2img(self, prompt: str, *, seed: Optional[int] = None) -> bytes:
        ckpt = await self.pick_checkpoint()
        seed = seed if seed is not None else random.randint(1, 2**31 - 1)
        workflow = self._workflow(prompt=prompt, ckpt=ckpt, seed=seed)
        client_id = uuid.uuid4().hex
        pid = await self._queue(workflow, client_id)
        history = await self._wait_history(pid)
        outputs = history.get("outputs", {})
        for _node_id, node_out in outputs.items():
            images = node_out.get("images") or []
            for img in images:
                if img.get("type") == "output":
                    return await self._download(
                        img["filename"], img.get("subfolder", ""), img.get("type", "output")
                    )
        raise RuntimeError(f"comfyui returned no image for prompt {pid}")
