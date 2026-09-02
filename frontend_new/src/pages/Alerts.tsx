import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckIcon,
  ClipboardCheckIcon,
  InfoIcon,
  OctagonAlertIcon,
  PackageIcon,
  ShieldIcon,
  Trash2Icon } from
'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useInventory } from '../contexts/InventoryContext';
import { AlertSeverity, InventoryAlert } from '../types/inventory';
import { daysUntil, formatDateTime } from '../utils/inventory';

const severityMeta: Record<
  AlertSeverity,
  {label: string;tone: 'danger' | 'warning' | 'info';icon: typeof InfoIcon;rail: string;}> =
{
  critical: {
    label: 'Critical',
    tone: 'danger',
    icon: OctagonAlertIcon,
    rail: 'border-l-rose-500'
  },
  warning: {
    label: 'Warning',
    tone: 'warning',
    icon: AlertTriangleIcon,
    rail: 'border-l-amber-500'
  },
  info: { label: 'Info', tone: 'info', icon: InfoIcon, rail: 'border-l-sky-500' }
};

export function Alerts() {
  const { alerts, acknowledgeAlert, removeChemical, getChemical } = useInventory();
  const [showResolved, setShowResolved] = useState(false);

  const open = alerts.filter((a) => !a.acknowledged);
  const resolved = alerts.filter((a) => a.acknowledged);
  const visible = showResolved ? resolved : open;

  const counts = {
    critical: open.filter((a) => a.severity === 'critical').length,
    warning: open.filter((a) => a.severity === 'warning').length,
    info: open.filter((a) => a.severity === 'info').length
  };

  /** The single contextual action this alert supports, based on its kind
   *  and (for expiry alerts) whether the chemical has actually expired yet. */
  function primaryAction(alert: InventoryAlert): {
    label: string;
    icon: typeof CheckIcon;
    onClick: () => void;
  } {
    if (alert.kind === 'Low Stock') {
      return {
        label: 'Reorder',
        icon: PackageIcon,
        onClick: () => acknowledgeAlert(alert.id)
      };
    }
    if (alert.kind === 'Expiry') {
      const chemical = alert.chemicalId ? getChemical(alert.chemicalId) : undefined;
      const expired = chemical ? daysUntil(chemical.expiryDate) < 0 : false;
      if (expired && chemical) {
        return {
          label: 'Dispose',
          icon: Trash2Icon,
          onClick: () => {
            removeChemical(chemical.id);
            acknowledgeAlert(alert.id);
          }
        };
      }
      return {
        label: 'Quarantine',
        icon: ShieldIcon,
        onClick: () => acknowledgeAlert(alert.id)
      };
    }
    return {
      label: 'Resolve',
      icon: CheckIcon,
      onClick: () => acknowledgeAlert(alert.id)
    };
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        eyebrow="Safety & compliance"
        title="Alerts"
        description="The single place for every inventory and safety issue — expiring and expired chemicals, low stock, storage conditions and compliance."
        actions={
        <Button onClick={() => open.forEach((a) => acknowledgeAlert(a.id))} disabled={open.length === 0}>
            <ClipboardCheckIcon className="h-4 w-4" aria-hidden="true" />
            Resolve all
          </Button>
        } />


      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(['critical', 'warning', 'info'] as AlertSeverity[]).map((s) => {
          const meta = severityMeta[s];
          const Icon = meta.icon;
          return (
            <div
              key={s}
              className={`flex items-center gap-3 rounded-lg border border-slate-200 border-l-2 bg-white px-4 py-3.5 shadow-card ${meta.rail}`}>

              <Icon
                className={`h-5 w-5 ${
                s === 'critical' ?
                'text-rose-600' :
                s === 'warning' ?
                'text-amber-600' :
                'text-sky-600'}`
                }
                aria-hidden="true" />

              <div>
                <p className="text-2xl font-semibold tabular leading-none text-navy-900">
                  {counts[s]}
                </p>
                <p className="mt-1 text-xs text-slate-500">{meta.label} open</p>
              </div>
            </div>);

        })}
      </div>

      <div
        className="mb-4 inline-flex rounded-md border border-slate-300 bg-slate-50 p-0.5"
        role="tablist"
        aria-label="Alert state">

        <button
          type="button"
          role="tab"
          aria-selected={!showResolved}
          onClick={() => setShowResolved(false)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
          !showResolved ? 'bg-white text-navy-900 shadow-card' : 'text-slate-500 hover:text-navy-800'}`
          }>

          Open ({open.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showResolved}
          onClick={() => setShowResolved(true)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
          showResolved ? 'bg-white text-navy-900 shadow-card' : 'text-slate-500 hover:text-navy-800'}`
          }>

          Resolved ({resolved.length})
        </button>
      </div>

      {visible.length === 0 ?
      <Panel>
          <div className="px-5 py-16 text-center">
            <CheckIcon className="mx-auto h-6 w-6 text-emerald-600" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-navy-900">
              {showResolved ? 'Nothing resolved yet' : 'No open alerts'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {showResolved ?
            'Resolved exceptions are archived here with their owner and timestamp.' :
            'Every tracked substance is within its stock and shelf-life thresholds.'}
            </p>
          </div>
        </Panel> :

      <ul className="space-y-3">
          {visible.map((alert) => {
          const meta = severityMeta[alert.severity];
          const Icon = meta.icon;
          const action = primaryAction(alert);
          const ActionIcon = action.icon;
          return (
            <li key={alert.id}>
                <div
                className={`rounded-lg border border-slate-200 border-l-2 bg-white p-5 shadow-card ${meta.rail}`}>

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                      alert.severity === 'critical' ?
                      'text-rose-600' :
                      alert.severity === 'warning' ?
                      'text-amber-600' :
                      'text-sky-600'}`
                      }
                      aria-hidden="true" />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-semibold text-navy-900">
                            {alert.title}
                          </h2>
                          <Badge tone={meta.tone}>{alert.kind}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{alert.detail}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {alert.id} · raised {formatDateTime(alert.raisedAt)} · owner{' '}
                          {alert.owner}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {alert.chemicalId &&
                    <Link
                      to={`/inventory/${alert.chemicalId}`}
                      className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-brand-700 transition-colors duration-150 ease-out hover:bg-brand-50">

                          Open record
                        </Link>
                    }
                      {!alert.acknowledged &&
                    <Button size="sm" onClick={action.onClick}>
                          <ActionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          {action.label}
                        </Button>
                    }
                    </div>
                  </div>
                </div>
              </li>);

        })}
        </ul>
      }
    </div>);

}
