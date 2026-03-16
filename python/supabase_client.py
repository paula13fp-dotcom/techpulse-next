"""Supabase client module — replaces SQLite connection.py for all DB operations."""
from __future__ import annotations
import os
from supabase import create_client, Client

_client: Client | None = None


def get_client() -> Client:
    """Get or create a Supabase client using the service_role key (bypasses RLS)."""
    global _client
    if _client is None:
        url = os.environ.get("SUPABASE_URL", "https://witndqgbaxpgtpsxqfhf.supabase.co")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not key:
            raise RuntimeError("SUPABASE_SERVICE_KEY not set")
        _client = create_client(url, key)
    return _client
