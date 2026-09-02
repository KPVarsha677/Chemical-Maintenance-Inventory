/**
 * Domain types for the Chemical Inventory Management System frontend.
 *
 * `Chemical` mirrors the shape of the backend's Chemical model (id, name,
 * cas_number, category, safety_classification, quantity, unit, location,
 * expiry_date, hazard_level) plus a couple of mock-only fields
 * (low_stock_threshold) so the client can derive status without a live API.
 *
 * This file intentionally has zero dependency on how the data is fetched, so
 * swapping `lib/mock-data.ts` for real `fetch`/`axios` calls later requires
 * no changes here.
 */

export type HazardLevel = "low" | "medium" | "high" | "extreme";

export type ChemicalCategory =
  | "Acid"
  | "Base"
  | "Solvent"
  | "Oxidizer"
  | "Flammable"
  | "Reagent"
  | "Gas"
  | "Biological"
  | "Salt"
  | "Indicator";

export type SafetyClassification =
  | "Corrosive"
  | "Flammable"
  | "Toxic"
  | "Oxidizer"
  | "Irritant"
  | "Carcinogen"
  | "Compressed Gas"
  | "Non-Hazardous"
  | "Reactive";

export type ChemicalStatus =
  | "usable"
  | "low-stock"
  | "expiring-soon"
  | "expired";

export interface Chemical {
  id: string;
  name: string;
  cas_number: string;
  category: ChemicalCategory;
  safety_classification: SafetyClassification;
  quantity: number;
  unit: string;
  location: string;
  expiry_date: string | null;
  hazard_level: HazardLevel;
  /** Mock-only concept: threshold below which a chemical is "low stock". */
  low_stock_threshold: number;
  manufacturer?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/** A physical container/vessel holding some quantity of a chemical. */
export interface Container {
  id: string;
  chemical_id: string;
  container_label: string;
  location: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
}

export type TransactionType = "received" | "used" | "disposed" | "adjusted";

export interface Transaction {
  id: string;
  chemical_id: string;
  chemical_name: string;
  type: TransactionType;
  quantity_delta: number;
  unit: string;
  date: string;
  user: string;
  notes?: string;
}

export interface ChemicalFormValues {
  name: string;
  cas_number: string;
  category: ChemicalCategory;
  safety_classification: SafetyClassification;
  quantity: number;
  unit: string;
  location: string;
  expiry_date: string | null;
  hazard_level: HazardLevel;
  low_stock_threshold: number;
  manufacturer?: string;
  notes?: string;
}
