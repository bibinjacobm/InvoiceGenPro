
import { TDSSection, ChargingBasis } from './types';

export const TDS_SECTIONS: TDSSection[] = [
  { id: '194J_PROF', code: '194J', label: 'Professional Fees', rateDefault: 10 },
  { id: '194J_TECH', code: '194J', label: 'Technical Services', rateDefault: 2 },
  { id: '194C', code: '194C', label: 'Contractor / Sub-Contractor', rateDefault: 2 }, 
  { id: '194H', code: '194H', label: 'Commission / Brokerage', rateDefault: 5 },
  { id: '194I', code: '194I', label: 'Rent', rateDefault: 10 },
];

export const CHARGING_BASES: ChargingBasis[] = [
  ChargingBasis.PER_HOUR,
  ChargingBasis.PER_DAY,
  ChargingBasis.PER_WEEK,
  ChargingBasis.PER_MONTH,
  ChargingBasis.PER_UNIT,
  ChargingBasis.LUMP_SUM
];

export const getBasisSuffix = (basis: ChargingBasis): string => {
  switch (basis) {
    case ChargingBasis.PER_HOUR: return 'Hours';
    case ChargingBasis.PER_DAY: return 'Days';
    case ChargingBasis.PER_WEEK: return 'Weeks';
    case ChargingBasis.PER_MONTH: return 'Months';
    case ChargingBasis.PER_UNIT: return 'Units';
    case ChargingBasis.LUMP_SUM: return '';
    default: return '';
  }
};
