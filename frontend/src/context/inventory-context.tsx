import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CHEMICALS, CONTAINERS, TRANSACTIONS } from "@/lib/mock-data";
import type { Chemical, ChemicalFormValues, Container, Transaction } from "@/lib/types";

interface InventoryContextValue {
  chemicals: Chemical[];
  containers: Container[];
  transactions: Transaction[];
  getChemical: (id: string) => Chemical | undefined;
  getContainersForChemical: (id: string) => Container[];
  addChemical: (values: ChemicalFormValues) => Chemical;
  updateChemical: (id: string, values: ChemicalFormValues) => Chemical | undefined;
  deleteChemical: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

let nextIdCounter = CHEMICALS.length + 1;

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [chemicals, setChemicals] = useState<Chemical[]>(CHEMICALS);
  // Containers and transactions are mock/read-only reference data for this
  // iteration of the frontend (no add/edit UI for them yet).
  const [containers] = useState<Container[]>(CONTAINERS);
  const [transactions] = useState<Transaction[]>(TRANSACTIONS);

  const getChemical = useCallback(
    (id: string) => chemicals.find((c) => c.id === id),
    [chemicals],
  );

  const getContainersForChemical = useCallback(
    (id: string) => containers.filter((c) => c.chemical_id === id),
    [containers],
  );

  const addChemical = useCallback((values: ChemicalFormValues) => {
    const now = new Date().toISOString();
    const chemical: Chemical = {
      ...values,
      id: `chem-new-${nextIdCounter++}`,
      created_at: now,
      updated_at: now,
    };
    setChemicals((prev) => [chemical, ...prev]);
    return chemical;
  }, []);

  const updateChemical = useCallback((id: string, values: ChemicalFormValues) => {
    let updated: Chemical | undefined;
    setChemicals((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...values, updated_at: new Date().toISOString() };
        return updated;
      }),
    );
    return updated;
  }, []);

  const deleteChemical = useCallback((id: string) => {
    setChemicals((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      chemicals,
      containers,
      transactions,
      getChemical,
      getContainersForChemical,
      addChemical,
      updateChemical,
      deleteChemical,
    }),
    [
      chemicals,
      containers,
      transactions,
      getChemical,
      getContainersForChemical,
      addChemical,
      updateChemical,
      deleteChemical,
    ],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within an InventoryProvider");
  return ctx;
}
