import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRightIcon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { StockBadge, ExpiryBadge, HazardBadge } from '../components/ui/StatusBadges';
import { useInventory } from '../contexts/InventoryContext';
import { ChemicalCategory } from '../types/inventory';
import { formatQuantity, getStockState, formatDate } from '../utils/inventory';

const categories: (ChemicalCategory | 'All')[] = [
'All',
'Acid',
'Base',
'Solvent',
'Oxidizer',
'Reagent',
'Salt',
'Buffer',
'Gas'];


const statusFilters = [
{ key: 'all', label: 'All items' },
{ key: 'in-stock', label: 'In stock' },
{ key: 'low-stock', label: 'Low stock' },
{ key: 'out-of-stock', label: 'Out of stock' }] as
const;

type StatusKey = (typeof statusFilters)[number]['key'];

export function Inventory() {
  const { chemicals } = useInventory();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState<ChemicalCategory | 'All'>('All');
  const [status, setStatus] = useState<StatusKey>('all');
  const [location, setLocation] = useState('All');

  const locations = useMemo(
    () => ['All', ...Array.from(new Set(chemicals.map((c) => c.location.split(' · ')[0])))],
    [chemicals]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chemicals.filter((c) => {
      const matchesQuery =
      !q ||
      [c.name, c.casNumber, c.formula, c.lotNumber, c.supplier, c.id].
      join(' ').
      toLowerCase().
      includes(q);
      const matchesCategory = category === 'All' || c.category === category;
      const matchesStatus = status === 'all' || getStockState(c) === status;
      const matchesLocation = location === 'All' || c.location.startsWith(location);
      return matchesQuery && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [chemicals, query, category, status, location]);

  const activeFilters =
  (category !== 'All' ? 1 : 0) + (status !== 'all' ? 1 : 0) + (location !== 'All' ? 1 : 0);

  const clearFilters = () => {
    setCategory('All');
    setStatus('all');
    setLocation('All');
    setQuery('');
    setParams({});
  };

  const selectClass =
  'h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-navy-800 transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none';

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <PageHeader
        eyebrow="Inventory"
        title="Chemical register"
        description="Every tracked substance, its holding location and current compliance state."
        actions={
        <>
            <Button>
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="primary" onClick={() => navigate('/inventory/new')}>
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              Add chemical
            </Button>
          </>
        } />
      

      <Panel>
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true" />
              
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search by name, CAS, formula, lot or supplier"
                aria-label="Search chemical register"
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none" />
              
            </div>

            <label className="sr-only" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ChemicalCategory | 'All')}
              className={selectClass}>
              
              {categories.map((c) =>
              <option key={c} value={c}>
                  {c === 'All' ? 'All categories' : c}
                </option>
              )}
            </select>

            <label className="sr-only" htmlFor="filter-location">
              Location
            </label>
            <select
              id="filter-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectClass}>
              
              {locations.map((l) =>
              <option key={l} value={l}>
                  {l === 'All' ? 'All locations' : l}
                </option>
              )}
            </select>

            {activeFilters > 0 &&
            <Button size="sm" variant="ghost" onClick={clearFilters}>
                <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Clear {activeFilters}
              </Button>
            }
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-0.5"
              role="tablist"
              aria-label="Stock status">
              
              {statusFilters.map((f) =>
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={status === f.key}
                onClick={() => setStatus(f.key)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                status === f.key ?
                'bg-white text-navy-900 shadow-card' :
                'text-slate-500 hover:text-navy-800'}`
                }>
                
                  {f.label}
                </button>
              )}
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <SlidersHorizontalIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Showing <span className="tabular font-medium text-navy-800">{filtered.length}</span>{' '}
              of <span className="tabular">{chemicals.length}</span> items
            </p>
          </div>
        </div>

        {filtered.length === 0 ?
        <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-navy-900">No chemicals match your filters</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Try a different search term, or clear the active filters to see the full register.
            </p>
            <Button className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div> :

        <div className="overflow-x-auto thin-scroll">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                'Chemical',
                'Category',
                'Quantity',
                'Location',
                'Stock',
                'Expiry',
                'Hazards',
                ''].
                map((h) =>
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-2.5 text-2xs font-semibold uppercase tracking-widest text-slate-500">
                  
                      {h}
                    </th>
                )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((c) => {
                const pct = Math.min(
                  100,
                  Math.round(c.quantity / Math.max(c.minQuantity * 2, 1) * 100)
                );
                const state = getStockState(c);
                return (
                  <tr
                    key={c.id}
                    className="group transition-colors duration-150 ease-out hover:bg-slate-50">
                    
                      <td className="px-5 py-3">
                        <Link
                        to={`/inventory/${c.id}`}
                        className="block text-sm font-medium text-navy-900 hover:text-brand-700">
                        
                          {c.name}
                        </Link>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          {c.formula} · CAS {c.casNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{c.category}</td>
                      <td className="px-5 py-3">
                        <p className="text-sm tabular font-medium text-navy-900">
                          {formatQuantity(c.quantity, c.unit)}
                        </p>
                        <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-slate-200">
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
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{c.location}</td>
                      <td className="px-5 py-3">
                        <StockBadge chemical={c} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <ExpiryBadge chemical={c} />
                          <span className="text-2xs text-slate-400">
                            {formatDate(c.expiryDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.hazards.map((h) =>
                        <HazardBadge key={h} hazard={h} />
                        )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                        to={`/inventory/${c.id}`}
                        className="inline-flex items-center rounded p-1.5 text-slate-400 transition-colors duration-150 ease-out hover:bg-slate-200 hover:text-navy-800"
                        aria-label={`Open ${c.name}`}>
                        
                          <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </Panel>
    </div>);

}