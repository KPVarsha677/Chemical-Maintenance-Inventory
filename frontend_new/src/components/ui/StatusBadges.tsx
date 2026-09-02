import React from 'react';
import { Chemical, HazardClass } from '../../types/inventory';
import {
  daysUntil,
  expiryLabel,
  getExpiryState,
  getStockState,
  stockLabel } from
'../../utils/inventory';
import { Badge } from './Badge';

export function StockBadge({ chemical }: {chemical: Chemical;}) {
  const state = getStockState(chemical);
  const tone =
  state === 'in-stock' ? 'success' : state === 'low-stock' ? 'warning' : 'danger';
  return (
    <Badge tone={tone} dot>
      {stockLabel[state]}
    </Badge>);

}

export function ExpiryBadge({ chemical }: {chemical: Chemical;}) {
  const state = getExpiryState(chemical);
  const days = daysUntil(chemical.expiryDate);
  const tone = state === 'valid' ? 'neutral' : state === 'expiring' ? 'warning' : 'danger';
  const label =
  state === 'expired' ?
  `Expired ${Math.abs(days)}d ago` :
  state === 'expiring' ?
  `${days}d left` :
  expiryLabel[state];
  return <Badge tone={tone}>{label}</Badge>;
}

const hazardTone: Record<HazardClass, 'danger' | 'warning' | 'info' | 'neutral'> = {
  Flammable: 'danger',
  Corrosive: 'danger',
  Toxic: 'danger',
  Oxidizing: 'warning',
  Irritant: 'warning',
  'Health Hazard': 'warning',
  'Non-Hazardous': 'neutral'
};

export function HazardBadge({ hazard }: {hazard: HazardClass;}) {
  return <Badge tone={hazardTone[hazard]}>{hazard}</Badge>;
}