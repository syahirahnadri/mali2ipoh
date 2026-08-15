import { destinationsById } from "@/data/destinations";
import { hotelsById } from "@/data/hotels";
import { partyBuses } from "@/data/party-buses";
import {
  getActiveTierId,
  getArrivalOptionLabelForTier,
  getGuidesRequiredForTier,
  getSupportedArrivalOptionsForTier,
  isHotelEligibleForTier,
} from "@/lib/tier-booking";
import { TIER_IDS, TIERS } from "@/data/tiers";
import { diffLocalCalendarDays, parseLocalDate } from "@/lib/date";

function getDateRange(dateFrom, dateTo) {
  const totalDays = Math.max(0, diffLocalCalendarDays(dateFrom, dateTo));
  return Array.from({ length: totalDays }, (_, index) => {
    const start = parseLocalDate(dateFrom);
    if (!start) {
      return "";
    }
    start.setDate(start.getDate() + index);
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, "0");
    const day = String(start.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }).filter(Boolean);
}

export function getAssignedGuideIds(booking) {
  if (Array.isArray(booking.assignedGuideIds) && booking.assignedGuideIds.length) {
    return booking.assignedGuideIds.filter(Boolean);
  }

  return booking.assignedGuideId ? [booking.assignedGuideId] : [];
}

export { getActiveTierId };

export function getBookingTierValidation(booking) {
  const tierId = getActiveTierId(booking);
  const tier = TIERS[tierId];
  const groupSize = (booking.adults || 0) + (booking.children || 0);
  const duration = Math.max(1, diffLocalCalendarDays(booking.arrivalDate, booking.departureDate));
  const locationCount = Array.isArray(booking.selectedDestinationIds)
    ? booking.selectedDestinationIds.length
    : 0;
  const hotel = hotelsById[booking.hotelId];
  const supportedArrivals = getSupportedArrivalOptionsForTier(tierId);

  const checks = [
    {
      label: "Group size",
      value: `${groupSize}`,
      isValid: groupSize >= tier.minPax && groupSize <= tier.maxPax,
      detail:
        groupSize >= tier.minPax && groupSize <= tier.maxPax
          ? tierId === TIER_IDS.SMART_COMFORT && booking.smallGroupSupplementApplied
            ? "Eligible, small-group rate applies"
            : "Eligible"
          : `Expected ${tier.minPax}-${tier.maxPax}`,
    },
    {
      label: "Duration",
      value: `${duration} days`,
      isValid: duration <= tier.maxDays,
      detail: duration <= tier.maxDays ? "Eligible" : `Maximum ${tier.maxDays} days`,
    },
    {
      label: "Locations",
      value: `${locationCount}`,
      isValid:
        locationCount >= tier.minLocations && locationCount <= tier.maxLocations,
      detail:
        locationCount >= tier.minLocations && locationCount <= tier.maxLocations
          ? "Eligible"
          : tier.minLocations === tier.maxLocations
            ? `Requires exactly ${tier.minLocations}`
            : `Supports ${tier.minLocations}-${tier.maxLocations}`,
    },
    {
      label: "Hotel",
      value: hotel ? `${hotel.starRating} star` : "No hotel selected",
      isValid: isHotelEligibleForTier(booking.hotelId, tierId),
      detail: isHotelEligibleForTier(booking.hotelId, tierId)
        ? tier.hotelSelectionRequired
          ? "Eligible"
          : "Not required for this tier"
        : "Hotel is not eligible for this tier",
    },
    {
      label: "Arrival",
      value: getArrivalOptionLabelForTier(booking.arrivalOption, tierId),
      isValid: supportedArrivals.includes(booking.arrivalOption),
      detail: supportedArrivals.includes(booking.arrivalOption)
        ? tier.pickupIncluded
          ? "Included"
          : "Add-on available"
        : "Arrival option not supported for this tier",
    },
  ];

  return {
    tierId,
    tier,
    checks,
    guidesRequired: getGuidesRequiredForTier(tierId),
    assignedGuideIds: getAssignedGuideIds(booking),
    partyBusRequired: Boolean(booking.partyBusRequired),
  };
}

export function getPartyBusAvailability(booking) {
  const tierId = getActiveTierId(booking);
  const bookingDates = getDateRange(booking.arrivalDate, booking.departureDate);

  if (tierId !== TIER_IDS.SIGNATURE) {
    return {
      required: false,
      availableBuses: [],
      unavailableReasons: [],
    };
  }

  const availableBuses = [];
  const unavailableReasons = [];

  for (const bus of partyBuses) {
    const missingDate = bookingDates.find((date) => {
      return (
        !bus.availableDates.includes(date) ||
        bus.maintenanceDates.includes(date) ||
        bus.assignedBookings.includes(booking.id)
      );
    });

    if (missingDate) {
      unavailableReasons.push(`${bus.name} is not available on ${missingDate}.`);
      continue;
    }

    if (!bus.kliaCapable) {
      unavailableReasons.push(`${bus.name} does not support KLIA pickup.`);
      continue;
    }

    availableBuses.push(bus);
  }

  return {
    required: true,
    availableBuses,
    unavailableReasons,
  };
}

