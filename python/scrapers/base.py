"""Abstract base class for all scrapers — Supabase version."""
from __future__ import annotations
import hashlib
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone

from supabase_client import get_client
from utils.category_tagger import tag_categories, find_product_mentions
from utils.text_cleaner import clean_text


class BaseScraper(ABC):
    source_name: str  # Override in subclasses

    def __init__(self):
        self.logger = logging.getLogger(f"scraper.{self.source_name}")

    @abstractmethod
    def fetch(self) -> list[dict]:
        """Fetch raw items from the source. Return list of normalized dicts."""

    def run(self) -> int:
        """Fetch, store, and tag posts. Returns number of new posts saved."""
        self.logger.info(f"Starting scrape for {self.source_name}")
        try:
            items = self.fetch()
        except Exception as e:
            self.logger.error(f"Fetch failed: {e}")
            return 0

        saved = 0
        client = get_client()
        source_id = self._get_source_id(client)

        for item in items:
            try:
                post_id = self._save_post(client, source_id, item)
                if post_id:
                    self._tag_post(client, post_id, item)
                    saved += 1
            except Exception as e:
                self.logger.warning(f"Failed to save post {item.get('external_id')}: {e}")

        self.logger.info(f"Saved {saved} new posts from {self.source_name}")
        return saved

    def _get_source_id(self, client) -> int:
        result = client.table("sources").select("id").eq("name", self.source_name).single().execute()
        return result.data["id"]

    def _save_post(self, client, source_id: int, item: dict) -> int | None:
        content_hash = hashlib.sha256(
            f"{source_id}:{item['external_id']}".encode()
        ).hexdigest()

        # Check duplicate
        existing = client.table("posts").select("id").eq("content_hash", content_hash).execute()
        if existing.data:
            return None

        body_clean = clean_text(item.get("body", "") or "")
        title_clean = clean_text(item.get("title", "") or "")

        row = {
            "source_id": source_id,
            "external_id": item["external_id"],
            "content_type": item.get("content_type", "post"),
            "title": title_clean,
            "body": body_clean,
            "body_raw": item.get("body", ""),
            "author": item.get("author", ""),
            "url": item.get("url", ""),
            "thumbnail_url": item.get("thumbnail_url", ""),
            "upvotes": item.get("upvotes", 0),
            "score": item.get("score", 0),
            "comment_count": item.get("comment_count", 0),
            "view_count": item.get("view_count", 0),
            "like_count": item.get("like_count", 0),
            "share_count": item.get("share_count", 0),
            "published_at": item.get("published_at", datetime.now(timezone.utc).isoformat()),
            "content_hash": content_hash,
        }

        result = client.table("posts").insert(row).execute()
        if result.data:
            return result.data[0]["id"]
        return None

    def _tag_post(self, client, post_id: int, item: dict):
        title = item.get("title", "")
        body = item.get("body", "")

        # Category tagging
        categories = tag_categories(title, body)
        for slug in categories:
            cat_result = client.table("device_categories").select("id").eq("slug", slug).execute()
            if cat_result.data:
                cat_id = cat_result.data[0]["id"]
                client.table("post_categories").upsert(
                    {"post_id": post_id, "category_id": cat_id},
                    on_conflict="post_id,category_id"
                ).execute()

        # Product mention extraction
        product_names = find_product_mentions(title, body)
        for canonical_name in product_names:
            prod_result = client.table("products").select("id").eq("canonical_name", canonical_name).execute()
            if prod_result.data:
                prod_id = prod_result.data[0]["id"]
                client.table("post_product_mentions").upsert(
                    {"post_id": post_id, "product_id": prod_id, "extracted_by": "regex"},
                    on_conflict="post_id,product_id"
                ).execute()
