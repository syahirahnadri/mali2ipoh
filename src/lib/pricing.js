import { destinationsById } from "@/data/destinations";
import { hotelsById } from "@/data/hotels";
import { getTourDays, getTripNights } from "@/lib/itinerary-engine";
import {
  getActiveTierId,
  getGuidesRequiredForTier,
  isHotelSelectionRequired,
} from "@/lib/tier-booking";
import { TIERS } from "@/data/tiers";
import { getStoredPricingSettings } from "@/lib/pricing-settings";
import { PICKUP_OPTIONS } from "@/types";

function getArrivalTransferCost(arrivalOption, travellerCount, tier, settings) {
  if (!arrivalOption || tier?.pickupIncluded) {
    return 0;
  }

  if (arrivalOption === PICKUP_OPTIONS.KLIA) {
    return travellerCount >= 5
      ? settings.transfers.KLIA.from5MYR
      : settings.transfers.KLIA.upTo4MYR;
  }

  if (arrivalOption === PICKUP_OPTIONS.ETS) {
    if (travellerCount >= 6) {
      return settings.transfers.ETS.from6MYR;
    }

    if (travellerCount >= 4) {
      return settings.transfers.ETS.from4To5MYR;
    }

    return settings.transfers.ETS.upTo3MYR;
  }

  if (arrivalOption === PICKUP_OPTIONS.SELF_ARRIVAL) {
    return 0;
  }

  return 0;
}

export function buildSamplePrice(state) {
  const selectedDestinations = state.selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean);
  const tierId = getActiveTierId(state);
  const tier = TIERS[tierId];
  const hotel = hotelsById[state.hotelId];
  const adults = Number(state.adults) || 0;
  const children = Number(state.children) || 0;
  const travellerCount = adults + children;
  const nights = getTripNights(state.arrivalDate, state.departureDate);
  const tourDays = getTourDays(state.arrivalDate, state.departureDate);
  const guidesRequired = getGuidesRequiredForTier(tierId);
  const pricingSettings = getStoredPricingSettings();
  const pricingRules = pricingSettings.tiers[tierId] || {};

  const entranceFees = selectedDestinations.reduce((total, destination) => {
    const adultFees = destination.entranceFeeMYR * adults;
    const childFees = Math.round(
      destination.entranceFeeMYR * pricingSettings.entranceFeeChildMultiplier * children,
    );
    return total + adultFees + childFees;
  }, 0);

  const roomsRequired =
    hotel && isHotelSelectionRequired(tierId)
      ? Math.max(1, Math.ceil(travellerCount / hotel.roomCapacity))
      : 0;
  const hotelCost = hotel && roomsRequired ? hotel.pricePerNightMYR * roomsRequired * nights : 0;
  const guideService = (pricingRules.guideDayRateMYR || 0) * guidesRequired * tourDays;
  const operationsSupport = (pricingRules.operationsDayRateMYR || 0) * tourDays;
  const multilingualSupport =
    tier?.multilingualRequired
      ? (pricingRules.multilingualSupportDayRateMYR || 0) * tourDays
      : 0;
  const partyBusService =
    tier?.partyBusRequired ? (pricingRules.partyBusDayRateMYR || 0) * tourDays : 0;
  const smallGroupSupplement =
    tier?.smallGroupSupplementApplies &&
    typeof tier.smallGroupMaximum === "number" &&
    travellerCount > 0 &&
    travellerCount <= tier.smallGroupMaximum
      ? (pricingRules.smallGroupSupplementDayRateMYR || 0) * tourDays
      : 0;
  const transportation = getArrivalTransferCost(
    state.arrivalOption,
    travellerCount,
    tier,
    pricingSettings,
  );

  const taxableSubtotal =
    guideService +
    operationsSupport +
    multilingualSupport +
    partyBusService +
    smallGroupSupplement +
    transportation;
  const taxRate = pricingSettings.taxRatePercent / 100;
  const serviceAndTaxes = Math.round(taxableSubtotal * taxRate);
  const total =
    entranceFees +
    guideService +
    operationsSupport +
    multilingualSupport +
    partyBusService +
    smallGroupSupplement +
    hotelCost +
    transportation +
    serviceAndTaxes;
  const approximatePerPersonValue = travellerCount ? Math.round(total / travellerCount) : total;

  const lineItems = [
    {
      label: `Guide service (${guidesRequired} guide${guidesRequired > 1 ? "s" : ""} × ${tourDays} day${tourDays > 1 ? "s" : ""})`,
      amount: guideService,
    },
    {
      label: `Trip planning and operations (${tourDays} day${tourDays > 1 ? "s" : ""})`,
      amount: operationsSupport,
    },
    ...(multilingualSupport
      ? [{ label: "Multilingual support coverage", amount: multilingualSupport }]
      : []),
    ...(partyBusService
      ? [{ label: `Party-bus service (${tourDays} day${tourDays > 1 ? "s" : ""})`, amount: partyBusService }]
      : []),
    ...(smallGroupSupplement
      ? [{ label: "Small-group supplement", amount: smallGroupSupplement }]
      : []),
    ...(hotelCost
      ? [{ label: `Hotel stay (${roomsRequired} room${roomsRequired > 1 ? "s" : ""} × ${nights} night${nights > 1 ? "s" : ""})`, amount: hotelCost }]
      : []),
    ...(entranceFees
      ? [{ label: "Estimated attraction entrance fees", amount: entranceFees }]
      : []),
    ...(state.arrivalOption
      ? [{
          label: tier?.pickupIncluded
            ? "Arrival transfer (included in tier)"
            : "Arrival transfer",
          amount: transportation,
        }]
      : []),
    {
      label: `Estimated taxes and service charges (${pricingSettings.taxRatePercent}%)`,
      amount: serviceAndTaxes,
    },
  ];

  return {
    tierId,
    tierName: tier.name,
    nights,
    tourDays,
    roomsRequired,
    guidesRequired,
    smallGroupSupplementApplied: smallGroupSupplement > 0,
    pickupIncluded: tier.pickupIncluded,
    partyBusRequired: tier.partyBusRequired,
    approximatePerPersonValue,
    lineItems,
    total,
  };
}
