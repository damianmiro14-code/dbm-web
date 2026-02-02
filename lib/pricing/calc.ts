import type {
  EstimateInput,
  EstimateOutput,
  PriceRange,
  PricingConfig,
  Region,
  Strategy,
  Unit
} from "@/lib/pricing/types";

function roundMoney(n: number) {
  return Math.round(n);
}

function clampNonNegative(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isHourly(unit: Unit | undefined) {
  return unit === "EUR_PER_HOUR";
}

function findBandTravelCharge(config: PricingConfig, kmRoundTrip: number): number {
  const travel = config.globalRules.travel;
  if (!travel) return 0;

  const km = clampNonNegative(kmRoundTrip);
  if (km <= travel.includedKm) return 0;

  const band = travel.bands.find((b) => km >= b.kmFrom && km <= b.kmTo);
  if (band) return band.fixed;

  return (km - travel.includedKm) * travel.perKm;
}

function getMultiplierFromFlags(config: PricingConfig, flags?: Record<string, boolean>): number {
  const multMap = config.globalRules.multipliers ?? {};
  if (!flags) return 1;
  let m = 1;
  for (const [k, v] of Object.entries(flags)) {
    if (!v) continue;
    const factor = multMap[k];
    if (typeof factor === "number" && Number.isFinite(factor)) m *= factor;
  }
  return m;
}

function getPriceRangeForId(
  config: PricingConfig,
  id: string,
  region: Region,
  strategy: Strategy,
  teamRateId?: string
): { name: string; unit: Unit; range: PriceRange; options?: any; addons?: any } {
  for (const s of config.services) {
    if (s.variants) {
      const v = s.variants.find((vv) => vv.id === id);
      if (v) {
        return {
          name: `${s.name} - ${v.name}`,
          unit: v.unit,
          range: v.prices[region][strategy],
          options: s.options,
          addons: s.addons
        };
      }
    }

    if (s.id === id && s.prices && s.unit) {
      // Optional team rate override (e.g., "equipo 2 operarios").
      // Team rates are not strategy-dependent; we apply the same range across strategies.
      if (teamRateId && s.teamRates?.length) {
        const tr = s.teamRates.find((t) => t.id === teamRateId);
        if (tr) {
          const trRange: PriceRange = region === "castellon" ? tr.castellon : tr.spain;
          return {
            name: `${s.name} - ${tr.name}`,
            unit: tr.unit,
            range: trRange,
            options: s.options,
            addons: s.addons
          };
        }
      }
      return {
        name: s.name,
        unit: s.unit,
        range: s.prices[region][strategy],
        options: s.options,
        addons: s.addons
      };
    }
  }

  // Fallback (should never happen if UI is correct)
  return { name: id, unit: "EUR_PER_SERVICE", range: [0, 0] };
}

function applyOptionMultipliers(
  base: PriceRange,
  selectedOptionIds: string[] | undefined,
  availableOptions?: Array<{ id: string; multiplier: number }>
): PriceRange {
  if (!selectedOptionIds?.length || !availableOptions?.length) return base;

  let mult = 1;
  for (const oid of selectedOptionIds) {
    const opt = availableOptions.find((o) => o.id === oid);
    if (opt && typeof opt.multiplier === "number") mult *= opt.multiplier;
  }
  return [base[0] * mult, base[1] * mult];
}

function applyAddonCharges(
  subtotal: PriceRange,
  addonsInput: Array<{ id: string; quantity: number }> | undefined,
  availableAddons?: Array<any>
): { subtotal: PriceRange; breakdown: Array<{ label: string; low: number; high: number }> } {
  const breakdown: Array<{ label: string; low: number; high: number }> = [];
  if (!addonsInput?.length || !availableAddons?.length) return { subtotal, breakdown };

  let low = subtotal[0];
  let high = subtotal[1];

  for (const aIn of addonsInput) {
    const a = availableAddons.find((x) => x.id === aIn.id);
    if (!a) continue;

    if (a.unit === "MULTIPLIER" && typeof a.value === "number") {
      low *= a.value;
      high *= a.value;
      breakdown.push({
        label: `${a.name} (x${a.value.toFixed(2)})`,
        low: 0,
        high: 0
      });
      continue;
    }

    const qty = clampNonNegative(aIn.quantity);
    const pr: PriceRange | undefined = a.priceRange;
    if (pr && qty > 0) {
      const addLow = pr[0] * qty;
      const addHigh = pr[1] * qty;
      low += addLow;
      high += addHigh;
      breakdown.push({ label: `${a.name} x ${qty}`, low: addLow, high: addHigh });
    }
  }

  return { subtotal: [low, high], breakdown };
}

function enforceMinHours(
  config: PricingConfig,
  itemId: string,
  strategy: Strategy,
  unit: Unit,
  quantity: number
): number {
  if (!isHourly(unit)) return quantity;
  if (strategy !== "standard") return quantity;

  const rule = config.globalRules.minHoursOnSite?.standard;
  if (!rule) return quantity;
  if (!rule.appliesTo.includes(itemId)) return quantity;

  return Math.max(quantity, rule.hours);
}

function enforceIncludedHoursFromCallout(config: PricingConfig, region: Region, unit: Unit, itemId: string, quantity: number) {
  if (!shouldApplyCallout(unit, itemId)) return quantity;
  const includes = config.globalRules.minCallout[region]?.includesHours ?? 0;
  if (typeof includes !== "number" || !Number.isFinite(includes) || includes <= 0) return quantity;
  return Math.max(quantity, includes);
}

function shouldApplyCallout(unit: Unit, itemId: string): boolean {
  if (!isHourly(unit)) return false;
  // Heuristic: onsite hourly services (not workshop)
  if (itemId.includes("workshop")) return false;
  return true;
}

export function estimateSingle(config: PricingConfig, input: EstimateInput): EstimateOutput {
  const { region, strategy, kmRoundTrip, flags, item, teamRateId } = input;
  const base = getPriceRangeForId(config, item.id, region, strategy, teamRateId);

  let quantity = clampNonNegative(item.quantity);
  quantity = enforceIncludedHoursFromCallout(config, region, base.unit, item.id, quantity);
  quantity = enforceMinHours(config, item.id, strategy, base.unit, quantity);

  const baseRange = applyOptionMultipliers(base.range, item.options, base.options);

  const baseLow = baseRange[0] * quantity;
  const baseHigh = baseRange[1] * quantity;

  const breakdown: Array<{ label: string; low: number; high: number }> = [
    { label: `${base.name} x ${quantity}`, low: baseLow, high: baseHigh }
  ];

  let subtotal: PriceRange = [baseLow, baseHigh];

  const addonsApplied = applyAddonCharges(subtotal, item.addons, base.addons);
  subtotal = addonsApplied.subtotal;
  breakdown.push(...addonsApplied.breakdown);

  // Travel
  const travelCharge = findBandTravelCharge(config, kmRoundTrip);
  if (travelCharge > 0) {
    breakdown.push({ label: `Desplazamiento (${kmRoundTrip} km ida/vuelta)`, low: travelCharge, high: travelCharge });
    subtotal = [subtotal[0] + travelCharge, subtotal[1] + travelCharge];
  }

  // Min callout (if onsite)
  if (shouldApplyCallout(base.unit, item.id)) {
    const min = config.globalRules.minCallout[region]?.amount ?? 0;
    if (min > 0 && subtotal[0] < min) {
      breakdown.push({ label: `Mínimo de salida`, low: min - subtotal[0], high: Math.max(0, min - subtotal[1]) });
      subtotal = [Math.max(subtotal[0], min), Math.max(subtotal[1], min)];
    }
  }

  // Multipliers
  const m = getMultiplierFromFlags(config, flags);
  if (m !== 1) {
    subtotal = [subtotal[0] * m, subtotal[1] * m];
    breakdown.push({ label: `Multiplicadores`, low: 0, high: 0 });
  }

  // Min quote (applies to all services)
  const minQuote = config.globalRules.minQuote?.[region]?.amount ?? 0;
  if (minQuote > 0 && subtotal[0] < minQuote) {
    breakdown.push({ label: `Mínimo de intervención`, low: minQuote - subtotal[0], high: Math.max(0, minQuote - subtotal[1]) });
    subtotal = [Math.max(subtotal[0], minQuote), Math.max(subtotal[1], minQuote)];
  }

  return {
    low: roundMoney(subtotal[0]),
    high: roundMoney(subtotal[1]),
    breakdown: breakdown.map((b) => ({ ...b, low: roundMoney(b.low), high: roundMoney(b.high) }))
  };
}

export function estimateAllStrategies(
  config: PricingConfig,
  input: Omit<EstimateInput, "strategy">
): Record<Strategy, EstimateOutput> {
  return {
    competitive: estimateSingle(config, { ...input, strategy: "competitive" }),
    standard: estimateSingle(config, { ...input, strategy: "standard" }),
    premium: estimateSingle(config, { ...input, strategy: "premium" })
  };
}
