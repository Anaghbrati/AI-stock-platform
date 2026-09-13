/**
 * Sector universe configuration for AI Market Radar.
 *
 * This is intentionally scoped small for v1 (5 sectors, ~12-15 stocks
 * each, ~65 tickers total) to stay within Yahoo Finance free-tier rate
 * limits during sector scans. Expand sector-by-sector once the scan
 * pipeline is confirmed stable under load.
 *
 * Tickers use the same ".NS" Yahoo Finance NSE suffix convention as
 * src/lib/market/indian-stock-universe.ts for consistency.
 */

export type SectorCategory =
  | "financials"
  | "technology"
  | "industrials"
  | "healthcare"
  | "consumer";

export interface Sector {
  id: string;
  displayName: string;
  description: string;
  category: SectorCategory;
  /** Optional benchmark/index to compare sector performance against */
  benchmarkIndex?: string;
  /** Yahoo Finance NSE tickers (.NS suffix) in this sector's universe */
  stockUniverse: string[];
}

export const SECTORS: Sector[] = [
  {
    id: "banking",
    displayName: "Banking",
    description:
      "Private and public sector banks listed on the NSE.",
    category: "financials",
    benchmarkIndex: "^NSEBANK",
    stockUniverse: [
      "HDFCBANK.NS",
      "ICICIBANK.NS",
      "SBIN.NS",
      "KOTAKBANK.NS",
      "AXISBANK.NS",
      "INDUSINDBK.NS",
      "BANKBARODA.NS",
      "PNB.NS",
      "IDFCFIRSTB.NS",
      "FEDERALBNK.NS",
      "AUBANK.NS",
      "BANDHANBNK.NS",
    ],
  },
  {
    id: "it",
    displayName: "IT",
    description:
      "Information technology services and software companies.",
    category: "technology",
    benchmarkIndex: "^CNXIT",
    stockUniverse: [
      "TCS.NS",
      "INFY.NS",
      "HCLTECH.NS",
      "WIPRO.NS",
      "TECHM.NS",
      "LTIM.NS",
      "PERSISTENT.NS",
      "COFORGE.NS",
      "MPHASIS.NS",
      "LTTS.NS",
    ],
  },
  {
    id: "defence",
    displayName: "Defence",
    description:
      "Defence manufacturing, aerospace, and related PSUs/private companies.",
    category: "industrials",
    stockUniverse: [
      "HAL.NS",
      "BEL.NS",
      "BDL.NS",
      "GRSE.NS",
      "MAZDOCK.NS",
      "COCHINSHIP.NS",
      "DATAPATTNS.NS",
      "ASTRAMICRO.NS",
      "ZENTEC.NS",
      "PARAS.NS",
      "SOLARINDS.NS",
    ],
  },
  {
    id: "pharma",
    displayName: "Pharma",
    description:
      "Pharmaceutical manufacturers and healthcare companies.",
    category: "healthcare",
    benchmarkIndex: "^CNXPHARMA",
    stockUniverse: [
      "SUNPHARMA.NS",
      "DRREDDY.NS",
      "CIPLA.NS",
      "DIVISLAB.NS",
      "AUROPHARMA.NS",
      "LUPIN.NS",
      "TORNTPHARM.NS",
      "ALKEM.NS",
      "ZYDUSLIFE.NS",
      "BIOCON.NS",
      "GLENMARK.NS",
    ],
  },
  {
    id: "auto",
    displayName: "Auto",
    description:
      "Automobile manufacturers (passenger, commercial, two-wheeler) and major auto ancillaries.",
    category: "consumer",
    benchmarkIndex: "^CNXAUTO",
    stockUniverse: [
      "TATAMOTORS.NS",
      "M&M.NS",
      "MARUTI.NS",
      "BAJAJ-AUTO.NS",
      "EICHERMOT.NS",
      "HEROMOTOCO.NS",
      "TVSMOTOR.NS",
      "ASHOKLEY.NS",
      "BHARATFORG.NS",
      "MOTHERSON.NS",
    ],
  },
];

/** Lookup helper — get a sector by its id */
export function getSectorById(id: string): Sector | undefined {
  return SECTORS.find((sector) => sector.id === id);
}

/** Get all tickers across all configured sectors (deduped) */
export function getAllSectorTickers(): string[] {
  const all = SECTORS.flatMap((sector) => sector.stockUniverse);
  return Array.from(new Set(all));
}