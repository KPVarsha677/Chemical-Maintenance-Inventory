import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, TriangleAlertIcon } from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import {
  Field,
  FormSection,
  SelectInput,
  TextArea,
  TextInput } from
'../components/ui/FormField';
import { useInventory } from '../contexts/InventoryContext';
import { Chemical, ChemicalCategory, HazardClass } from '../types/inventory';

const categories: ChemicalCategory[] = [
'Acid',
'Base',
'Solvent',
'Oxidizer',
'Reagent',
'Salt',
'Buffer',
'Gas'];


const hazardOptions: HazardClass[] = [
'Flammable',
'Corrosive',
'Toxic',
'Oxidizing',
'Irritant',
'Health Hazard',
'Non-Hazardous'];


const units = ['L', 'mL', 'kg', 'g', 'cyl'];

const emptyChemical = (id: string): Chemical => ({
  id,
  name: '',
  casNumber: '',
  formula: '',
  category: 'Reagent',
  hazards: [],
  quantity: 0,
  unit: 'L',
  minQuantity: 0,
  containerCount: 1,
  location: '',
  storage: '',
  supplier: '',
  lotNumber: '',
  grade: '',
  receivedDate: '2026-08-31',
  expiryDate: '',
  unitCost: 0,
  custodian: '',
  notes: ''
});

