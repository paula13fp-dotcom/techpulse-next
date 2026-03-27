"""Sentiment analysis job: processes unanalyzed posts in batches via Claude (Supabase version)."""
import json
import logging
from datetime import datetime, timezone

from supabase_client import get_client
from config.settings import settings
from analysis.gemini_client import GeminiClient

logger = logging.getLogger("analysis.sentiment")

BATCH_SIZE = 20
SYSTEM_PROMPT = """You are a technology sentiment analyzer.
Analyze posts/reviews about phones, smartwatches, and tablets.
Respond ONLY with valid JSON — no markdown, no explanation."""

USER_PROMPT_TEMPLATE = """Analyze the sentiment of these tech posts. For each, determine:
- label: "positive", "negative", "neutral", or "mixed"
- positive_score: float 0.0-1.0
- neutral_score: float 0.0-1.0
- negative_score: float 0.0-1.0
(scores must sum to ~1.0)
- confidence: float 0.0-1.0

Posts:
{posts_json}

Respond with a JSON array:
[{{"id": <post_id>, "label": "...", "positive_score": 0.0, "neutral_score": 0.0, "negative_score": 0.0, "confidence": 0.0}}, ...]"""


def run_sentiment_analysis(limit: int = 100) -> int:
    """Process unanalyzed posts. Returns number of posts analyzed."""
    if not settings.has_gemini():
        logger.warning("Gemini API key not set — skipping sentiment analysis")
        return 0

    client = get_client()

    # Get posts without sentiment analysis
    result = client.table("posts").select(
        "id, title, body"
    ).not_.in_(
        "id",
        client.table("sentiment_results").select("post_id").execute().data
        if client.table("sentiment_results").select("post_id").execute().data
        else [-1]
    ).limit(limit).execute()

    # Simpler approach: use a raw query via RPC or left join
    # Actually, let's use a direct approach
    analyzed_ids_result = client.table("sentiment_results").select("post_id").execute()
    analyzed_ids = [r["post_id"] for r in (analyzed_ids_result.data or [])]

    if analyzed_ids:
        posts_result = client.table("posts").select("id, title, body").not_.in_("id", analyzed_ids).limit(limit).execute()
    else:
        posts_result = client.table("posts").select("id, title, body").limit(limit).execute()

    posts = posts_result.data or []

    if not posts:
        logger.info("No posts to analyze")
        return 0

    logger.info(f"Analyzing sentiment for {len(posts)} posts")
    analyzed = 0
    gemini = GeminiClient(api_key=settings.GEMINI_API_KEY)

    for i in range(0, len(posts), BATCH_SIZE):
        batch = posts[i:i + BATCH_SIZE]
        results = _analyze_batch(gemini, batch)
        if results:
            _save_results(client, results)
            analyzed += len(results)

    logger.info(f"Sentiment analysis complete: {analyzed} posts processed")
    return analyzed


def _analyze_batch(gemini: GeminiClient, posts: list[dict]) -> list[dict]:
    posts_json = json.dumps([
        {
            "id": p["id"],
            "title": (p.get("title") or "")[:200],
            "body": (p.get("body") or "")[:500],
        }
        for p in posts
    ], ensure_ascii=False)

    prompt = USER_PROMPT_TEMPLATE.format(posts_json=posts_json)

    try:
        text = gemini.complete(prompt, system=SYSTEM_PROMPT, max_tokens=4096)
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return []

    try:
        clean = text.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        results = json.loads(clean)
        return results if isinstance(results, list) else []
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse sentiment response: {e}\nResponse: {text[:200]}")
        return []


def _save_results(client, results: list[dict]):
    for r in results:
        try:
            client.table("sentiment_results").upsert({
                "post_id": r["id"],
                "label": r.get("label", "neutral"),
                "positive_score": r.get("positive_score", 0.0),
                "neutral_score": r.get("neutral_score", 0.0),
                "negative_score": r.get("negative_score", 0.0),
                "confidence": r.get("confidence", 0.5),
                "analyzed_at": datetime.now(timezone.utc).isoformat(),
            }, on_conflict="post_id").execute()
        except Exception as e:
            logger.warning(f"Failed to save sentiment for post {r.get('id')}: {e}")
