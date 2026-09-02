import { InventoryAlert } from '../types/inventory';

export const alerts: InventoryAlert[] = [
{
  id: 'ALT-2201',
  kind: 'Expiry',
  severity: 'critical',
  title: 'Formaldehyde 37% has expired',
  detail:
  'Lot TF-6680-14 passed its expiry on 16 Aug 2026. Quarantine the remaining 0.9 L and raise a disposal request.',
  chemicalId: 'CHM-1149',
  chemicalName: 'Formaldehyde 37%',
  raisedAt: '2026-08-17T07:00:00',
  acknowledged: false,
  owner: 'Dr. Elena Vasquez'
},
{
  id: 'ALT-2204',
  kind: 'Low Stock',
  severity: 'critical',
  title: 'Hydrochloric Acid is out of stock',
  detail:
  'No containers remain in Cabinet A-03 against a minimum of 6 L. Three open projects list it as a required reagent.',
  chemicalId: 'CHM-1058',
  chemicalName: 'Hydrochloric Acid',
  raisedAt: '2026-08-24T09:15:00',
  acknowledged: false,
  owner: 'Priya Nandakumar'
},
{
  id: 'ALT-2208',
  kind: 'Expiry',
  severity: 'warning',
  title: 'Chloroform expires in 5 days',
  detail:
  'Lot SA-4402-19 expires 05 Sep 2026. Schedule usage or begin the disposal workflow this week.',
  chemicalId: 'CHM-1128',
  chemicalName: 'Chloroform',
  raisedAt: '2026-08-29T06:00:00',
  acknowledged: false,
  owner: 'Dr. Aiko Tanaka'
},
{
  id: 'ALT-2209',
  kind: 'Expiry',
  severity: 'warning',
  title: 'Toluene expires in 12 days',
  detail:
  'Peroxide test is also overdue for lot SA-9087-18. Complete both checks before the next dispense.',
  chemicalId: 'CHM-1095',
  chemicalName: 'Toluene',
  raisedAt: '2026-08-28T06:00:00',
  acknowledged: false,
  owner: 'Marcus Feld'
},
{
  id: 'ALT-2211',
  kind: 'Low Stock',
  severity: 'warning',
  title: 'Acetone below minimum threshold',
  detail:
  '3.2 L on hand against a 10 L minimum. Average monthly draw is 6.5 L across Lab B.',
  chemicalId: 'CHM-1043',
  chemicalName: 'Acetone',
  raisedAt: '2026-08-27T06:00:00',
  acknowledged: false,
  owner: 'Marcus Feld'
},
{
  id: 'ALT-2213',
  kind: 'Low Stock',
  severity: 'warning',
  title: 'Acetonitrile below minimum threshold',
  detail:
  '9 L on hand against a 12 L minimum. Lead time from Fisher Scientific is currently 3 weeks.',
  chemicalId: 'CHM-1107',
  chemicalName: 'Acetonitrile',
  raisedAt: '2026-08-26T06:00:00',
  acknowledged: false,
  owner: 'Priya Nandakumar'
},
{
  id: 'ALT-2216',
  kind: 'Storage',
  severity: 'warning',
  title: 'Cold-chain log gap for Oxidizers O-01',
  detail:
  'No temperature reading recorded for Hydrogen Peroxide 30% between 28 Aug 18:00 and 29 Aug 06:00.',
  chemicalId: 'CHM-1070',
  chemicalName: 'Hydrogen Peroxide 30%',
  raisedAt: '2026-08-29T06:30:00',
  acknowledged: true,
  owner: 'Dr. Aiko Tanaka'
},
{
  id: 'ALT-2219',
  kind: 'Compliance',
  severity: 'info',
  title: 'SDS revision available for Nitric Acid',
  detail:
  'Merck KGaA published revision 4.2 on 20 Aug 2026. Replace the binder copy in Lab A and re-brief the team.',
  chemicalId: 'CHM-1113',
  chemicalName: 'Nitric Acid',
  raisedAt: '2026-08-22T08:00:00',
  acknowledged: true,
  owner: 'Dr. Elena Vasquez'
},
{
  id: 'ALT-2222',
  kind: 'Compliance',
  severity: 'info',
  title: 'Quarterly cycle count due in 9 days',
  detail:
  'Q3 count covers 18 catalogue items across four labs. Two variances from Q2 are still open.',
  raisedAt: '2026-08-22T08:00:00',
  acknowledged: false,
  owner: 'Samuel Okoro'
}];