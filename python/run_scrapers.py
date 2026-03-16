#!/usr/bin/env python3
"""Main entry point: runs all scrapers sequentially, then triggers Vercel revalidation."""
import logging
import sys
import os
import httpx

# Add python/ to path so imports work
sys.path.insert(0, os.path.dirname(__file__))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("run_scrapers")


def run_all_scrapers() -> int:
    from scrapers.reddit_scraper import RedditScraper
    from scrapers.youtube_scraper import YouTubeScraper
    from scrapers.xda_scraper import XDAScraper
    from scrapers.gsmarena_scraper import GSMArenaScraper
    from scrapers.tiktok_scraper import TikTokScraper
    from scrapers.x_scraper import XScraper
    from scrapers.techblogs_scraper import (
        XatakaScraper, XatakaMovilScraper, MuyComputerScraper,
        Andro4allScraper, HipertextualScraper, ApplesferaScraper,
        HardzoneScraper, TuExpertoScraper, IPhonerosScraper,
        NineToFiveMacScraper, NineToFiveGoogleScraper, MacRumorsScraper,
        AndroidAuthorityScraper, WccftechScraper, TheVergeScraper,
        SamMobileScraper, AndroidPoliceScraper, PhandroidScraper, TechRadarScraper,
    )

    scrapers = [
        RedditScraper(),
        YouTubeScraper(),
        XDAScraper(),
        GSMArenaScraper(),
        TikTokScraper(),
        XScraper(),
        XatakaScraper(), XatakaMovilScraper(), MuyComputerScraper(),
        Andro4allScraper(), HipertextualScraper(), ApplesferaScraper(),
        HardzoneScraper(), TuExpertoScraper(), IPhonerosScraper(),
        NineToFiveMacScraper(), NineToFiveGoogleScraper(), MacRumorsScraper(),
        AndroidAuthorityScraper(), WccftechScraper(), TheVergeScraper(),
        SamMobileScraper(), AndroidPoliceScraper(), PhandroidScraper(), TechRadarScraper(),
    ]

    total = 0
    for scraper in scrapers:
        try:
            count = scraper.run()
            total += count
        except Exception as e:
            logger.error(f"Scraper {scraper.source_name} crashed: {e}")

    logger.info(f"Scrape cycle complete: {total} new posts")
    return total


def run_market_cache():
    """Fetch Amazon bestsellers + new releases and save to market_cache table."""
    from scrapers.amazon_scraper import get_bestsellers, get_new_releases, CATEGORY_LABELS
    from supabase_client import get_client
    from datetime import datetime, timezone

    client = get_client()
    now = datetime.now(timezone.utc).isoformat()

    for cat in CATEGORY_LABELS:
        for cache_type, fetch_fn in [("amazon_bestsellers", get_bestsellers), ("amazon_new_releases", get_new_releases)]:
            try:
                prods, err = fetch_fn(cat, limit=5)
                if err:
                    logger.warning(f"{cache_type}/{cat}: {err}")
                data = [{"rank": p.rank, "title": p.title, "price": p.price, "rating": p.rating} for p in prods]
                client.table("market_cache").upsert({
                    "cache_type": cache_type,
                    "category": cat,
                    "data": data,
                    "updated_at": now,
                }, on_conflict="cache_type,category").execute()
            except Exception as e:
                logger.error(f"{cache_type}/{cat} failed: {e}")

    logger.info("Market cache updated")


def revalidate_vercel():
    """Call Vercel's revalidation endpoint to refresh cached pages."""
    url = os.environ.get("REVALIDATE_URL")
    secret = os.environ.get("REVALIDATE_SECRET")
    if not url or not secret:
        logger.info("Revalidation URL/secret not set — skipping")
        return

    try:
        resp = httpx.post(f"{url}?secret={secret}", timeout=10)
        logger.info(f"Vercel revalidation: {resp.status_code} {resp.text}")
    except Exception as e:
        logger.warning(f"Vercel revalidation failed: {e}")


if __name__ == "__main__":
    total = run_all_scrapers()
    run_market_cache()
    revalidate_vercel()
    logger.info(f"Done. {total} new posts saved.")
