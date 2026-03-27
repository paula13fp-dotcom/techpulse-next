"""Gemini client — reemplaza Anthropic. Misma interfaz simple: complete(prompt, system)."""
from __future__ import annotations
import logging
import time

from google import genai
from google.genai import types

logger = logging.getLogger("analysis.gemini_client")

MODEL = "gemini-2.5-flash"
MAX_RETRIES = 3


class GeminiClient:
    def __init__(self, api_key: str):
        self._client = genai.Client(api_key=api_key)

    def complete(self, prompt: str, system: str = "", max_tokens: int = 2048) -> str:
        """Genera texto con Gemini. Reintenta hasta 3 veces si hay rate limit."""
        config = types.GenerateContentConfig(
            system_instruction=system if system else None,
            max_output_tokens=max_tokens,
        )
        for attempt in range(MAX_RETRIES):
            try:
                response = self._client.models.generate_content(
                    model=MODEL,
                    contents=prompt,
                    config=config,
                )
                return response.text
            except Exception as e:
                err = str(e).lower()
                if "429" in err or "quota" in err or "resource_exhausted" in err:
                    wait = 2 ** attempt * 5  # 5s, 10s, 20s
                    logger.warning(f"Gemini rate limit — reintentando en {wait}s (intento {attempt + 1})")
                    time.sleep(wait)
                else:
                    logger.error(f"Gemini error: {e}")
                    raise
        raise RuntimeError(f"Gemini falló tras {MAX_RETRIES} intentos")
