import { TIER_IDS } from "@/data/tiers";

const PRICING_SETTINGS_KEY = "mali2ipoh-pricing-settings";

export const DEFAULT_PRICING_SETTINGS = {
  taxRatePercent: 6,
  entranceFeeChildMultiplier: 0.5,
  tiers: {
    [TIER_IDS.EXPLORE]: {
      guideDayRateMYR: 260,
      operationsDayRateMYR: 120,
      multilingualSupportDayRateMYR: 0,
      partyBusDayRateMYR: 0,
      smallGroupSupplementDayRateMYR: 0,
    },
    [TIER_IDS.SMART_COMFORT]: {
      guideDayRateMYR: 320,
      operationsDayRateMYR: 210,
      multilingualSupportDayRateMYR: 90,
      partyBusDayRateMYR: 0,
      smallGroupSupplementDayRateMYR: 120,
    },
    [TIER_IDS.SIGNATURE]: {
      guideDayRateMYR: 380,
      operationsDayRateMYR: 260,
      multilingualSupportDayRateMYR: 120,
      partyBusDayRateMYR: 430,
      smallGroupSupplementDayRateMYR: 0,
    },
  },
  transfers: {
    KLIA: {
      upTo4MYR: 360,
      from5MYR: 480,
    },
    ETS: {
      upTo3MYR: 90,
      from4To5MYR: 140,
      from6MYR: 180,
    },
  },
};

function normalizeTierPricing(value, fallback) {
  const nextValue = value && typeof value === "object" ? value : {};

  return {
    guideDayRateMYR: Number(nextValue.guideDayRateMYR ?? fallback.guideDayRateMYR) || 0,
    operationsDayRateMYR:
      Number(nextValue.operationsDayRateMYR ?? fallback.operationsDayRateMYR) || 0,
    multilingualSupportDayRateMYR:
      Number(
        nextValue.multilingualSupportDayRateMYR ?? fallback.multilingualSupportDayRateMYR,
      ) || 0,
    partyBusDayRateMYR:
      Number(nextValue.partyBusDayRateMYR ?? fallback.partyBusDayRateMYR) || 0,
    smallGroupSupplementDayRateMYR:
      Number(
        nextValue.smallGroupSupplementDayRateMYR ?? fallback.smallGroupSupplementDayRateMYR,
      ) || 0,
  };
}

export function normalizePricingSettings(value) {
  const nextValue = value && typeof value === "object" ? value : {};
  const tiers = nextValue.tiers && typeof nextValue.tiers === "object" ? nextValue.tiers : {};
  const transfers =
    nextValue.transfers && typeof nextValue.transfers === "object" ? nextValue.transfers : {};
  const klia =
    transfers.KLIA && typeof transfers.KLIA === "object" ? transfers.KLIA : {};
  const ets = transfers.ETS && typeof transfers.ETS === "object" ? transfers.ETS : {};

  return {
    taxRatePercent:
      Number(nextValue.taxRatePercent ?? DEFAULT_PRICING_SETTINGS.taxRatePercent) || 0,
    entranceFeeChildMultiplier:
      Number(
        nextValue.entranceFeeChildMultiplier ??
          DEFAULT_PRICING_SETTINGS.entranceFeeChildMultiplier,
      ) || 0,
    tiers: {
      [TIER_IDS.EXPLORE]: normalizeTierPricing(
        tiers[TIER_IDS.EXPLORE],
        DEFAULT_PRICING_SETTINGS.tiers[TIER_IDS.EXPLORE],
      ),
      [TIER_IDS.SMART_COMFORT]: normalizeTierPricing(
        tiers[TIER_IDS.SMART_COMFORT],
        DEFAULT_PRICING_SETTINGS.tiers[TIER_IDS.SMART_COMFORT],
      ),
      [TIER_IDS.SIGNATURE]: normalizeTierPricing(
        tiers[TIER_IDS.SIGNATURE],
        DEFAULT_PRICING_SETTINGS.tiers[TIER_IDS.SIGNATURE],
      ),
    },
    transfers: {
      KLIA: {
        upTo4MYR: Number(klia.upTo4MYR ?? DEFAULT_PRICING_SETTINGS.transfers.KLIA.upTo4MYR) || 0,
        from5MYR: Number(klia.from5MYR ?? DEFAULT_PRICING_SETTINGS.transfers.KLIA.from5MYR) || 0,
      },
      ETS: {
        upTo3MYR: Number(ets.upTo3MYR ?? DEFAULT_PRICING_SETTINGS.transfers.ETS.upTo3MYR) || 0,
        from4To5MYR:
          Number(ets.from4To5MYR ?? DEFAULT_PRICING_SETTINGS.transfers.ETS.from4To5MYR) || 0,
        from6MYR: Number(ets.from6MYR ?? DEFAULT_PRICING_SETTINGS.transfers.ETS.from6MYR) || 0,
      },
    },
  };
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getStoredPricingSettings() {
  const storage = getStorage();

  if (!storage) {
    return DEFAULT_PRICING_SETTINGS;
  }

  const raw = storage.getItem(PRICING_SETTINGS_KEY);

  if (!raw) {
    return DEFAULT_PRICING_SETTINGS;
  }

  try {
    return normalizePricingSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_PRICING_SETTINGS;
  }
}

export function saveStoredPricingSettings(settings) {
  const storage = getStorage();

  if (!storage) {
    return DEFAULT_PRICING_SETTINGS;
  }

  const normalized = normalizePricingSettings(settings);
  storage.setItem(PRICING_SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function resetStoredPricingSettings() {
  const storage = getStorage();

  if (!storage) {
    return DEFAULT_PRICING_SETTINGS;
  }

  storage.removeItem(PRICING_SETTINGS_KEY);
  return DEFAULT_PRICING_SETTINGS;
}
