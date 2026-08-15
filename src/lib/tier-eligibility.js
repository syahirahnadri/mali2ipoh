import { PICKUP_OPTIONS } from "@/types";
import { TIERS, TIER_ORDER } from "@/data/tiers";
import { getTripNights, getTourDays } from "@/lib/itinerary-engine";
import { getArrivalContext } from "@/lib/tier-booking";

function toCount(value) {
  return Number(value) || 0;
}

function getTravellerCount(input) {
  return toCount(input.adults) + toCount(input.children);
}

function getLocationCount(input) {
  return Array.isArray(input.selectedDestinationIds) ? input.selectedDestinationIds.length : 0;
}

function getTripDays(input) {
  const nights = getTripNights(input.arrivalDate, input.departureDate);
  const tourDays = getTourDays(input.arrivalDate, input.departureDate);
  return Math.max(nights, tourDays);
}

function getArrivalOptionLabel(arrivalOption) {
  if (arrivalOption === PICKUP_OPTIONS.KLIA) {
    return "KLIA pickup";
  }

  if (arrivalOption === PICKUP_OPTIONS.ETS) {
    return "Ipoh ETS pickup";
  }

  if (arrivalOption === PICKUP_OPTIONS.SELF_ARRIVAL) {
    return "self-arrival";
  }

  return "the selected arrival option";
}

function getEligibilityReasons(tier, input) {
  const travellerCount = getTravellerCount(input);
  const locationCount = getLocationCount(input);
  const tripDays = getTripDays(input);
  const arrivalContext = getArrivalContext(input);
  const reasons = [];

  if (travellerCount < tier.minPax || travellerCount > tier.maxPax) {
    reasons.push(
      `${tier.name} supports ${tier.minPax}-${tier.maxPax} travellers, but this trip has ${travellerCount}.`,
    );
  }

  if (tripDays > tier.maxDays) {
    reasons.push(
      `${tier.name} supports up to ${tier.maxDays} days, but this trip spans ${tripDays} days.`,
    );
  }

  if (locationCount < tier.minLocations || locationCount > tier.maxLocations) {
    if (tier.minLocations === tier.maxLocations) {
      reasons.push(
        `${tier.name} requires exactly ${tier.minLocations} selected locations, but this trip has ${locationCount}.`,
      );
    } else {
      reasons.push(
        `${tier.name} supports ${tier.minLocations}-${tier.maxLocations} selected locations, but this trip has ${locationCount}.`,
      );
    }
  }

  if (tier.id === "EXPLORE" && arrivalContext === PICKUP_OPTIONS.KLIA) {
    reasons.push(
      `${tier.name} does not support ${getArrivalOptionLabel(arrivalContext)}.`,
    );
  }

  if (tier.id === "SIGNATURE" && arrivalContext === PICKUP_OPTIONS.ETS) {
    reasons.push(
      `${tier.name} currently uses KLIA pickup into Ipoh as the premium arrival flow.`,
    );
  }

  return reasons;
}

export function getTierEligibility(input) {
  return TIER_ORDER.map((tierId) => {
    const tier = TIERS[tierId];
    const reasons = getEligibilityReasons(tier, input);

    return {
      tierId,
      tier,
      isEligible: reasons.length === 0,
      reasons,
    };
  });
}

export function getEligibleTierIds(input) {
  return getTierEligibility(input)
    .filter((item) => item.isEligible)
    .map((item) => item.tierId);
}

export function getTierIneligibilityReasons(input) {
  return getTierEligibility(input).reduce((result, item) => {
    if (!item.isEligible) {
      result[item.tierId] = item.reasons;
    }

    return result;
  }, {});
}