export function ChemicalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getChemical, saveChemical, nextId } = useInventory();
  const editing = Boolean(id);
  const existing = id ? getChemical(id) : undefined;

  const [draft, setDraft] = useState<Chemical>(
    () => existing ?? emptyChemical(nextId())
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Chemical,>(key: K, value: Chemical[K]) =>
  setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleHazard = (hazard: HazardClass) =>
  setDraft((prev) => ({
    ...prev,
    hazards: prev.hazards.includes(hazard) ?
    prev.hazards.filter((h) => h !== hazard) :
    [...prev.hazards, hazard]
  }));

  const belowMinimum = useMemo(
    () => draft.quantity > 0 && draft.quantity <= draft.minQuantity,
    [draft.quantity, draft.minQuantity]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Chemical name is required';
    if (!/^\d{2,7}-\d{2}-\d$/.test(draft.casNumber.trim()))
    next.casNumber = 'Enter a valid CAS number, e.g. 7664-93-9';
    if (!draft.location.trim()) next.location = 'Storage location is required';
    if (!draft.expiryDate) next.expiryDate = 'Expiry date is required';
    if (draft.hazards.length === 0) next.hazards = 'Select at least one hazard class';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    saveChemical(draft);
    navigate(`/inventory/${draft.id}`);
  };

  if (editing && !existing) {
    return (
      <div className="mx-auto w-full max-w-2xl py-20 text-center">
        <h1 className="text-lg font-semibold text-navy-900">Record unavailable</h1>
        <p className="mt-1 text-sm text-slate-500">
          {id} could not be found in the register.
        </p>
        <Button className="mt-4" onClick={() => navigate('/inventory')}>
          Back to inventory
        </Button>
      </div>);

  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        to={editing ? `/inventory/${id}` : '/inventory'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 ease-out hover:text-navy-900">
        
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {editing ? 'Back to record' : 'Chemical register'}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {editing ? `Edit ${existing?.name}` : 'Add chemical to register'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {editing ?
          'Changes are logged against the compliance audit trail.' :
          'Record identification, holding and safety details for the new substance.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Panel>
          <FormSection
            title="Identification"
            description="How the substance is catalogued and referenced.">
            
            <Field
              label="Chemical name"
              htmlFor="name"
              required
              error={errors.name}
              className="sm:col-span-2">
              
              <TextInput
                id="name"
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Sulfuric Acid" />
              
            </Field>
            <Field label="CAS number" htmlFor="cas" required error={errors.casNumber}>
              <TextInput
                id="cas"
                value={draft.casNumber}
                onChange={(e) => set('casNumber', e.target.value)}
                placeholder="7664-93-9"
                className="font-mono" />
              
            </Field>
            <Field label="Molecular formula" htmlFor="formula">
              <TextInput
                id="formula"
                value={draft.formula}
                onChange={(e) => set('formula', e.target.value)}
                placeholder="H₂SO₄"
                className="font-mono" />
              
            </Field>
            <Field label="Category" htmlFor="category">
              <SelectInput
                id="category"
                value={draft.category}
                onChange={(e) => set('category', e.target.value as ChemicalCategory)}>
                
                {categories.map((c) =>
                <option key={c} value={c}>
                    {c}
                  </option>
                )}
              </SelectInput>
            </Field>
            <Field label="Grade / purity" htmlFor="grade">
              <TextInput
                id="grade"
                value={draft.grade}
                onChange={(e) => set('grade', e.target.value)}
                placeholder="ACS Reagent, 95–98%" />
              
            </Field>
          </FormSection>

          <FormSection
            title="Hazard classification"
            description="GHS classes drive storage segregation rules and alerting.">
            
            <div className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {hazardOptions.map((h) => {
                  const active = draft.hazards.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleHazard(h)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                      active ?
                      'border-brand-600 bg-brand-50 text-brand-800' :
                      'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-navy-800'}`
                      }>
                      
                      {h}
                    </button>);

                })}
              </div>
              {errors.hazards &&
              <p className="mt-2 text-xs text-rose-600">{errors.hazards}</p>
              }
            </div>
          </FormSection>

          <FormSection
            title="Quantity & thresholds"
            description="Sets the reorder point that feeds low-stock alerts.">
            
            <Field label="Quantity on hand" htmlFor="quantity">
              <TextInput
                id="quantity"
                type="number"
                min={0}
                step="0.01"
                value={draft.quantity}
                onChange={(e) => set('quantity', Number(e.target.value))}
                className="tabular" />
              
            </Field>
            <Field label="Unit" htmlFor="unit">
              <SelectInput
                id="unit"
                value={draft.unit}
                onChange={(e) => set('unit', e.target.value)}>
                
                {units.map((u) =>
                <option key={u} value={u}>
                    {u}
                  </option>
                )}
              </SelectInput>
            </Field>
            <Field
              label="Minimum threshold"
              htmlFor="min"
              hint="Alerts trigger at or below this level.">
              
              <TextInput
                id="min"
                type="number"
                min={0}
                step="0.01"
                value={draft.minQuantity}
                onChange={(e) => set('minQuantity', Number(e.target.value))}
                className="tabular" />
              
            </Field>
            <Field label="Container count" htmlFor="containers">
              <TextInput
                id="containers"
                type="number"
                min={0}
                value={draft.containerCount}
                onChange={(e) => set('containerCount', Number(e.target.value))}
                className="tabular" />
              
            </Field>
            {belowMinimum &&
            <div className="sm:col-span-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                <TriangleAlertIcon
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                aria-hidden="true" />
              
                <p className="text-xs text-amber-800">
                  This quantity is at or below the minimum threshold — saving will raise a
                  low-stock alert for the custodian.
                </p>
              </div>
            }
          </FormSection>

          <FormSection
            title="Storage & custody"
            description="Physical location, conditions and the responsible owner.">
            
            <Field
              label="Location"
              htmlFor="location"
              required
              error={errors.location}
              hint="Format: Lab A · Cabinet A-03">
              
              <TextInput
                id="location"
                value={draft.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Lab A · Cabinet A-03" />
              
            </Field>
            <Field label="Storage conditions" htmlFor="storage">
              <TextInput
                id="storage"
                value={draft.storage}
                onChange={(e) => set('storage', e.target.value)}
                placeholder="Corrosives cabinet, ventilated" />
              
            </Field>
            <Field label="Custodian" htmlFor="custodian">
              <TextInput
                id="custodian"
                value={draft.custodian}
                onChange={(e) => set('custodian', e.target.value)}
                placeholder="Dr. Elena Vasquez" />
              
            </Field>
            <Field label="Supplier" htmlFor="supplier">
              <TextInput
                id="supplier"
                value={draft.supplier}
                onChange={(e) => set('supplier', e.target.value)}
                placeholder="Sigma-Aldrich" />
              
            </Field>
          </FormSection>

          <FormSection
            title="Lifecycle & cost"
            description="Lot traceability, shelf life and valuation inputs.">
            
            <Field label="Lot number" htmlFor="lot">
              <TextInput
                id="lot"
                value={draft.lotNumber}
                onChange={(e) => set('lotNumber', e.target.value)}
                className="font-mono"
                placeholder="SA-2261-04" />
              
            </Field>
            <Field label="Unit cost (USD)" htmlFor="cost">
              <TextInput
                id="cost"
                type="number"
                min={0}
                step="0.01"
                value={draft.unitCost}
                onChange={(e) => set('unitCost', Number(e.target.value))}
                className="tabular" />
              
            </Field>
            <Field label="Received date" htmlFor="received">
              <TextInput
                id="received"
                type="date"
                value={draft.receivedDate}
                onChange={(e) => set('receivedDate', e.target.value)} />
              
            </Field>
            <Field label="Expiry date" htmlFor="expiry" required error={errors.expiryDate}>
              <TextInput
                id="expiry"
                type="date"
                value={draft.expiryDate}
                onChange={(e) => set('expiryDate', e.target.value)} />
              
            </Field>
            <Field label="Handling notes" htmlFor="notes" className="sm:col-span-2">
              <TextArea
                id="notes"
                rows={3}
                value={draft.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Safety precautions, sign-off requirements, dedicated equipment…" />
              
            </Field>
          </FormSection>
        </Panel>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" onClick={() => navigate(editing ? `/inventory/${id}` : '/inventory')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <SaveIcon className="h-4 w-4" aria-hidden="true" />
            {editing ? 'Save changes' : 'Add to register'}
          </Button>
        </div>
      </form>
    </div>);

}