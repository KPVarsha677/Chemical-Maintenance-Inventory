import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { chemicals as seedChemicals } from '../data/chemicals';
import { transactions as seedTransactions } from '../data/transactions';
import { alerts as seedAlerts } from '../data/alerts';
import { Chemical, InventoryAlert, Transaction } from '../types/inventory';
import { formatQuantity } from '../utils/inventory';
import { api, BackendChemical, BackendTransaction } from '../lib/api';
import { useAuth } from './AuthContext';

/** Fallback label for historical transactions with no attributed user. */
const UNKNOWN_USER = 'Unknown user';

export interface RecordUsageInput {
  chemicalId: string;
  quantity: number;
  purpose: string;
  timestamp: string;
  notes?: string;
}

export type RecordUsageResult =
{ ok: true;transaction: Transaction;} |
{ ok: false;error: string;};

interface InventoryContextValue {
  chemicals: Chemical[];
  transactions: Transaction[];
  alerts: InventoryAlert[];
  backendReady: boolean;
  getChemical: (id: string) => Chemical | undefined;
  saveChemical: (chemical: Chemical) => void;
  removeChemical: (id: string) => void;
  recordUsage: (input: RecordUsageInput) => Promise<RecordUsageResult>;
  acknowledgeAlert: (id: string) => void;
  nextId: () => string;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

/** Matches a mock chemical to its backend row by name + CAS number. */
function backendKey(name: string, cas: string | null | undefined): string {
  return `${name.trim().toLowerCase()}|${(cas ?? '').trim().toLowerCase()}`;
}

function mapBackendTransaction(bt: BackendTransaction, chemical: Chemical): Transaction {
  return {
    id: `TXN-${bt.id}`,
    chemicalId: chemical.id,
    chemicalName: chemical.name,
    type: (bt.transaction_type as Transaction['type']) || 'Dispensed',
    amount: bt.quantity,
    unit: bt.unit ?? chemical.unit,
    user: bt.performed_by ?? UNKNOWN_USER,
    location: bt.location ?? chemical.location,
    timestamp: bt.timestamp ?? new Date().toISOString(),
    reference: bt.purpose ?? '',
    note: bt.notes ?? undefined
  };
}

export function InventoryProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const [chemicals, setChemicals] = useState<Chemical[]>(seedChemicals);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [alerts, setAlerts] = useState<InventoryAlert[]>(seedAlerts);
  const [backendReady, setBackendReady] = useState(false);

  // Link mock chemicals to their real backend rows, pull in the persisted
  // quantity, and load any real (previously recorded) usage transactions.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let backendChemicals: BackendChemical[] = [];
      let backendTransactions: BackendTransaction[] = [];

      try {
        backendChemicals = await api.listChemicals();
      } catch (err) {
        console.warn('Could not load chemicals from the backend; using local data only.', err);
      }
      try {
        backendTransactions = await api.listTransactions();
      } catch (err) {
        console.warn('Could not load transactions from the backend.', err);
      }

      if (cancelled || backendChemicals.length === 0) {
        if (!cancelled) setBackendReady(true);
        return;
      }

      const backendByKey = new Map<string, BackendChemical>();
      for (const bc of backendChemicals) {
        backendByKey.set(backendKey(bc.name, bc.cas_number), bc);
      }

      let mergedChemicals: Chemical[] = [];
      setChemicals((prev) => {
        mergedChemicals = prev.map((c) => {
          const match = backendByKey.get(backendKey(c.name, c.casNumber));
          if (!match) return c;
          return {
            ...c,
            backendId: match.id,
            quantity: match.quantity ?? c.quantity
          };
        });
        return mergedChemicals;
      });

      if (backendTransactions.length > 0) {
        const byBackendId = new Map<number, Chemical>();
        for (const c of mergedChemicals) {
          if (c.backendId !== undefined) byBackendId.set(c.backendId, c);
        }

        const mapped = backendTransactions.
        map((bt) => {
          const chemical = byBackendId.get(bt.chemical_id);
          return chemical ? mapBackendTransaction(bt, chemical) : null;
        }).
        filter((t): t is Transaction => t !== null);

        setTransactions((prevSeed) =>
        [...mapped, ...prevSeed].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        );
      }

      if (!cancelled) setBackendReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getChemical = useCallback(
    (id: string) => chemicals.find((c) => c.id === id),
    [chemicals]
  );

  const saveChemical = useCallback((chemical: Chemical) => {
    setChemicals((prev) => {
      const index = prev.findIndex((c) => c.id === chemical.id);
      if (index === -1) return [chemical, ...prev];
      const next = [...prev];
      next[index] = chemical;
      return next;
    });
  }, []);

  const removeChemical = useCallback((id: string) => {
    setChemicals((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) =>
    prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a)
    );
  }, []);

  const nextId = useCallback(() => {
    const highest = chemicals.reduce((max, c) => {
      const n = Number(c.id.replace('CHM-', ''));
      return Number.isFinite(n) && n > max ? n : max;
    }, 1000);
    return `CHM-${highest + 1}`;
  }, [chemicals]);

  const recordUsage = useCallback(
    async (input: RecordUsageInput): Promise<RecordUsageResult> => {
      const chemical = chemicals.find((c) => c.id === input.chemicalId);
      if (!chemical) {
        return { ok: false, error: 'Select a valid chemical before recording usage.' };
      }
      if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
        return { ok: false, error: 'Enter a quantity greater than zero.' };
      }
      if (input.quantity > chemical.quantity) {
        return {
          ok: false,
          error: `Only ${formatQuantity(chemical.quantity, chemical.unit)} available — you can't use more than what's in stock.`
        };
      }
      if (!input.purpose.trim()) {
        return { ok: false, error: 'Enter a purpose or experiment reference.' };
      }
      if (chemical.backendId === undefined) {
        return {
          ok: false,
          error: "This chemical isn't linked to a persisted record yet. Refresh the page and try again."
        };
      }
      if (!user) {
        return { ok: false, error: 'You must be signed in to record usage.' };
      }

      let result;
      try {
        result = await api.recordUsage(chemical.backendId, {
          quantity: input.quantity,
          performed_by: user.fullName,
          purpose: input.purpose.trim(),
          notes: input.notes?.trim() || undefined,
          timestamp: input.timestamp
        });
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Failed to record usage.'
        };
      }

      const transaction = mapBackendTransaction(result.transaction, chemical);

      setChemicals((prev) =>
      prev.map((c) =>
      c.id === chemical.id ?
      { ...c, quantity: result.chemical.quantity ?? c.quantity } :
      c
      )
      );
      setTransactions((prev) => [transaction, ...prev]);

      return { ok: true, transaction };
    },
    [chemicals, user]
  );

  const value = useMemo(
    () => ({
      chemicals,
      transactions,
      alerts,
      backendReady,
      getChemical,
      saveChemical,
      removeChemical,
      recordUsage,
      acknowledgeAlert,
      nextId
    }),
    [
    chemicals,
    transactions,
    alerts,
    backendReady,
    getChemical,
    saveChemical,
    removeChemical,
    recordUsage,
    acknowledgeAlert,
    nextId]

  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>);

}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within an InventoryProvider');
  return ctx;
}
