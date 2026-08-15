import { destinationsById } from "@/data/destinations";
import { hotelsById } from "@/data/hotels";
import { getTourDays, getTripNights } from "@/lib/itinerary-engine";
import {
  getActiveTierId,
  getGuidesRequiredForTier,
  isHotelSelectionRequired,
} from "@/lib/tier-booking";
import { TIER_IDS, TIERS } from "@/data/tiers";
import { PICKUP_OPTIONS } from "@/types";

const TIER_GROUP_DAY_RATES = {
  [TIER_IDS.EXPLORE]: 380,
  [TIER_IDS.SMART_COMFORT]: 680,
  [TIER_IDS.SIGNATURE]: 1450,
};

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

  const entranceFees = selectedDestinations.reduce((total, destination) => {
    const adultFees = destination.entranceFeeMYR * adults;
    const childFees = Math.round(destination.entranceFeeMYR * 0.5 * children);
    return total + adultFees + childFees;
  }, 0);

  const roomsRequired =
    hotel && isHotelSelectionRequired(tierId)
      ? Math.max(1, Math.ceil(travellerCount / hotel.roomCapacity))
      : 0;
  const hotelCost = hotel && roomsRequired ? hotel.pricePerNightMYR * roomsRequired * nights : 0;
  const tierServiceRate = (TIER_GROUP_DAY_RATES[tierId] || 0) * tourDays;
  const smallGroupSupplement =
    tierId === TIER_IDS.SMART_COMFORT && travellerCount >= 2 && travellerCount <= 3
      ? tourDays * 180
      : 0;

  let transportation = 0;
  if (state.arrivalOption === PICKUP_OPTIONS.KLIA) {
    transportation =
      tierId === TIER_IDS.SIGNATURE ? 0 : travellerCount >= 5 ? 420 : 360;
  } else if (state.arrivalOption === PICKUP_OPTIONS.ETS) {
    transportation = travellerCount >= 5 ? 180 : 120;
  } else if (state.arrivalOption === PICKUP_OPTIONS.SELF_ARRIVAL) {
    transportation = 60;
  }

  const taxableSubtotal =
    tierServiceRate + smallGroupSupplement + hotelCost + transportation;
  const serviceAndTaxes = Math.round(taxableSubtotal * 0.06);
  const total =
    entranceFees +
    tierServiceRate +
    smallGroupSupplement +
    hotelCost +
    transportation +
    serviceAndTaxes;
  const approximatePerPersonValue = travellerCount ? Math.round(total / travellerCount) : total;

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
    lineItems: [
      { label: `${tier.name} service rate`, amount: tierServiceRate },
      ...(smallGroupSupplement
        ? [{ label: "Small-group supplement", amount: smallGroupSupplement }]
        : []),
      ...(hotelCost
        ? [{ label: `Hotel stay (${roomsRequired} room${roomsRequired > 1 ? "s" : ""})`, amount: hotelCost }]
        : []),
      { label: "Sample entrance fees", amount: entranceFees },
      { label: tier.pickupIncluded ? "Arrival transfer (included)" : "Arrival transfer", amount: transportation },
      { label: "Sample taxes and service charges", amount: serviceAndTaxes },
    ],
    total,
  };
}
