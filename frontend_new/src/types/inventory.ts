export type ChemicalCategory =
'Acid' |
'Base' |
'Solvent' |
'Oxidizer' |
'Reagent' |
'Salt' |
'Buffer' |
'Gas';

export type HazardClass =
'Flammable' |
'Corrosive' |
'Toxic' |
'Oxidizing' |
'Irritant' |
'Health Hazard' |
'Non-Hazardous';

export type StockState = 'in-stock' | 'low-stock' | 'out-of-stock';
export type ExpiryState = 'valid' | 'expiring' | 'expired';

export interface Chemical {
  id: string;
  name: string;
  casNumber: string;
  formula: string;
  category: ChemicalCategory;
  hazards: HazardClass[];
  quantity: number;
  unit: string;
  minQuantity: number;
  containerCount: number;
  location: string;
  storage: string;
  supplier: string;
  lotNumber: string;
  grade: string;
  receivedDate: string;
  expiryDate: string;
  unitCost: number;
  custodian: string;
  notes?: string;
  /** Id of the matching row in the backend `chemicals` table, when linked. */
  backendId?: number;
}

export type TransactionType =
'Received' |
'Dispensed' |
'Transferred' |
'Disposed' |
'Adjusted';

export interface Transaction {
  id: string;
  chemicalId: string;
  chemicalName: string;
  type: TransactionType;
  amount: number;
  unit: string;
  user: string;
  location: string;
  timestamp: string;
  reference: string;
  note?: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertKind = 'Expiry' | 'Low Stock' | 'Compliance' | 'Storage';

export interface InventoryAlert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  detail: string;
  chemicalId?: string;
  chemicalName?: string;
  raisedAt: string;
  acknowledged: boolean;
  owner: string;
}