"""Read-only inspection of the `chemicals` table's columns and data types.

Uses PostgREST's OpenAPI description (no data is read, changed, or deleted).

Run with: .venv/Scripts/python.exe scripts/inspect_chemicals_schema.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx

from app.core.config import SUPABASE_KEY, SUPABASE_URL, validate_settings

REQUIRED_FIELDS = [
    "id",
    "name",
    "cas_number",
    "category",
    "safety_classification",
    "quantity",
    "unit",
    "location",
    "expiry_date",
    "hazard_level",
]


def main() -> None:
    validate_settings()

    rest_url = SUPABASE_URL.rstrip("/") + "/rest/v1/"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/openapi+json",
    }

    response = httpx.get(rest_url, headers=headers, timeout=10)
    response.raise_for_status()
    spec = response.json()

    definitions = spec.get("definitions", {})
    if "chemicals" not in definitions:
        print("Connection OK, but no `chemicals` table is visible via the API.")
        print("Available tables:", ", ".join(sorted(definitions.keys())) or "(none)")
        sys.exit(1)

    print("Connected to Supabase successfully.\n")

    columns = definitions["chemicals"].get("properties", {})
    required_in_schema = set(definitions["chemicals"].get("required", []))

    print("chemicals table columns:")
    for col_name, col_info in columns.items():
        col_type = col_info.get("format") or col_info.get("type", "unknown")
        nullable = "NOT NULL" if col_name in required_in_schema else "nullable"
        print(f"  - {col_name}: {col_type} ({nullable})")

    print()
    missing = [f for f in REQUIRED_FIELDS if f not in columns]
    if missing:
        print(f"MISSING required field(s): {', '.join(missing)}")
    else:
        print("All required fields are present:", ", ".join(REQUIRED_FIELDS))


if __name__ == "__main__":
    main()
