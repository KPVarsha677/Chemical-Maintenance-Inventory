from fastapi import APIRouter, HTTPException

from app.core.supabase_client import get_supabase
from app.schemas.chemical import Chemical, ChemicalCreate, ChemicalUpdate

router = APIRouter(prefix="/chemicals", tags=["chemicals"])

TABLE = "chemicals"


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


@router.post("", response_model=Chemical, status_code=201)
def create_chemical(chemical: ChemicalCreate):
    supabase = get_supabase()
    try:
        result = supabase.table(TABLE).insert(chemical.model_dump(mode="json")).execute()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc
    if not result.data:
        raise HTTPException(status_code=502, detail="Insert did not return the created row")
    return result.data[0]


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
