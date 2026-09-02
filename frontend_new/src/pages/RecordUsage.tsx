import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, PackageMinusIcon, TriangleAlertIcon } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';
import { formatQuantity, getStockState, TODAY, toDateTimeLocalValue } from '../utils/inventory';

export function RecordUsage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetChemicalId = searchParams.get('chemicalId') ?? '';
  const { chemicals, getChemical, recordUsage } = useInventory();
  const { user } = useAuth();

  const [chemicalId, setChemicalId] = useState(presetChemicalId);
  const [quantity, setQuantity] = useState('');
  const [purpose, setPurpose] = useState('');
  const [timestamp, setTimestamp] = useState(() => toDateTimeLocalValue(TODAY));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const chemical = getChemical(chemicalId);
  const quantityNumber = Number(quantity);
  const willBeLow = useMemo(() => {
    if (!chemical || !Number.isFinite(quantityNumber) || quantityNumber <= 0) return false;
    const remaining = chemical.quantity - quantityNumber;
    return remaining >= 0 && remaining <= chemical.minQuantity;
  }, [chemical, quantityNumber]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!chemicalId) next.chemicalId = 'Select a chemical.';
    if (!quantity || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      next.quantity = 'Enter a quantity greater than zero.';
    } else if (chemical && quantityNumber > chemical.quantity) {
      next.quantity = `Only ${formatQuantity(chemical.quantity, chemical.unit)} available.`;
    }
    if (!purpose.trim()) next.purpose = 'Enter a purpose or experiment reference.';
    if (!timestamp) next.timestamp = 'Set the date and time.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await recordUsage({
      chemicalId,
      quantity: quantityNumber,
      purpose,
      timestamp: new Date(timestamp).toISOString(),
      notes
    });
    setSubmitting(false);

    if (!result.ok) {
      setErrors({ quantity: result.error });
      return;
    }

    navigate(presetChemicalId ? `/inventory/${presetChemicalId}` : '/transactions');
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        to={presetChemicalId ? `/inventory/${presetChemicalId}` : '/transactions'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 ease-out hover:text-navy-900">

        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {presetChemicalId ? 'Back to record' : 'Transactions & history'}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Record usage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log a dispense against the register. Stock on hand updates immediately and the entry
          appears in the audit trail.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Panel>
          <FormSection
            title="Usage details"
            description="What was used, how much, and why.">

            <Field
              label="Chemical"
              htmlFor="chemicalId"
              required
              error={errors.chemicalId}
              className="sm:col-span-2">

              <SelectInput
                id="chemicalId"
                value={chemicalId}
                onChange={(e) => {
                  setChemicalId(e.target.value);
                  setErrors((prev) => ({ ...prev, chemicalId: '', quantity: '' }));
                }}>

                <option value="">Select a chemical…</option>
                {chemicals.
                filter((c) => c.backendId !== undefined || c.id === presetChemicalId).
                map((c) =>
                <option key={c.id} value={c.id} disabled={getStockState(c) === 'out-of-stock'}>
                    {c.name} — {formatQuantity(c.quantity, c.unit)} available
                    {getStockState(c) === 'out-of-stock' ? ' (out of stock)' : ''}
                  </option>
                )}
              </SelectInput>
            </Field>

            <Field
              label="Quantity used"
              htmlFor="quantity"
              required
              error={errors.quantity}
              hint={chemical ? `Available: ${formatQuantity(chemical.quantity, chemical.unit)}` : undefined}>

              <div className="flex gap-2">
                <TextInput
                  id="quantity"
                  type="number"
                  min={0}
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="tabular" />

                <span className="flex h-9 shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                  {chemical?.unit ?? '—'}
                </span>
              </div>
            </Field>

            <Field label="Date &amp; time" htmlFor="timestamp" required error={errors.timestamp}>
              <TextInput
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)} />

            </Field>

            <Field
              label="Purpose / experiment"
              htmlFor="purpose"
              required
              error={errors.purpose}
              className="sm:col-span-2"
              hint="Reference the project, experiment or work order this usage supports.">

              <TextInput
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. PRJ-4410 · Extraction run" />

            </Field>

            <Field label="Logged by" htmlFor="loggedBy" hint="Automatically recorded from the signed-in account.">
              <TextInput id="loggedBy" value={user?.fullName ?? ''} disabled />
            </Field>

            <Field label="Location" htmlFor="location" hint="Taken from the chemical's storage record.">
              <TextInput id="location" value={chemical?.location ?? '—'} disabled />
            </Field>

            <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
              <TextArea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional — safety observations, disposal details, dual sign-off, etc." />

            </Field>

            {willBeLow &&
            <div className="sm:col-span-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                <TriangleAlertIcon
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                aria-hidden="true" />

                <p className="text-xs text-amber-800">
                  This will bring stock to or below the minimum threshold — a low-stock alert
                  will apply to this chemical.
                </p>
              </div>
            }
          </FormSection>
        </Panel>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            onClick={() => navigate(presetChemicalId ? `/inventory/${presetChemicalId}` : '/transactions')}>

            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            <PackageMinusIcon className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Recording…' : 'Record usage'}
          </Button>
        </div>
      </form>
    </div>);

}
