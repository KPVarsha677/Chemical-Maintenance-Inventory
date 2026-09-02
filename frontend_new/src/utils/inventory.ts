import { Chemical, ExpiryState, StockState } from '../types/inventory';

/** Fixed "today" so the mock dataset reads consistently. */
export const TODAY = new Date('2026-08-31T12:00:00');

export function daysUntil(date: string): number {
  const target = new Date(`${date}T12:00:00`);
  return Math.round((target.getTime() - TODAY.getTime()) / 86_400_000);
}

export function getStockState(chemical: Chemical): StockState {
  if (chemical.quantity <= 0) return 'out-of-stock';
  if (chemical.quantity <= chemical.minQuantity) return 'low-stock';
  return 'in-stock';
}

export function getExpiryState(chemical: Chemical): ExpiryState {
  const days = daysUntil(chemical.expiryDate);
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring';
  return 'valid';
}

export const stockLabel: Record<StockState, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock'
};

export const expiryLabel: Record<ExpiryState, string> = {
  valid: 'Valid',
  expiring: 'Expiring soon',
  expired: 'Expired'
};

export function formatDate(date: string): string {
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  return `${d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  })} · ${d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

export function formatQuantity(value: number, unit: string): string {
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return `${rounded} ${unit}`;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
}

export function totalValue(chemicals: Chemical[]): number {
  return chemicals.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);
}

/** Formats a Date as a `datetime-local` input value (`YYYY-MM-DDTHH:mm`). */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}