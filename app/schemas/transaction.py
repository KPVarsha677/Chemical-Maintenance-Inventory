from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.chemical import Chemical


class TransactionBase(BaseModel):
    chemical_id: int
    container_id: int | None = None
    transaction_type: str
    quantity: float
    performed_by: str | None = None
    purpose: str | None = None
    location: str | None = None
    notes: str | None = None
    timestamp: datetime | None = None


class Transaction(TransactionBase):
    id: int
    # Denormalized for the frontend's convenience (joined from `chemicals` at read time).
    chemical_name: str | None = None
    unit: str | None = None


class UsageCreate(BaseModel):
    quantity: float = Field(gt=0, description="Amount used; must be greater than zero.")
    performed_by: str = Field(min_length=1, description="Who is logging this usage.")
    purpose: str = Field(min_length=1, description="Purpose or experiment reference.")
    notes: str | None = None
    timestamp: datetime | None = None


class UsageResult(BaseModel):
    """Returned after recording usage: the audit record plus the chemical's new stock level."""

    transaction: Transaction
    chemical: Chemical
