"""Seeds the Supabase `chemicals` table from frontend_new's mock dataset.

The frontend's rich mock chemicals (name, hazards, formula, storage, cost,
etc.) never had a corresponding row in the real database, so the "Record
Usage" workflow had nothing real to persist against. This script inserts (or,
if a matching name+CAS number row already exists, updates) one row per mock
chemical using only the columns the `chemicals` table actually has:
name, cas_number, category, safety_classification, quantity, unit, location,
expiry_date, hazard_level.

Idempotent: safe to re-run. Existing rows are matched by (name, cas_number)
and updated in place rather than duplicated.

Run with: .venv/Scripts/python.exe scripts/seed_chemicals.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.supabase_client import get_supabase

TABLE = "chemicals"

# Mirrors frontend_new/src/data/chemicals.ts. Only backend-supported fields
# are included here; the frontend keeps the rest (formula, hazards list,
# storage, supplier, lot number, grade, cost, custodian, notes) client-side.
CHEMICALS = [
    {"name": "Sulfuric Acid", "cas_number": "7664-93-9", "category": "Acid", "safety_classification": "Corrosive", "quantity": 12.5, "unit": "L", "location": "Lab A · Cabinet A-03", "expiry_date": "2028-03-14", "hazard_level": "high"},
    {"name": "Acetone", "cas_number": "67-64-1", "category": "Solvent", "safety_classification": "Flammable", "quantity": 3.2, "unit": "L", "location": "Lab B · Flammables F-01", "expiry_date": "2027-05-02", "hazard_level": "medium"},
    {"name": "Sodium Hydroxide", "cas_number": "1310-73-2", "category": "Base", "safety_classification": "Corrosive", "quantity": 8.0, "unit": "kg", "location": "Lab A · Cabinet A-05", "expiry_date": "2029-01-22", "hazard_level": "high"},
    {"name": "Hydrochloric Acid", "cas_number": "7647-01-0", "category": "Acid", "safety_classification": "Corrosive", "quantity": 0, "unit": "L", "location": "Lab A · Cabinet A-03", "expiry_date": "2027-11-08", "hazard_level": "high"},
    {"name": "Ethanol (Absolute)", "cas_number": "64-17-5", "category": "Solvent", "safety_classification": "Flammable", "quantity": 24.0, "unit": "L", "location": "Lab B · Flammables F-02", "expiry_date": "2028-06-18", "hazard_level": "medium"},
    {"name": "Hydrogen Peroxide 30%", "cas_number": "7722-84-1", "category": "Oxidizer", "safety_classification": "Oxidizer", "quantity": 2.4, "unit": "L", "location": "Lab C · Oxidizers O-01", "expiry_date": "2026-09-20", "hazard_level": "high"},
    {"name": "Methanol", "cas_number": "67-56-1", "category": "Solvent", "safety_classification": "Flammable", "quantity": 15.5, "unit": "L", "location": "Lab B · Flammables F-01", "expiry_date": "2028-07-01", "hazard_level": "high"},
    {"name": "Potassium Permanganate", "cas_number": "7722-64-7", "category": "Oxidizer", "safety_classification": "Oxidizer", "quantity": 1.1, "unit": "kg", "location": "Lab C · Oxidizers O-02", "expiry_date": "2027-02-11", "hazard_level": "medium"},
    {"name": "Phosphate Buffered Saline", "cas_number": "7647-14-5", "category": "Buffer", "safety_classification": "Non-Hazardous", "quantity": 40.0, "unit": "L", "location": "Lab D · Shelf D-11", "expiry_date": "2027-06-30", "hazard_level": "low"},
    {"name": "Toluene", "cas_number": "108-88-3", "category": "Solvent", "safety_classification": "Flammable", "quantity": 5.0, "unit": "L", "location": "Lab B · Flammables F-03", "expiry_date": "2026-09-12", "hazard_level": "medium"},
    {"name": "Silver Nitrate", "cas_number": "7761-88-8", "category": "Salt", "safety_classification": "Corrosive", "quantity": 0.25, "unit": "kg", "location": "Lab A · Secure Safe S-01", "expiry_date": "2029-03-30", "hazard_level": "high"},
    {"name": "Acetonitrile", "cas_number": "75-05-8", "category": "Solvent", "safety_classification": "Flammable", "quantity": 9.0, "unit": "L", "location": "Lab B · Flammables F-02", "expiry_date": "2028-07-15", "hazard_level": "high"},
    {"name": "Nitric Acid", "cas_number": "7697-37-2", "category": "Acid", "safety_classification": "Corrosive", "quantity": 6.5, "unit": "L", "location": "Lab A · Cabinet A-04", "expiry_date": "2028-02-26", "hazard_level": "high"},
    {"name": "Sodium Chloride", "cas_number": "7647-14-5", "category": "Salt", "safety_classification": "Non-Hazardous", "quantity": 22.0, "unit": "kg", "location": "Lab D · Shelf D-04", "expiry_date": "2030-04-19", "hazard_level": "low"},
    {"name": "Chloroform", "cas_number": "67-66-3", "category": "Solvent", "safety_classification": "Toxic", "quantity": 1.8, "unit": "L", "location": "Lab C · Fume Hood FH-02", "expiry_date": "2026-09-05", "hazard_level": "high"},
    {"name": "Ammonium Hydroxide", "cas_number": "1336-21-6", "category": "Base", "safety_classification": "Corrosive", "quantity": 4.0, "unit": "L", "location": "Lab A · Cabinet A-06", "expiry_date": "2027-12-04", "hazard_level": "medium"},
    {"name": "Argon (Compressed)", "cas_number": "7440-37-1", "category": "Gas", "safety_classification": "Non-Hazardous", "quantity": 3, "unit": "cyl", "location": "Gas Bay · Rack G-01", "expiry_date": "2028-08-02", "hazard_level": "low"},
    {"name": "Formaldehyde 37%", "cas_number": "50-00-0", "category": "Reagent", "safety_classification": "Toxic", "quantity": 0.9, "unit": "L", "location": "Lab C · Fume Hood FH-01", "expiry_date": "2026-08-16", "hazard_level": "high"},
]


def main() -> None:
    supabase = get_supabase()
    inserted, updated = 0, 0

    for chem in CHEMICALS:
        existing = (
            supabase.table(TABLE)
            .select("id")
            .eq("name", chem["name"])
            .eq("cas_number", chem["cas_number"])
            .limit(1)
            .execute()
        )
        if existing.data:
            row_id = existing.data[0]["id"]
            supabase.table(TABLE).update(chem).eq("id", row_id).execute()
            updated += 1
            print(f"  updated  #{row_id:<4} {chem['name']}")
        else:
            result = supabase.table(TABLE).insert(chem).execute()
            row_id = result.data[0]["id"] if result.data else "?"
            inserted += 1
            print(f"  inserted #{row_id:<4} {chem['name']}")

    print(f"\nDone. {inserted} inserted, {updated} updated.")


if __name__ == "__main__":
    main()
