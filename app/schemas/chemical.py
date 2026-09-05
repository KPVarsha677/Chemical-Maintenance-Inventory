from datetime import date

from pydantic import BaseModel


class ChemicalBase(BaseModel):
    name: str
    cas_number: str | None = None
    category: str | None = None
    safety_classification: str | None = None
    quantity: float | None = None
    unit: str | None = None
    location: str | None = None
    expiry_date: date | None = None
    hazard_level: str | None = None


class ChemicalCreate(ChemicalBase):
    # Not stored on the chemicals row; used only to attribute the initial
    # "Received" transaction logged when a positive quantity is supplied.
    performed_by: str | None = None


class ChemicalUpdate(BaseModel):
    name: str | None = None
    cas_number: str | None = None
    category: str | None = None
    safety_classification: str | None = None
    quantity: float | None = None
    unit: str | None = None
    location: str | None = None
    expiry_date: date | None = None
    hazard_level: str | None = None


class Chemical(ChemicalBase):
    id: int
