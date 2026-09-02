from functools import lru_cache

from supabase import Client, create_client

from app.core.config import SUPABASE_KEY, SUPABASE_URL, validate_settings


@lru_cache
def get_supabase() -> Client:
    validate_settings()
    return create_client(SUPABASE_URL, SUPABASE_KEY)
