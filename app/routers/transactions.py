from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.core.supabase_client import get_supabase
from app.schemas.chemical import Chemical
from app.schemas.transaction import Transaction, UsageCreate, UsageResult

router = APIRouter(tags=["transactions"])

TRANSACTIONS_TABLE = "transactions"
CHEMICALS_TABLE = "chemicals"


def _row_to_transaction(row: dict) -> Transaction:
    """Flattens a PostgREST row embedding `chemicals(name, unit)` into a Transaction."""
    row = dict(row)
    chemical = row.pop("chemicals", None) or {}
    return Transaction(
        **row,
        chemical_name=chemical.get("name"),
        unit=chemical.get("unit"),
    )


@router.get("/transactions", response_model=list[Transaction])
def list_transactions():
    supabase = get_supabase()
    try:
        result = (
            supabase.table(TRANSACTIONS_TABLE)
            .select("*, chemicals(name, unit)")
            .order("timestamp", desc=True)
            .order("id", desc=True)
            .execute()
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    return [_row_to_transaction(row) for row in result.data]


@router.post("/chemicals/{chemical_id}/usage", response_model=UsageResult, status_code=201)
def record_usage(chemical_id: int, usage: UsageCreate):
    """Records a chemical usage event: validates stock, deducts it, and logs a transaction."""
    supabase = get_supabase()

    try:
        chem_result = (
            supabase.table(CHEMICALS_TABLE).select("*").eq("id", chemical_id).execute()
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not chem_result.data:
        raise HTTPException(status_code=404, detail=f"Chemical {chemical_id} not found")

    chemical = chem_result.data[0]
    available = chemical.get("quantity")
    if available is None:
        raise HTTPException(
            status_code=400,
            detail="This chemical has no recorded stock quantity yet.",
        )
    if usage.quantity > available:
        unit = chemical.get("unit") or ""
        raise HTTPException(
            status_code=400,
            detail=f"Only {available} {unit} available — cannot use more than what's in stock.".strip(),
        )

    remaining = round(available - usage.quantity, 6)
    timestamp = usage.timestamp or datetime.now(timezone.utc)

    try:
        update_result = (
            supabase.table(CHEMICALS_TABLE)
            .update({"quantity": remaining})
            .eq("id", chemical_id)
            .execute()
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not update_result.data:
        raise HTTPException(status_code=404, detail=f"Chemical {chemical_id} not found")

    updated_chemical = update_result.data[0]

    transaction_payload = {
        "chemical_id": chemical_id,
        "transaction_type": "Dispensed",
        "quantity": usage.quantity,
        "performed_by": usage.performed_by,
        "purpose": usage.purpose,
        "location": chemical.get("location"),
        "notes": usage.notes,
        "timestamp": timestamp.isoformat(),
    }

    try:
        insert_result = supabase.table(TRANSACTIONS_TABLE).insert(transaction_payload).execute()
    except Exception as exc:  # noqa: BLE001
        _restore_quantity(supabase, chemical_id, available)
        raise HTTPException(
            status_code=502, detail=f"Database error while logging transaction: {exc}"
        ) from exc

    if not insert_result.data:
        _restore_quantity(supabase, chemical_id, available)
        raise HTTPException(status_code=502, detail="Insert did not return the created transaction")

    transaction = Transaction(
        **insert_result.data[0],
        chemical_name=chemical.get("name"),
        unit=chemical.get("unit"),
    )

    return UsageResult(transaction=transaction, chemical=Chemical(**updated_chemical))


def _restore_quantity(supabase, chemical_id: int, original_quantity: float) -> None:
    """Best-effort rollback if the transaction couldn't be logged after stock was deducted."""
    try:
        supabase.table(CHEMICALS_TABLE).update({"quantity": original_quantity}).eq(
            "id", chemical_id
        ).execute()
    except Exception:  # noqa: BLE001
        pass
