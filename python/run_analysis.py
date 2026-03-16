#!/usr/bin/env python3
"""Main entry point: runs analysis pipeline (sentiment + clustering + digest), then revalidates."""
import logging
import sys
import os
import datetime
import httpx

sys.path.insert(0, os.path.dirname(__file__))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("run_analysis")


def main():
    from analysis.sentiment import run_sentiment_analysis
    from analysis.clustering import run_clustering
    from analysis.digest import run_digest

    logger.info("Analysis pipeline started")

    # Sentiment
    sent = run_sentiment_analysis(limit=200)
    logger.info(f"Sentiment: {sent} posts analyzed")

    # Clustering
    clust = run_clustering(days_back=3)
    logger.info(f"Clustering: {clust} clusters created")

    # Daily digest
    run_digest(digest_type="daily")

    # Weekly digest on Mondays
    if datetime.datetime.now().weekday() == 0:
        run_digest(digest_type="weekly")

    # Revalidate Vercel
    url = os.environ.get("REVALIDATE_URL")
    secret = os.environ.get("REVALIDATE_SECRET")
    if url and secret:
        try:
            resp = httpx.post(f"{url}?secret={secret}", timeout=10)
            logger.info(f"Vercel revalidation: {resp.status_code}")
        except Exception as e:
            logger.warning(f"Revalidation failed: {e}")

    logger.info("Analysis pipeline complete")


if __name__ == "__main__":
    main()
