export type Domicile = 'Domestic' | 'Foreign';
export type FundType = 'Restricted' | 'Unrestricted';
export type FcraStatus = 'Applicable' | 'Not applicable';

/** A single uploaded MoU / agreement document for a donor. */
export interface DonorDocument {
  id: string;
  /** Original file name. */
  name: string;
  /** Human-readable meta line, e.g. "PDF · 2.4 MB · uploaded 2022-11-03". */
  meta: string;
  /** Download / view URL. Object URL in-memory, or a storage URL in production. */
  url?: string;
}

/**
 * A donor record. The first block of fields is the canonical donor database
 * schema; `committed`/`received`/`allocationPct` are read-only roll-ups from
 * the agreements + transactions side.
 */
export interface Donor {
  id: string;
  code: string;
  name: string;
  source: string;
  type: string;
  domicile: Domicile;
  fcra: FcraStatus;
  /** Only meaningful when `domicile === 'Foreign'`. */
  foreignType: string;
  foreignCountry: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  panCardNumber: string;
  bankAccountRef: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  // Roll-ups (read-only in this view)
  committed: string;
  received: string;
  allocationPct: number;
  fundType: FundType;

  documents: DonorDocument[];
}
