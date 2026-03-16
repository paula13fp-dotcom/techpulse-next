"""Topic clustering: groups posts into themes using Claude (Supabase version)."""
import json
import logging
from datetime import datetime, timezone, timedelta

import anthropic

from supabase_client import get_client
from config.settings import settings

logger = logging.getLogger("analysis.clustering")

SYSTEM_PROMPT = """Eres un analista de tendencias tecnologicas especializado en el mercado espanol.
Agrupa posts sobre moviles, tablets, smartwatches, portatiles y gaming en clusters tematicos.
Responde UNICAMENTE con JSON valido, sin explicaciones ni markdown adicional.
IMPORTANTE: Escribe SIEMPRE el label y la description en ESPANOL."""

USER_PROMPT_TEMPLATE = """Agrupa estos posts tecnologicos en 5-10 clusters tematicos distintos.
Los posts pueden estar en cualquier idioma — analiza su contenido y agrupalos.
Para cada cluster indica:
- label: nombre descriptivo corto en espanol (max. 60 caracteres)
- description: resumen de 1-2 frases en espanol
- post_ids: lista de IDs de posts que pertenecen a este cluster
- is_trending: true si el cluster tiene mucho engagement o es un tema muy activo

Posts:
{posts_json}

Responde con JSON:
{{"clusters": [{{"label": "...", "description": "...", "post_ids": [...], "is_trending": false}}, ...]}}"""


def run_clustering(days_back: int = 3) -> int:
    """Cluster recent posts. Returns number of clusters created."""
    if not settings.has_anthropic():
        logger.warning("Anthropic API key not set — skipping clustering")
        return 0

    client = get_client()
    since = (datetime.now(timezone.utc) - timedelta(days=days_back)).isoformat()

    result = client.table("posts").select(
        "id, title, body, score, view_count"
    ).gte("published_at", since).order(
        "score", desc=True
    ).limit(100).execute()

    posts = result.data or []
    if not posts:
        logger.info("No posts to cluster")
        return 0

    logger.info(f"Clustering {len(posts)} posts")

    posts_json = json.dumps([
        {
            "id": p["id"],
            "title": (p.get("title") or "")[:150],
            "body": (p.get("body") or "")[:300],
        }
        for p in posts
    ], ensure_ascii=False)

    claude = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    try:
        response = claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": USER_PROMPT_TEMPLATE.format(posts_json=posts_json)}],
        )
        text = response.content[0].text
    except Exception as e:
        logger.error(f"Claude API call failed: {e}")
        return 0

    try:
        clean = text.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        data = json.loads(clean)
        clusters = data.get("clusters", [])
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse clustering response: {e}")
        return 0

    now = datetime.now(timezone.utc).isoformat()
    saved = 0

    for cluster in clusters:
        try:
            insert_result = client.table("topic_clusters").insert({
                "label": cluster.get("label", "Unknown topic")[:100],
                "description": cluster.get("description", ""),
                "post_count": len(cluster.get("post_ids", [])),
                "first_seen_at": now,
                "last_seen_at": now,
                "is_trending": cluster.get("is_trending", False),
            }).execute()

            cluster_id = insert_result.data[0]["id"]

            for post_id in cluster.get("post_ids", []):
                try:
                    client.table("cluster_posts").upsert(
                        {"cluster_id": cluster_id, "post_id": post_id, "relevance": 1.0},
                        on_conflict="cluster_id,post_id"
                    ).execute()
                except Exception:
                    pass  # Skip if post_id doesn't exist

            saved += 1
        except Exception as e:
            logger.warning(f"Failed to save cluster: {e}")

    logger.info(f"Created {saved} topic clusters")
    return saved
