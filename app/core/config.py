import os

from dotenv import load_dotenv

load_dotenv()

def _normalize_supabase_url(url: str | None) -> str | None:
    if not url:
        return url
    url = url.rstrip("/")
    if url.endswith("/rest/v1"):
        url = url[: -len("/rest/v1")]
    return url


SUPABASE_URL = _normalize_supabase_url(os.environ.get("SUPABASE_URL"))
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")


def validate_settings() -> None:
    missing = [
        name
        for name, value in (("SUPABASE_URL", SUPABASE_URL), ("SUPABASE_KEY", SUPABASE_KEY))
        if not value
    ]
    if missing:
        raise RuntimeError(
            "Missing required environment variable(s): "
            + ", ".join(missing)
            + ". Set them in a .env file (see .env.example)."
        )
