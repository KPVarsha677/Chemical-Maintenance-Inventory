import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  DownloadIcon,
  FlaskConicalIcon,
  PackageIcon,
  WalletIcon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/dashboard/StatCard';
import { MovementChart } from '../components/dashboard/MovementChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { useInventory } from '../contexts/InventoryContext';
import {
  formatCurrency,
  formatDateTime,
  formatQuantity,
  getExpiryState,
  getStockState,
  totalValue } from
'../utils/inventory';

export function Dashboard() {
  const { chemicals, transactions } = useInventory();

  const lowStock = chemicals.filter((c) => getStockState(c) !== 'in-stock');
  const expiring = chemicals.filter((c) => getExpiryState(c) !== 'valid');

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <PageHeader
        eyebrow="Monday, 31 August 2026 · Sites: Cambridge R&D"
        title="Inventory overview"
        description="Live stock position, safety exposure and movement across four laboratories."
        actions={
        <>
            <Button>
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Export report
            </Button>
            <Button variant="primary" onClick={() => undefined}>
              <CalendarClockIcon className="h-4 w-4" aria-hidden="true" />
              Start cycle count
            </Button>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Catalogue items"
          value={String(chemicals.length)}
          sublabel="tracked across 4 labs"
          icon={FlaskConicalIcon}
          trend={{ direction: 'up', value: '+3', positive: true }} />
        
        <StatCard
          label="Containers on hand"
          value={String(chemicals.reduce((s, c) => s + c.containerCount, 0))}
          sublabel="incl. 3 gas cylinders"
          icon={PackageIcon} />
        
        <StatCard
          label="Requires attention"
          value={String(lowStock.length + expiring.length)}
          sublabel="stock and expiry exceptions"
          icon={AlertTriangleIcon}
          tone="alert"
          trend={{ direction: 'up', value: '+2 this week', positive: false }} />
        
        <StatCard
          label="Inventory value"
          value={formatCurrency(totalValue(chemicals))}
          sublabel="at last purchase price"
          icon={WalletIcon}
          trend={{ direction: 'down', value: '-4.1%', positive: true }} />
        
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Stock movement"
            description="Units received against units dispensed, last six months"
            action={
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-brand-600" aria-hidden="true" />
                  Dispensed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-teal-700" aria-hidden="true" />
                  Received
                </span>
              </div>
            } />
          
          <MovementChart />
        </Panel>

        <Panel>
          <PanelHeader
            title="Catalogue by category"
            description="Distribution of tracked items" />

          <CategoryChart chemicals={chemicals} />
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-3">
          <PanelHeader
            title="Recent activity"
            description="Latest logged movements"
            action={
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 transition-colors duration-150 ease-out hover:text-brand-900">

                Full log
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            } />

          <ul className="divide-y divide-slate-200">
            {transactions.slice(0, 5).map((txn) =>
            <li key={txn.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {txn.chemicalName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {txn.type} · {txn.user}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm tabular text-navy-800">
                    {txn.amount > 0 && txn.type !== 'Dispensed' ? '+' : ''}
                    {formatQuantity(txn.amount, txn.unit)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDateTime(txn.timestamp)}
                  </p>
                </div>
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>);

}