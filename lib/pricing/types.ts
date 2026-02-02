export type Strategy = "competitive" | "standard" | "premium";
export type Region = "castellon" | "spain";

export type PriceRange = [number, number];

export type Unit =
  | "EUR_PER_HOUR"
  | "EUR_PER_M2"
  | "EUR_PER_ML"
  | "EUR_PER_UNIT"
  | "EUR_PER_KG"
  | "EUR_PER_SERVICE"
  | "EUR_PER_M2_REFERENCE"
  | "MULTIPLIER";

export type Option = { id: string; name: string; multiplier: number };

export type Addon = {
  id: string;
  name: string;
  unit: Unit;
  priceRange?: PriceRange;
  value?: number;
};

export type ServiceVariant = {
  id: string;
  name: string;
  unit: Unit;
  prices: Record<Region, Record<Strategy, PriceRange>>;
};

export type TeamRate = {
  id: string;
  name: string;
  unit: Unit;
  castellon: PriceRange;
  spain: PriceRange;
};

export type Service = {
  id: string;
  name: string;
  unit?: Unit;
  prices?: Record<Region, Record<Strategy, PriceRange>>;
  variants?: ServiceVariant[];
  options?: Option[];
  addons?: Addon[];
  teamRates?: TeamRate[];
};

export type PricingConfig = {
  currency: string;
  regions: Region[];
  strategies: Strategy[];
  globalRules: {
    vatIncluded: boolean;
    minCallout: Record<Region, { amount: number; includesHours: number }>
    minQuote?: Record<Region, { amount: number }>;
    minHoursOnSite?: {
      standard?: { hours: number; appliesTo: string[] };
    };
    travel?: {
      includedKm: number;
      perKm: number;
      bands: Array<{ kmFrom: number; kmTo: number; fixed: number }>;
    };
    multipliers?: Record<string, number>;
  };
  services: Service[];
};

export type EstimateItemInput = {
  id: string;
  quantity: number;
  options?: string[];
  addons?: Array<{ id: string; quantity: number }>;
};

export type EstimateInput = {
  region: Region;
  strategy: Strategy;
  kmRoundTrip: number;
  flags?: Record<string, boolean>;
  teamRateId?: string;
  item: EstimateItemInput;
};

export type EstimateOutput = {
  low: number;
  high: number;
  breakdown: Array<{ label: string; low: number; high: number }>;
};
