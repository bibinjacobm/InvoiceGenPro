
export enum ChargingBasis {
  PER_HOUR = 'Per Hour',
  PER_DAY = 'Per Day',
  PER_WEEK = 'Per Week',
  PER_MONTH = 'Per Month',
  PER_UNIT = 'Per Unit',
  LUMP_SUM = 'Lump Sum'
}

export interface LineItem {
  id: string;
  description: string;
  basis: ChargingBasis;
  rate: number;
  qty: number;
  amount: number;
}

export interface TDSSection {
  id: string;
  code: string;
  label: string;
  rateDefault: number;
}

export interface InvoiceData {
  // Service Provider
  providerName: string;
  providerAddress: string;
  providerPan: string;
  providerAadhaar: string;
  providerContact: string;
  providerEmail: string;
  natureOfService: string;

  // Client
  clientName: string;
  clientAddress: string;
  clientPan: string;
  clientGstin: string;
  authorizedSignatory: string;
  logoUrl: string | null;

  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  placeOfIssue: string;
  paymentReference: string;

  // Table Items
  items: LineItem[];

  // TDS
  tdsSectionId: string;
}
