import { hotels } from "@/data/hotels";
import { TIER_IDS, TIERS } from "@/data/tiers";
import { PICKUP_OPTIONS } from "@/types";

export function getArrivalContext(state) {
  if (state.arrivalOption) {
    return state.arrivalOption;
  }

  if (state.generalArrivalPoint === "KLIA") {
    return PICKUP_OPTIONS.KLIA;
  }

  if (state.generalArrivalPoint === "Ipoh ETS") {
    return PICKUP_OPTIONS.ETS;
  }

  return "";
}

export function getActiveTierId(state) {
  return state.selectedTierId || state.recommendedTierId || TIER_IDS.SMART_COMFORT;
}

export function getActiveTier(state) {
  return TIERS[getActiveTierId(state)] || TIERS[TIER_IDS.SMART_COMFORT];
}

export function isHotelSelectionRequired(tierId) {
  return Boolean(TIERS[tierId]?.hotelSelectionRequired);
}

export function getEligibleHotelsForTier(tierId) {
  if (!tierId || !isHotelSelectionRequired(tierId)) {
    return [];
  }

  return hotels.filter((hotel) => {
    return Array.isArray(hotel.eligibleTierIds) && hotel.eligibleTierIds.includes(tierId);
  });
}

export function isHotelEligibleForTier(hotelId, tierId) {
  if (!isHotelSelectionRequired(tierId)) {
    return hotelId === "" || !hotelId;
  }

  return getEligibleHotelsForTier(tierId).some((hotel) => hotel.id === hotelId);
}

export function getSupportedArrivalOptionsForTier(tierId) {
  if (tierId === TIER_IDS.EXPLORE) {
    return [PICKUP_OPTIONS.ETS];
  }

  if (tierId === TIER_IDS.SIGNATURE) {
    return [PICKUP_OPTIONS.KLIA];
  }

  return [PICKUP_OPTIONS.KLIA, PICKUP_OPTIONS.ETS];
}

export function isArrivalOptionSupportedForTier(arrivalOption, tierId) {
  return getSupportedArrivalOptionsForTier(tierId).includes(arrivalOption);
}

export function getArrivalOptionLabelForTier(arrivalOption, tierId) {
  if (arrivalOption === PICKUP_OPTIONS.KLIA) {
    if (tierId === TIER_IDS.SIGNATURE) {
      return "KLIA pickup to Ipoh (included)";
    }

    return "KLIA pickup";
  }

  if (arrivalOption === PICKUP_OPTIONS.ETS) {
    return "Ipoh ETS pickup";
  }

  if (arrivalOption === PICKUP_OPTIONS.SELF_ARRIVAL) {
    return "Self arrival";
  }

  return "Not selected";
}

export function getGuidesRequiredForTier(tierId) {
  return TIERS[tierId]?.guidesRequired || 0;
}

export function getTierIncludedServices(tierId) {
  if (tierId === TIER_IDS.EXPLORE) {
    return [
      "1 suitable guide during scheduled tour hours",
      "Emergency support",
      "Ipoh ETS pickup add-on",
    ];
  }

  if (tierId === TIER_IDS.SIGNATURE) {
    return [
      "2 multilingual guides",
      "5-star hotel",
      "Party-bus service",
      "KLIA pickup to Ipoh included",
    ];
  }

  return [
    "1 multilingual guide",
    "3-4-star hotel",
    "Emergency support",
    "KLIA or Ipoh ETS pickup add-on",
  ];
}

export function getTierChargeableItems(tierId) {
  if (tierId === TIER_IDS.EXPLORE) {
    return ["Attraction fees", "ETS pickup add-on"];
  }

  if (tierId === TIER_IDS.SIGNATURE) {
    return ["Attraction fees", "Taxes and service charges"];
  }

  return ["Attraction fees", "Hotel rooms", "Arrival transfer", "Taxes and service charges"];
}
