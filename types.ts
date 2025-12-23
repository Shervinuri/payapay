export enum Type {
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  NULL = 'NULL',
}

export interface PayaCycle {
  id: number;
  label: string;
  hour: number;
  minute: number;
  description: string;
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CycleCalculation {
  nextCycle: PayaCycle;
  targetDate: Date;
  isTomorrow: boolean;
}

export type AppTab = 'paya' | 'satna' | 'chakavak' | 'market';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
}

export interface FiatData {
  id: string;
  name: string;
  price: string;
  symbol: string;
}

export interface MetalData {
  id: string;
  name: string;
  price: string;
  unit: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface FinancialState {
  coins: CoinData[];
  fiats: FiatData[];
  metals: MetalData[];
  lastUpdated: Date | null;
  sources: GroundingSource[];
  isFetching: boolean;
}

export interface CryptoPriceState {
  coins: CoinData[];
  dollarRate: string;
  lastUpdated: Date | null;
  sources: GroundingSource[];
  isFetching: boolean;
}