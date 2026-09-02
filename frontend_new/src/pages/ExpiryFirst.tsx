import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { useInventory } from '../contexts/InventoryContext';
import { daysUntil, getExpiryState } from '../utils/inventory';

export function ExpiryFirst() {
  const { chemicals } = useInventory();

  const expiring = chemicals.
  filter((c) => getExpiryState(c) !== 'valid').
  sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <PageHeader
        eyebrow="Safety & compliance"
        title="Expiry first"
        description="Chemicals that need attention because they're already expired, expiring soon, or closest to expiry — ordered soonest first." />


      <Panel>
        <PanelHeader
          title="Expiring first"
          description="Next items to reach end of shelf life" />
        {expiring.length === 0 ?
        <p className="px-5 py-16 text-center text-sm text-slate-500">
            Nothing is expired or approaching its shelf-life limit.
          </p> :

        <ul className="divide-y divide-slate-200">
            {expiring.map((chemical) => {
            const days = daysUntil(chemical.expiryDate);
            return (
              <li key={chemical.id}>
                  <Link
                  to={`/inventory/${chemical.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors duration-150 ease-out hover:bg-slate-50">

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-900">
                        {chemical.name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                        {chemical.lotNumber} · {chemical.location}
                      </p>
                    </div>
                    <Badge tone={days < 0 ? 'danger' : 'warning'}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                    </Badge>
                  </Link>
                </li>);

          })}
          </ul>
        }
      </Panel>
    </div>);

}
