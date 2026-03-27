"""Daily/weekly digest generator using Claude (Supabase version)."""
from __future__ import annotations
import json
import logging
from datetime import datetime, timezone, timedelta

from supabase_client import get_client
from config.settings import settings
from analysis.gemini_client import GeminiClient

logger = logging.getLogger("analysis.digest")

SYSTEM_PROMPT = """Eres un periodista tecnologico especializado en electronica de consumo para el mercado espanol.
Escribe resumenes claros y atractivos sobre lo que se esta hablando en internet sobre moviles,
smartwatches, tablets, portatiles y gaming. Usa formato markdown.
IMPORTANTE: Escribe SIEMPRE en ESPANOL, independientemente del idioma de los datos de entrada."""

USER_PROMPT_TEMPLATE = """Genera un resumen tecnologico {period_label} basado en estos datos.

TEMAS EN TENDENCIA:
{topics}

SENTIMIENTO POR PRODUCTO:
{sentiment}

POSTS MAS COMENTADOS:
{posts}

INTELIGENCIA DE MERCADO (Amazon Espana):
{market_intel}

Escribe el resumen en markdown con estas secciones en espanol:
## Lo mas trending
(3-5 temas calientes con breve explicacion)

## Productos destacados
(2-3 productos mas mencionados con resumen de sentimiento)

## Pulso del mercado
(Solo si hay datos de mercado: top 2-3 productos mas vendidos en Amazon)

## Conclusiones clave
(3-5 puntos con lo mas importante que se esta diciendo)

Se conciso e informativo. Sin relleno. Maximo 700 palabras. Todo en espanol.
Omite la seccion Pulso del mercado si no hay datos de mercado disponibles."""


def run_digest(digest_type: str = "daily") -> str | None:
    """Generate a digest. Returns the digest text or None on failure."""
    if not settings.has_gemini():
        logger.warning("Gemini API key not set — skipping digest")
        return None

    client = get_client()
    days_back = 1 if digest_type == "daily" else 7
    since = (datetime.now(timezone.utc) - timedelta(days=days_back)).isoformat()
    period_label = "diario" if digest_type == "daily" else "semanal"

    # Trending topics
    topics_result = client.table("topic_clusters").select(
        "label, description, post_count, is_trending"
    ).gte("last_seen_at", since).order(
        "is_trending", desc=True
    ).order("post_count", desc=True).limit(10).execute()

    # Product sentiment via RPC (already exists in Supabase)
    sentiment_result = client.rpc("get_product_radar").execute()

    # Most discussed posts
    posts_result = client.table("posts").select(
        "title, score, view_count, sources(display_name)"
    ).gte("published_at", since).not_.is_("title", "null").order(
        "score", desc=True
    ).limit(15).execute()

    # Market cache
    market_result = client.table("market_cache").select("*").execute()

    topics_text = "\n".join(
        f"- {r['label']}: {r.get('description', '')} ({r['post_count']} posts)"
        for r in (topics_result.data or [])
    ) or "Sin temas disponibles todavia."

    sentiment_text = "\n".join(
        f"- {r['canonical_name']}: {r.get('mentions_30d', 0)} menciones, {r.get('avg_pos', 0)}% positivo, {r.get('avg_neg', 0)}% negativo"
        for r in (sentiment_result.data or [])[:10]
    ) or "Sin datos de sentimiento todavia."

    posts_text = "\n".join(
        f"- [{p.get('sources', {}).get('display_name', '?')}] {p['title']}"
        for p in (posts_result.data or [])
    ) or "Sin posts disponibles."

    # Market intelligence from cache table
    market_intel_text = "Sin datos de mercado disponibles."
    market_rows = market_result.data or []
    if market_rows:
        lines = []
        bestsellers = [r for r in market_rows if r.get("cache_type") == "amazon_bestsellers"]
        if bestsellers:
            lines.append("Amazon Mas Vendidos:")
            for row in bestsellers[:5]:
                items = row.get("data", [])
                if isinstance(items, list):
                    top3 = ", ".join(f"#{i+1} {p.get('title', '')[:40]}" for i, p in enumerate(items[:3]))
                    lines.append(f"  {row.get('category', '?')}: {top3}")
        if lines:
            market_intel_text = "\n".join(lines)

    prompt = USER_PROMPT_TEMPLATE.format(
        period_label=period_label,
        topics=topics_text,
        sentiment=sentiment_text,
        posts=posts_text,
        market_intel=market_intel_text,
    )

    logger.info(f"Generating {period_label} digest...")
    gemini = GeminiClient(api_key=settings.GEMINI_API_KEY)

    try:
        content = gemini.complete(prompt, system=SYSTEM_PROMPT, max_tokens=2048)
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None

    period_end = datetime.now(timezone.utc)
    period_start = period_end - timedelta(days=days_back)

    client.table("digests").insert({
        "digest_type": digest_type,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "content": content,
        "model_used": "gemini-2.5-flash",
    }).execute()

    logger.info(f"{period_label.capitalize()} digest generated ({len(content)} chars)")
    return content
