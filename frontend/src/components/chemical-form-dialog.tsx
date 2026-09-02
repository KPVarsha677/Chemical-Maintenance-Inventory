import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  HAZARD_LEVELS,
  SAFETY_CLASSIFICATIONS,
  UNITS,
} from "@/lib/mock-data";
import { useInventory } from "@/context/inventory-context";
import type { Chemical, ChemicalFormValues } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

const EMPTY_FORM: ChemicalFormValues = {
  name: "",
  cas_number: "",
  category: "Reagent",
  safety_classification: "Non-Hazardous",
  quantity: 0,
  unit: "mL",
  location: "",
  expiry_date: null,
  hazard_level: "low",
  low_stock_threshold: 0,
  manufacturer: "",
  notes: "",
};

const CAS_PATTERN = /^(N\/A|\d{2,7}-\d{2}-\d)$/i;

type FormErrors = Partial<Record<keyof ChemicalFormValues, string>>;

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function ChemicalFormDialog({
  open,
  onOpenChange,
  chemical,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When present, the dialog edits this chemical; otherwise it creates one. */
  chemical?: Chemical;
  onSaved?: (chemical: Chemical) => void;
}) {
  const { addChemical, updateChemical } = useInventory();
  const isEdit = Boolean(chemical);

  const [values, setValues] = useState<ChemicalFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(chemical ? { ...chemical } : EMPTY_FORM);
      setErrors({});
      setJustSaved(false);
    }
  }, [open, chemical]);

  function set<K extends keyof ChemicalFormValues>(key: K, value: ChemicalFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(v: ChemicalFormValues): FormErrors {
    const next: FormErrors = {};
    if (!v.name.trim()) next.name = "Name is required.";
    if (!v.cas_number.trim()) next.cas_number = "CAS number is required.";
    else if (!CAS_PATTERN.test(v.cas_number.trim()))
      next.cas_number = 'Use CAS format like "7664-93-9", or "N/A".';
    if (!v.location.trim()) next.location = "Location is required.";
    if (!v.unit.trim()) next.unit = "Unit is required.";
    if (v.quantity === null || v.quantity === undefined || Number.isNaN(v.quantity))
      next.quantity = "Quantity must be a number.";
    else if (v.quantity < 0) next.quantity = "Quantity cannot be negative.";
    if (
      v.low_stock_threshold === null ||
      v.low_stock_threshold === undefined ||
      Number.isNaN(v.low_stock_threshold)
    )
      next.low_stock_threshold = "Threshold must be a number.";
    else if (v.low_stock_threshold < 0) next.low_stock_threshold = "Threshold cannot be negative.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const cleaned: ChemicalFormValues = {
      ...values,
      expiry_date: values.expiry_date || null,
      manufacturer: values.manufacturer?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };

    const saved =
      isEdit && chemical
        ? updateChemical(chemical.id, cleaned)
        : addChemical(cleaned);

    setJustSaved(true);
    if (saved) onSaved?.(saved);
    setTimeout(() => {
      onOpenChange(false);
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Chemical" : "Add Chemical"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this chemical's record. Changes are kept in memory only."
              : "Add a new chemical to the mock inventory. Changes are kept in memory only."}
          </DialogDescription>
        </DialogHeader>

        {justSaved ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-7" strokeWidth={1.75} />
            </div>
            <p className="font-medium text-foreground">
              {isEdit ? "Chemical updated" : "Chemical added"}
            </p>
            <p className="text-sm text-muted-foreground">Closing…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Identification">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  placeholder="e.g. Sulfuric Acid"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cas">CAS Number *</Label>
                <Input
                  id="cas"
                  value={values.cas_number}
                  onChange={(e) => set("cas_number", e.target.value)}
                  aria-invalid={Boolean(errors.cas_number)}
                  placeholder="7664-93-9"
                  className="font-mono"
                />
                {errors.cas_number && (
                  <p className="text-xs text-destructive">{errors.cas_number}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={values.manufacturer ?? ""}
                  onChange={(e) => set("manufacturer", e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </FormSection>

            <div className="h-px w-full bg-border" />

            <FormSection title="Classification & Safety">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={values.category} onValueChange={(v) => set("category", v as ChemicalFormValues["category"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Safety Classification *</Label>
                <Select
                  value={values.safety_classification}
                  onValueChange={(v) =>
                    set("safety_classification", v as ChemicalFormValues["safety_classification"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SAFETY_CLASSIFICATIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Hazard Level *</Label>
                <Select
                  value={values.hazard_level}
                  onValueChange={(v) => set("hazard_level", v as ChemicalFormValues["hazard_level"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HAZARD_LEVELS.map((h) => (
                      <SelectItem key={h} value={h} className="capitalize">
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormSection>

            <div className="h-px w-full bg-border" />

            <FormSection title="Stock & Location">
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  value={values.quantity}
                  onChange={(e) => set("quantity", e.target.valueAsNumber)}
                  aria-invalid={Boolean(errors.quantity)}
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Unit *</Label>
                <Select value={values.unit} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="threshold">Low Stock Threshold *</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="any"
                  value={values.low_stock_threshold}
                  onChange={(e) => set("low_stock_threshold", e.target.valueAsNumber)}
                  aria-invalid={Boolean(errors.low_stock_threshold)}
                />
                {errors.low_stock_threshold && (
                  <p className="text-xs text-destructive">{errors.low_stock_threshold}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={values.expiry_date ?? ""}
                  onChange={(e) => set("expiry_date", e.target.value || null)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="location">Primary Location *</Label>
                <Input
                  id="location"
                  value={values.location}
                  onChange={(e) => set("location", e.target.value)}
                  aria-invalid={Boolean(errors.location)}
                  placeholder="e.g. Lab 2, Shelf 3"
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location}</p>
                )}
              </div>
            </FormSection>

            <div className="h-px w-full bg-border" />

            <FormSection title="Additional Details">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={values.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Optional handling notes, restrictions, etc."
                  rows={3}
                />
              </div>
            </FormSection>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save Changes" : "Add Chemical"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