function increment(map, key) {
  map[key] = (map[key] || 0) + 1;
}

export function buildTierAnalytics(bookings) {
  const recommendedTierCounts = {};
  const selectedTierCounts = {};
  const selectedTierTotals = {};
  const destinationCountsByTier = {};
  const combinationCountsByTier = {};
  let smartComfortRecommendations = 0;
  let smartComfortSelections = 0;
  let smartComfortAccepted = 0;
  let exploreToSmartComfort = 0;
  let smartComfortToSignature = 0;
  let smallGroupSmartComfort = 0;
  let twoGuideBookings = 0;
  let partyBusBookings = 0;
  let totalGroupSize = 0;

  for (const booking of bookings) {
    const recommendedTierId = booking.recommendedTierId || "UNKNOWN";
    const selectedTierId = getActiveTierId(booking);
    const selectedTotal = booking.estimatedTotalMYR || booking.totalMYR || 0;
    const groupSize = (booking.adults || 0) + (booking.children || 0);

    increment(recommendedTierCounts, recommendedTierId);
    increment(selectedTierCounts, selectedTierId);
    selectedTierTotals[selectedTierId] = (selectedTierTotals[selectedTierId] || 0) + selectedTotal;
    totalGroupSize += groupSize;

    if (recommendedTierId === TIER_IDS.SMART_COMFORT) {
      smartComfortRecommendations += 1;
      if (selectedTierId === TIER_IDS.SMART_COMFORT) {
        smartComfortAccepted += 1;
      }
    }

    if (selectedTierId === TIER_IDS.SMART_COMFORT) {
      smartComfortSelections += 1;
      if (booking.smallGroupSupplementApplied) {
        smallGroupSmartComfort += 1;
      }
    }

    if (booking.preferredTierId === TIER_IDS.EXPLORE && selectedTierId === TIER_IDS.SMART_COMFORT) {
      exploreToSmartComfort += 1;
    }

    if (booking.preferredTierId === TIER_IDS.SMART_COMFORT && selectedTierId === TIER_IDS.SIGNATURE) {
      smartComfortToSignature += 1;
    }

    if ((booking.guidesRequired || 0) >= 2) {
      twoGuideBookings += 1;
    }

    if (booking.partyBusRequired) {
      partyBusBookings += 1;
    }

    destinationCountsByTier[selectedTierId] ||= {};
    combinationCountsByTier[selectedTierId] ||= {};

    const names = (booking.selectedDestinationIds || [])
      .map((id) => destinationsById[id]?.name)
      .filter(Boolean);

    names.forEach((name) => increment(destinationCountsByTier[selectedTierId], name));

    if (names.length > 1) {
      increment(combinationCountsByTier[selectedTierId], names.slice().sort().join(" + "));
    }
  }

  const toSortedItems = (map) =>
    Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count);

  return {
    recommendedTierDistribution: toSortedItems(recommendedTierCounts),
    selectedTierDistribution: toSortedItems(selectedTierCounts),
    smartComfortRecommendationAcceptanceRate: smartComfortRecommendations
      ? Math.round((smartComfortAccepted / smartComfortRecommendations) * 100)
      : 0,
    exploreToSmartComfortChangeRate: exploreToSmartComfort,
    smartComfortToSignatureChangeRate: smartComfortToSignature,
    averageEstimatedValueByTier: Object.entries(selectedTierTotals).map(([label, total]) => ({
      label,
      average: Math.round(total / Math.max(selectedTierCounts[label] || 1, 1)),
    })),
    mostSelectedDestinationsByTier: Object.fromEntries(
      Object.entries(destinationCountsByTier).map(([tierId, map]) => [tierId, toSortedItems(map)]),
    ),
    mostCommonDestinationCombinationsByTier: Object.fromEntries(
      Object.entries(combinationCountsByTier).map(([tierId, map]) => [tierId, toSortedItems(map)]),
    ),
    averageGroupSizeByTier: Object.entries(selectedTierCounts).map(([label, count]) => ({
      label,
      average: count ? (bookings
        .filter((booking) => getActiveTierId(booking) === label)
        .reduce((sum, booking) => sum + booking.adults + booking.children, 0) / count).toFixed(1) : "0.0",
    })),
    smallGroupSmartComfortCount: smallGroupSmartComfort,
    bookingsRequiringTwoGuides: twoGuideBookings,
    partyBusBookings,
    averageGroupSizeOverall: bookings.length ? (totalGroupSize / bookings.length).toFixed(1) : "0.0",
  };
}
