/**
 * Local mock data for the Chemical Inventory Management System frontend.
 *
 * Everything here is synthetic and in-memory only. No network calls are made
 * anywhere in this module. Field names deliberately mirror the backend's
 * Chemical model (id, name, cas_number, category, safety_classification,
 * quantity, unit, location, expiry_date, hazard_level) so this module can
 * later be swapped for real API calls (e.g. `fetch("/api/chemicals")`)
 * without touching the components that consume it.
 */
import type {
  Chemical,
  Container,
  Transaction,
  ChemicalCategory,
  SafetyClassification,
  HazardLevel,
} from "@/lib/types";

/** ISO date string `offsetDays` from today (negative = past). */
function isoDaysFromNow(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(offsetDays: number): string {
  return isoDaysFromNow(-offsetDays);
}

interface ChemicalSeed {
  name: string;
  cas_number: string;
  category: ChemicalCategory;
  safety_classification: SafetyClassification;
  quantity: number;
  unit: string;
  location: string;
  expiryOffsetDays: number | null;
  hazard_level: HazardLevel;
  low_stock_threshold: number;
  manufacturer?: string;
  notes?: string;
}

// Offsets are chosen deliberately to produce a realistic mix of statuses:
// expired (< 0), expiring soon (0-30), low stock (qty <= threshold, far expiry),
// and plainly usable chemicals.
const CHEMICAL_SEEDS: ChemicalSeed[] = [
  { name: "Sulfuric Acid", cas_number: "7664-93-9", category: "Acid", safety_classification: "Corrosive", quantity: 2500, unit: "mL", location: "Lab 1, Acid Cabinet", expiryOffsetDays: 540, hazard_level: "high", low_stock_threshold: 500, manufacturer: "Sigma-Aldrich" },
  { name: "Hydrochloric Acid", cas_number: "7647-01-0", category: "Acid", safety_classification: "Corrosive", quantity: 300, unit: "mL", location: "Lab 1, Acid Cabinet", expiryOffsetDays: 12, hazard_level: "high", low_stock_threshold: 500, manufacturer: "Fisher Scientific" },
  { name: "Sodium Hydroxide", cas_number: "1310-73-2", category: "Base", safety_classification: "Corrosive", quantity: 1200, unit: "g", location: "Lab 2, Base Shelf", expiryOffsetDays: 720, hazard_level: "medium", low_stock_threshold: 250 },
  { name: "Potassium Hydroxide", cas_number: "1310-58-3", category: "Base", safety_classification: "Corrosive", quantity: 90, unit: "g", location: "Lab 2, Base Shelf", expiryOffsetDays: 400, hazard_level: "medium", low_stock_threshold: 100 },
  { name: "Acetone", cas_number: "67-64-1", category: "Solvent", safety_classification: "Flammable", quantity: 4000, unit: "mL", location: "Solvent Storage, Flammables Cabinet", expiryOffsetDays: 365, hazard_level: "medium", low_stock_threshold: 1000 },
  { name: "Ethanol", cas_number: "64-17-5", category: "Solvent", safety_classification: "Flammable", quantity: 800, unit: "mL", location: "Solvent Storage, Flammables Cabinet", expiryOffsetDays: 25, hazard_level: "medium", low_stock_threshold: 500 },
  { name: "Methanol", cas_number: "67-56-1", category: "Solvent", safety_classification: "Toxic", quantity: 150, unit: "mL", location: "Solvent Storage, Flammables Cabinet", expiryOffsetDays: 200, hazard_level: "high", low_stock_threshold: 500 },
  { name: "Isopropyl Alcohol", cas_number: "67-63-0", category: "Solvent", safety_classification: "Flammable", quantity: 2200, unit: "mL", location: "Lab 3, Bench Shelf", expiryOffsetDays: 300, hazard_level: "low", low_stock_threshold: 400 },
  { name: "Hydrogen Peroxide", cas_number: "7722-84-1", category: "Oxidizer", safety_classification: "Oxidizer", quantity: 500, unit: "mL", location: "Lab 1, Oxidizer Cabinet", expiryOffsetDays: 8, hazard_level: "medium", low_stock_threshold: 200 },
  { name: "Potassium Permanganate", cas_number: "7722-64-7", category: "Oxidizer", safety_classification: "Oxidizer", quantity: 45, unit: "g", location: "Lab 1, Oxidizer Cabinet", expiryOffsetDays: 900, hazard_level: "high", low_stock_threshold: 50 },
  { name: "Toluene", cas_number: "108-88-3", category: "Flammable", safety_classification: "Flammable", quantity: 1800, unit: "mL", location: "Solvent Storage, Flammables Cabinet", expiryOffsetDays: 450, hazard_level: "high", low_stock_threshold: 500 },
  { name: "Diethyl Ether", cas_number: "60-29-7", category: "Flammable", safety_classification: "Flammable", quantity: 120, unit: "mL", location: "Solvent Storage, Flammables Cabinet", expiryOffsetDays: -15, hazard_level: "extreme", low_stock_threshold: 300 },
  { name: "Benzene", cas_number: "71-43-2", category: "Flammable", safety_classification: "Carcinogen", quantity: 60, unit: "mL", location: "Lab 1, Restricted Cabinet", expiryOffsetDays: -60, hazard_level: "extreme", low_stock_threshold: 200 },
  { name: "Sodium Chloride", cas_number: "7647-14-5", category: "Salt", safety_classification: "Non-Hazardous", quantity: 5000, unit: "g", location: "Lab 3, General Shelf", expiryOffsetDays: null, hazard_level: "low", low_stock_threshold: 500 },
  { name: "Potassium Chloride", cas_number: "7447-40-7", category: "Salt", safety_classification: "Non-Hazardous", quantity: 320, unit: "g", location: "Lab 3, General Shelf", expiryOffsetDays: 800, hazard_level: "low", low_stock_threshold: 250 },
  { name: "Silver Nitrate", cas_number: "7761-88-8", category: "Reagent", safety_classification: "Corrosive", quantity: 25, unit: "g", location: "Lab 2, Reagent Cabinet", expiryOffsetDays: 600, hazard_level: "medium", low_stock_threshold: 25 },
  { name: "Phenolphthalein Solution", cas_number: "77-09-8", category: "Indicator", safety_classification: "Irritant", quantity: 40, unit: "mL", location: "Lab 2, Indicator Shelf", expiryOffsetDays: 22, hazard_level: "low", low_stock_threshold: 50 },
  { name: "Litmus Solution", cas_number: "1393-92-6", category: "Indicator", safety_classification: "Non-Hazardous", quantity: 75, unit: "mL", location: "Lab 2, Indicator Shelf", expiryOffsetDays: 150, hazard_level: "low", low_stock_threshold: 50 },
  { name: "Ammonium Hydroxide", cas_number: "1336-21-6", category: "Base", safety_classification: "Corrosive", quantity: 180, unit: "mL", location: "Lab 1, Acid Cabinet", expiryOffsetDays: -3, hazard_level: "high", low_stock_threshold: 200 },
  { name: "Nitric Acid", cas_number: "7697-37-2", category: "Acid", safety_classification: "Oxidizer", quantity: 400, unit: "mL", location: "Lab 1, Acid Cabinet", expiryOffsetDays: 250, hazard_level: "extreme", low_stock_threshold: 300 },
  { name: "Acetic Acid, Glacial", cas_number: "64-19-7", category: "Acid", safety_classification: "Corrosive", quantity: 90, unit: "mL", location: "Lab 1, Acid Cabinet", expiryOffsetDays: 5, hazard_level: "medium", low_stock_threshold: 200 },
  { name: "Formaldehyde Solution", cas_number: "50-00-0", category: "Reagent", safety_classification: "Carcinogen", quantity: 15, unit: "mL", location: "Lab 2, Restricted Cabinet", expiryOffsetDays: -120, hazard_level: "extreme", low_stock_threshold: 100 },
  { name: "Calcium Carbonate", cas_number: "471-34-1", category: "Salt", safety_classification: "Non-Hazardous", quantity: 2000, unit: "g", location: "Lab 3, General Shelf", expiryOffsetDays: null, hazard_level: "low", low_stock_threshold: 300 },
  { name: "Nitrogen, Compressed", cas_number: "7727-37-9", category: "Gas", safety_classification: "Compressed Gas", quantity: 2, unit: "cylinders", location: "Gas Storage Room", expiryOffsetDays: 1000, hazard_level: "medium", low_stock_threshold: 1 },
  { name: "Acetylene", cas_number: "74-86-2", category: "Gas", safety_classification: "Flammable", quantity: 1, unit: "cylinders", location: "Gas Storage Room", expiryOffsetDays: 730, hazard_level: "extreme", low_stock_threshold: 1 },
  { name: "E. coli Culture (Non-Pathogenic)", cas_number: "N/A", category: "Biological", safety_classification: "Irritant", quantity: 10, unit: "vials", location: "Cold Room, Fridge 2", expiryOffsetDays: 18, hazard_level: "medium", low_stock_threshold: 5 },
  { name: "Copper(II) Sulfate", cas_number: "7758-98-7", category: "Salt", safety_classification: "Irritant", quantity: 600, unit: "g", location: "Lab 3, General Shelf", expiryOffsetDays: 500, hazard_level: "low", low_stock_threshold: 150 },
  { name: "Xylene", cas_number: "1330-20-7", category: "Solvent", safety_classification: "Flammable", quantity: 30, unit: "mL", location: "Solvent Storage, Flammables Cabinet", expiryOffsetDays: -5, hazard_level: "high", low_stock_threshold: 300 },
];

function slugId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

export const CHEMICALS: Chemical[] = CHEMICAL_SEEDS.map((seed, i) => ({
  id: slugId("chem", i),
  name: seed.name,
  cas_number: seed.cas_number,
  category: seed.category,
  safety_classification: seed.safety_classification,
  quantity: seed.quantity,
  unit: seed.unit,
  location: seed.location,
  expiry_date:
    seed.expiryOffsetDays === null ? null : isoDaysFromNow(seed.expiryOffsetDays),
  hazard_level: seed.hazard_level,
  low_stock_threshold: seed.low_stock_threshold,
  manufacturer: seed.manufacturer,
  notes: seed.notes,
  created_at: isoDaysAgo(400 - (i % 30) * 5),
  updated_at: isoDaysAgo((i % 14) + 1),
}));

// --- Containers -------------------------------------------------------
// Each chemical is split across 1-3 containers so the details page can show
// a real per-container / per-location breakdown that (roughly) sums to the
// chemical's headline quantity.
function buildContainers(): Container[] {
  const containers: Container[] = [];
  const labels = ["Bottle A", "Bottle B", "Drum C", "Carboy D", "Flask E", "Cylinder F"];
  const subLocations = ["Shelf 1", "Shelf 2", "Shelf 3", "Cabinet Bay 1", "Cabinet Bay 2", "Fridge Rack"];

  CHEMICALS.forEach((chem, ci) => {
    const containerCount = 1 + (ci % 3); // 1, 2, or 3 containers
    let remaining = chem.quantity;
    for (let k = 0; k < containerCount; k++) {
      const isLast = k === containerCount - 1;
      const portion = isLast
        ? remaining
        : Math.max(1, Math.round((chem.quantity / containerCount) * (0.7 + 0.3 * ((k + ci) % 3))));
      const qty = isLast ? remaining : Math.min(portion, remaining);
      remaining -= qty;

      // Give a couple of containers their own (sometimes sooner) expiry so
      // the details page can show containers at differing statuses.
      const expiryJitter = (k * 37 + ci * 11) % 5 === 0 ? -4 : (k * 13) % 90;
      const expiry =
        chem.expiry_date === null
          ? null
          : isoDaysFromNow(
              Math.round(
                (new Date(chem.expiry_date).getTime() - Date.now()) / 86400000,
              ) + (k === 0 ? 0 : expiryJitter - 20),
            );

      containers.push({
        id: `${chem.id}-c${k + 1}`,
        chemical_id: chem.id,
        container_label: `${labels[(ci + k) % labels.length]} ${k + 1}`,
        location: `${chem.location.split(",")[0]}, ${subLocations[(ci + k) % subLocations.length]}`,
        quantity: Math.max(0, qty),
        unit: chem.unit,
        expiry_date: expiry,
      });
    }
  });

  return containers;
}

export const CONTAINERS: Container[] = buildContainers();

export function getContainersForChemical(chemicalId: string): Container[] {
  return CONTAINERS.filter((c) => c.chemical_id === chemicalId);
}

// --- Transactions -------------------------------------------------------
const TRANSACTION_USERS = [
  "A. Rao",
  "J. Chen",
  "M. Alvarez",
  "S. Okafor",
  "T. Nguyen",
  "R. Patel",
];

const TRANSACTION_TYPES: Transaction["type"][] = [
  "received",
  "used",
  "disposed",
  "adjusted",
];

function buildTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  let idCounter = 0;

  CHEMICALS.forEach((chem, ci) => {
    const txCount = 2 + (ci % 4); // 2-5 transactions per chemical
    for (let t = 0; t < txCount; t++) {
      const type = TRANSACTION_TYPES[(ci + t) % TRANSACTION_TYPES.length];
      const daysAgo = t * 17 + (ci % 10) + 1;
      const magnitude = Math.max(1, Math.round(chem.quantity * (0.05 + 0.03 * t)));
      const delta =
        type === "received"
          ? magnitude
          : type === "adjusted"
            ? (t % 2 === 0 ? magnitude : -magnitude)
            : -magnitude;

      const notesByType: Record<Transaction["type"], string> = {
        received: "New stock received from supplier.",
        used: "Consumed for lab procedure.",
        disposed: "Disposed per waste protocol.",
        adjusted: "Inventory count correction.",
      };

      transactions.push({
        id: `txn-${String(++idCounter).padStart(4, "0")}`,
        chemical_id: chem.id,
        chemical_name: chem.name,
        type,
        quantity_delta: delta,
        unit: chem.unit,
        date: isoDaysAgo(daysAgo),
        user: TRANSACTION_USERS[(ci + t) % TRANSACTION_USERS.length],
        notes: notesByType[type],
      });
    }
  });

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export const TRANSACTIONS: Transaction[] = buildTransactions();

export const CATEGORIES: ChemicalCategory[] = Array.from(
  new Set(CHEMICALS.map((c) => c.category)),
).sort() as ChemicalCategory[];

export const HAZARD_LEVELS: HazardLevel[] = ["low", "medium", "high", "extreme"];

export const SAFETY_CLASSIFICATIONS: SafetyClassification[] = [
  "Corrosive",
  "Flammable",
  "Toxic",
  "Oxidizer",
  "Irritant",
  "Carcinogen",
  "Compressed Gas",
  "Non-Hazardous",
  "Reactive",
];

export const UNITS = ["mL", "L", "g", "kg", "vials", "cylinders"];
