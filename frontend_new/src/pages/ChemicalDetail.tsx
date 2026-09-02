import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  FileTextIcon,
  MapPinIcon,
  PackageMinusIcon,
  PencilIcon,
  ShieldAlertIcon,
  Trash2Icon } from
'lucide-react';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ExpiryBadge, HazardBadge, StockBadge } from '../components/ui/StatusBadges';
import { useInventory } from '../contexts/InventoryContext';
import {
  daysUntil,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatQuantity,
  getStockState } from
'../utils/inventory';

function Field({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-2xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-navy-900">{value}</dd>
    </div>);

}

export function ChemicalDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getChemical, transactions, removeChemical } = useInventory();
  const chemical = getChemical(id);

  if (!chemical) {
    return (
      <div className="mx-auto w-full max-w-2xl py-20 text-center">
        <h1 className="text-lg font-semibold text-navy-900">Chemical not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record {id} is no longer in the register. It may have been disposed of or merged.
        </p>
        <Button className="mt-4" onClick={() => navigate('/inventory')}>
          Back to inventory
        </Button>
      </div>);

  }

  const history = transactions.filter((t) => t.chemicalId === chemical.id);
  const days = daysUntil(chemical.expiryDate);
  const state = getStockState(chemical);
  const pct = Math.min(
    100,
    Math.round(chemical.quantity / Math.max(chemical.minQuantity * 2, 1) * 100)
  );

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <Link
        to="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 ease-out hover:text-navy-900">
        
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Chemical register
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
              {chemical.name}
            </h1>
            <span className="font-mono text-sm text-slate-500">{chemical.formula}</span>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {chemical.id} · CAS {chemical.casNumber} · Lot {chemical.lotNumber}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StockBadge chemical={chemical} />
            <ExpiryBadge chemical={chemical} />
            <Badge tone="brand">{chemical.category}</Badge>
            {chemical.hazards.map((h) =>
            <HazardBadge key={h} hazard={h} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <FileTextIcon className="h-4 w-4" aria-hidden="true" />
            View SDS
          </Button>
          <Button onClick={() => navigate(`/transactions/new?chemicalId=${chemical.id}`)}>
            <PackageMinusIcon className="h-4 w-4" aria-hidden="true" />
            Log usage
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              removeChemical(chemical.id);
              navigate('/inventory');
            }}>
            
            <Trash2Icon className="h-4 w-4" aria-hidden="true" />
            Dispose
          </Button>
          <Button variant="primary" onClick={() => navigate(`/inventory/${chemical.id}/edit`)}>
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
            Edit record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel>
            <PanelHeader
              title="Current holding"
              description="Quantity on hand against the configured reorder minimum" />
            
            <div className="grid grid-cols-1 gap-6 px-5 py-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <p className="text-4xl font-semibold tabular tracking-tight text-navy-900">
                  {formatQuantity(chemical.quantity, chemical.unit)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  across {chemical.containerCount}{' '}
                  {chemical.containerCount === 1 ? 'container' : 'containers'} · minimum{' '}
                  {formatQuantity(chemical.minQuantity, chemical.unit)}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                    state === 'in-stock' ?
                    'bg-emerald-500' :
                    state === 'low-stock' ?
                    'bg-amber-500' :
                    'bg-rose-500'}`
                    }
                    style={{ width: `${pct}%` }} />
                  
                </div>
              </div>
              <dl className="space-y-4">
                <Field
                  label="Holding value"
                  value={formatCurrency(chemical.quantity * chemical.unitCost)} />
                
                <Field
                  label="Unit cost"
                  value={`${formatCurrency(chemical.unitCost)} / ${chemical.unit}`} />
                
              </dl>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Movement history"
              description={`${history.length} logged ${history.length === 1 ? 'entry' : 'entries'} for this record`} />
            
            {history.length === 0 ?
            <p className="px-5 py-10 text-center text-sm text-slate-500">
                No movements recorded yet. Entries appear here once stock is received or
                dispensed.
              </p> :

            <ul className="divide-y divide-slate-200">
                {history.map((t) =>
              <li key={t.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900">{t.type}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t.user} · {t.reference}
                      </p>
                      {t.note &&
                  <p className="mt-1 text-xs text-slate-400">{t.note}</p>
                  }
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm tabular text-navy-800">
                        {formatQuantity(t.amount, t.unit)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDateTime(t.timestamp)}
                      </p>
                    </div>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Storage & custody" />
            <dl className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 xl:grid-cols-1">
              <Field
                label="Location"
                value={
                <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {chemical.location}
                  </span>
                } />
              
              <Field label="Storage conditions" value={chemical.storage} />
              <Field label="Custodian" value={chemical.custodian} />
              <Field label="Supplier" value={chemical.supplier} />
              <Field label="Grade / purity" value={chemical.grade} />
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Lifecycle" />
            <dl className="grid grid-cols-2 gap-4 px-5 py-5 xl:grid-cols-1">
              <Field label="Received" value={formatDate(chemical.receivedDate)} />
              <Field
                label="Expires"
                value={
                <span className="flex items-center gap-2">
                    {formatDate(chemical.expiryDate)}
                    <span
                    className={`text-xs ${days < 0 ? 'text-rose-600' : days <= 60 ? 'text-amber-600' : 'text-slate-500'}`}>
                    
                      {days < 0 ? `${Math.abs(days)} days overdue` : `in ${days} days`}
                    </span>
                  </span>
                } />
              
            </dl>
          </Panel>

          {chemical.notes &&
          <Panel className="border-amber-200 bg-amber-50/60">
              <div className="flex gap-3 px-5 py-4">
                <ShieldAlertIcon
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                aria-hidden="true" />
              
                <div>
                  <h2 className="text-sm font-semibold text-amber-900">Handling note</h2>
                  <p className="mt-1 text-sm text-amber-800">{chemical.notes}</p>
                </div>
              </div>
            </Panel>
          }
        </div>
      </div>
    </div>);

}