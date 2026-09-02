"""Read-only check that the `chemicals` table has the columns the backend needs.

Run with: .venv/Scripts/python.exe scripts/verify_chemicals_table.py
Makes no changes to the database.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.supabase_client import get_supabase

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
    supabase = get_supabase()

    missing = []
    for field in REQUIRED_FIELDS:
        try:
            supabase.table("chemicals").select(field).limit(1).execute()
        except Exception as exc:  # noqa: BLE001
            print(f"  MISSING or inaccessible: {field}  ({exc})")
            missing.append(field)
        else:
            print(f"  OK: {field}")

    print()
    if missing:
        print(f"Missing/inaccessible fields: {', '.join(missing)}")
        sys.exit(1)
    else:
        print("All required fields are present on `chemicals`.")


if __name__ == "__main__":
    main()
