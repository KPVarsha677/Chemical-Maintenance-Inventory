import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  DownloadIcon,
  PackageMinusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShuffleIcon,
  Trash2Icon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useInventory } from '../contexts/InventoryContext';
import { TransactionType } from '../types/inventory';
import { formatDateTime, formatQuantity } from '../utils/inventory';

const typeMeta: Record<
  TransactionType,
  {tone: 'success' | 'brand' | 'info' | 'danger' | 'neutral';icon: typeof ArrowDownLeftIcon;}> =
{
  Received: { tone: 'success', icon: ArrowDownLeftIcon },
  Dispensed: { tone: 'brand', icon: ArrowUpRightIcon },
  Transferred: { tone: 'info', icon: ShuffleIcon },
  Disposed: { tone: 'danger', icon: Trash2Icon },
  Adjusted: { tone: 'neutral', icon: RefreshCwIcon }
};

const typeFilters: (TransactionType | 'All')[] = [
'All',
'Received',
'Dispensed',
'Transferred',
'Disposed',
'Adjusted'];


export function Transactions() {
  const { transactions } = useInventory();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TransactionType | 'All'>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesQuery =
      !q ||
      [t.chemicalName, t.user, t.reference, t.id, t.location].
      join(' ').
      toLowerCase().
      includes(q);
      return matchesQuery && (type === 'All' || t.type === type);
    });
  }, [transactions, query, type]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((t) => {
      const day = new Date(t.timestamp).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      map.set(day, [...(map.get(day) ?? []), t]);
    });
    return Array.from(map);
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <PageHeader
        eyebrow="Audit trail"
        title="Transactions & history"
        description="Every receipt, dispense, transfer and disposal recorded against the register."
        actions={
        <>
            <Button>
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Export audit log
            </Button>
            <Button variant="primary" onClick={() => navigate('/transactions/new')}>
              <PackageMinusIcon className="h-4 w-4" aria-hidden="true" />
              Record usage
            </Button>
          </>
        } />
      

      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-4">
          <div className="relative min-w-[240px] flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true" />
            
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search by chemical, user, project or reference"
              aria-label="Search transactions"
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none" />
            
          </div>
          <div className="flex flex-wrap gap-1.5">
            {typeFilters.map((t) =>
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(t)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
              type === t ?
              'border-navy-800 bg-navy-800 text-white' :
              'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-navy-800'}`
              }>
              
                {t}
              </button>
            )}
          </div>
        </div>

        {grouped.length === 0 ?
        <p className="px-5 py-16 text-center text-sm text-slate-500">
            No transactions match this search.
          </p> :

        <div className="divide-y divide-slate-200">
            {grouped.map(([day, entries]) =>
          <div key={day}>
                <div className="flex items-center justify-between bg-slate-50 px-5 py-2">
                  <h2 className="text-2xs font-semibold uppercase tracking-widest text-slate-500">
                    {day}
                  </h2>
                  <span className="text-2xs tabular text-slate-400">
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {entries.map((t) => {
                const meta = typeMeta[t.type];
                const Icon = meta.icon;
                return (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-start gap-3 px-5 py-4 transition-colors duration-150 ease-out hover:bg-slate-50 sm:flex-nowrap">
                    
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-navy-600">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                          to={`/inventory/${t.chemicalId}`}
                          className="text-sm font-medium text-navy-900 hover:text-brand-700">
                          
                              {t.chemicalName}
                            </Link>
                            <Badge tone={meta.tone}>{t.type}</Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {t.user} · {t.location} · {t.reference}
                          </p>
                          {t.note &&
                      <p className="mt-1 text-xs text-slate-400">{t.note}</p>
                      }
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                        className={`text-sm font-medium tabular ${
                        t.type === 'Received' ?
                        'text-emerald-700' :
                        t.type === 'Adjusted' && t.amount < 0 ?
                        'text-rose-700' :
                        'text-navy-800'}`
                        }>
                        
                            {t.type === 'Received' ? '+' : ''}
                            {formatQuantity(t.amount, t.unit)}
                          </p>
                          <p className="mt-0.5 font-mono text-2xs text-slate-400">{t.id}</p>
                          <p className="mt-0.5 text-2xs text-slate-400">
                            {formatDateTime(t.timestamp)}
                          </p>
                        </div>
                      </li>);

              })}
                </ul>
              </div>
          )}
          </div>
        }
      </Panel>
    </div>);

}