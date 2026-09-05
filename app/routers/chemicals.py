from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.core.supabase_client import get_supabase
from app.schemas.chemical import Chemical, ChemicalCreate, ChemicalUpdate
from app.schemas.transaction import ChemicalCreateResult, Transaction

router = APIRouter(prefix="/chemicals", tags=["chemicals"])

TABLE = "chemicals"
TRANSACTIONS_TABLE = "transactions"


@router.get("", response_model=list[Chemical])
def list_chemicals():
    supabase = get_supabase()
    try:
        result = supabase.table(TABLE).select("*").order("id").execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    return result.data


@router.get("/{chemical_id}", response_model=Chemical)
def get_chemical(chemical_id: int):
    supabase = get_supabase()
    try:
        result = supabase.table(TABLE).select("*").eq("id", chemical_id).execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Chemical {chemical_id} not found")
    return result.data[0]


@router.post("", response_model=ChemicalCreateResult, status_code=201)
def create_chemical(chemical: ChemicalCreate):
    """Creates a chemical and, when given a positive initial quantity, logs a
    matching "Received" transaction so the stock has an audit trail from day one."""
    supabase = get_supabase()
    payload = chemical.model_dump(mode="json", exclude={"performed_by"})
    try:
        result = supabase.table(TABLE).insert(payload).execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not result.data:
        raise HTTPException(status_code=502, detail="Insert did not return the created row")

    created = result.data[0]
    transaction: Transaction | None = None

    if created.get("quantity"):
        transaction_payload = {
            "chemical_id": created["id"],
            "transaction_type": "Received",
            "quantity": created["quantity"],
            "performed_by": chemical.performed_by,
            "purpose": "Initial stock",
            "location": created.get("location"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        try:
            insert_result = (
                supabase.table(TRANSACTIONS_TABLE).insert(transaction_payload).execute()
            )
        except Exception as exc:  # noqa: BLE001
            _delete_chemical(supabase, created["id"])
            raise HTTPException(
                status_code=502, detail=f"Database error while logging transaction: {exc}"
            ) from exc
        if not insert_result.data:
            _delete_chemical(supabase, created["id"])
            raise HTTPException(
                status_code=502, detail="Insert did not return the created transaction"
            )

        transaction = Transaction(
            **insert_result.data[0],
            chemical_name=created.get("name"),
            unit=created.get("unit"),
        )

    return ChemicalCreateResult(chemical=Chemical(**created), transaction=transaction)


def _delete_chemical(supabase, chemical_id: int) -> None:
    """Best-effort rollback if the initial "Received" transaction couldn't be logged."""
    try:
        supabase.table(TABLE).delete().eq("id", chemical_id).execute()
    except Exception:  # noqa: BLE001
        pass


@router.put("/{chemical_id}", response_model=Chemical)
def update_chemical(chemical_id: int, chemical: ChemicalUpdate):
    supabase = get_supabase()
    updates = chemical.model_dump(mode="json", exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    try:
        result = supabase.table(TABLE).update(updates).eq("id", chemical_id).execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Chemical {chemical_id} not found")
    return result.data[0]


@router.delete("/{chemical_id}", status_code=204)
def delete_chemical(chemical_id: int):
    supabase = get_supabase()
    try:
        result = supabase.table(TABLE).delete().eq("id", chemical_id).execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Chemical {chemical_id} not found")
    return None
