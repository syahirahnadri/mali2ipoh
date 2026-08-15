import { addLocalDays } from "@/lib/date";
import { destinationsById } from "@/data/destinations";
import { buildItinerary, getTourDays } from "@/lib/itinerary-engine";
import { getTierEligibility } from "@/lib/tier-eligibility";
import { getTierRecommendation } from "@/lib/tier-recommendation";

export function getTravellerCount(state) {
  return (Number(state.adults) || 0) + (Number(state.children) || 0);
}

export function getTripDays(state) {
  return getTourDays(state.arrivalDate, state.departureDate);
}

export function getSelectedDestinations(state) {
  return (Array.isArray(state.selectedDestinationIds) ? state.selectedDestinationIds : [])
    .map((id) => destinationsById[id])
    .filter(Boolean);
}

export function getEstimatedAttractionFees(state) {
  const adults = Number(state.adults) || 0;
  const children = Number(state.children) || 0;

  return getSelectedDestinations(state).reduce((total, destination) => {
    return total + destination.entranceFeeMYR * adults + Math.round(destination.entranceFeeMYR * 0.5 * children);
  }, 0);
}

export function getManualEnquiryState(state) {
  const travellerCount = getTravellerCount(state);
  const tripDays = getTripDays(state);

  if (travellerCount === 1) {
    return {
      isManualEnquiryRequired: true,
      title: "Manual enquiry required",
      message:
        "Automated booking is not available for solo travellers yet. Please contact Mali2Ipoh for a manual trip review.",
    };
  }

  if (travellerCount > 8) {
    return {
      isManualEnquiryRequired: true,
      title: "Group enquiry required",
      message:
        "Automated booking currently supports up to 8 travellers. Larger groups need a manual review.",
    };
  }

  if (tripDays > 9) {
    return {
      isManualEnquiryRequired: true,
      title: "Manual enquiry required",
      message:
        "Automated booking currently supports trips of up to 9 days. Longer trips need a manual review.",
    };
  }

  return {
    isManualEnquiryRequired: false,
    title: "",
    message: "",
  };
}

function getTripWeekdays(state) {
  const tripDays = getTripDays(state);

  return Array.from({ length: tripDays }, (_, index) => {
    const dateString = addLocalDays(state.arrivalDate, index);
    const date = dateString ? new Date(`${dateString}T00:00:00`) : null;
    return date ? date.getDay() : null;
  }).filter((value) => value !== null);
}

export function getClosedDestinationWarnings(state) {
  const tripWeekdays = getTripWeekdays(state);

  return getSelectedDestinations(state)
    .filter((destination) => {
      if (!Array.isArray(destination.availableDays) || destination.availableDays.length === 0) {
        return false;
      }

      return !tripWeekdays.some((weekday) => destination.availableDays.includes(weekday));
    })
    .map((destination) => ({
      destinationId: destination.id,
      name: destination.name,
      reason: `${destination.name} does not appear to open on your current trip dates.`,
    }));
}

export function buildTierPlanningSummary(state) {
  const selectedDestinations = getSelectedDestinations(state);
  const itinerary = buildItinerary(
    state.selectedDestinationIds,
    state.arrivalDate,
    state.departureDate,
  );
  const eligibility = getTierEligibility(state);
  const recommendation = getTierRecommendation(state);
  const manualEnquiry = getManualEnquiryState(state);
  const closedDestinationWarnings = getClosedDestinationWarnings(state);
  const tripDays = getTripDays(state);
  const travellerCount = getTravellerCount(state);
  const locationCount = selectedDestinations.length;

  return {
    travellerCount,
    tripDays,
    locationCount,
    itinerary,
    eligibility,
    recommendation,
    manualEnquiry,
    selectedDestinations,
    estimatedAttractionFees: getEstimatedAttractionFees(state),
    closedDestinationWarnings,
  };
}
