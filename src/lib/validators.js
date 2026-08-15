import { guides } from "@/data/guides";
import {
  getActiveTierId,
  getSupportedArrivalOptionsForTier,
  isHotelSelectionRequired,
} from "@/lib/tier-booking";
import { getManualEnquiryState, getTripDays } from "@/lib/tier-flow";
import { PICKUP_OPTIONS } from "@/types";

const MAX_GROUP_SIZE = Math.max(...guides.map((guide) => guide.maxPassengers));
const TODAY = new Date("2026-08-14T00:00:00");

function isPastDate(value) {
  if (!value) {
    return false;
  }

  const candidate = new Date(`${value}T00:00:00`);

  return candidate < TODAY;
}

export function validateBasics(state) {
  const errors = {};
  const adults = Number(state.adults) || 0;
  const children = Number(state.children) || 0;
  const travellerCount = adults + children;
  const tripDays = getTripDays(state);
  const manualEnquiry = getManualEnquiryState(state);

  if (!state.arrivalDate) {
    errors.arrivalDate = "Please choose your arrival date.";
  } else if (isPastDate(state.arrivalDate)) {
    errors.arrivalDate = "Arrival date must be today or later.";
  }

  if (!state.departureDate) {
    errors.departureDate = "Please choose your departure date.";
  } else if (state.arrivalDate && state.departureDate <= state.arrivalDate) {
    errors.departureDate = "Departure date must be after arrival date.";
  }

  if (travellerCount < 1) {
    errors.travellers = "At least one traveller is required.";
  }

  if (travellerCount > MAX_GROUP_SIZE) {
    errors.travellers = `This POC currently supports up to ${MAX_GROUP_SIZE} travellers in one vehicle.`;
  }

  if (tripDays > 9) {
    errors.departureDate = "Automated booking currently supports trips of up to 9 days.";
  }

  if (children > 0) {
    if (state.childrenAges.length !== children) {
      errors.childrenAges = "Please add every child age.";
    } else if (state.childrenAges.some((age) => age === "")) {
      errors.childrenAges = "Please complete all child age fields.";
    }
  }

  if (!state.nationality.trim()) {
    errors.nationality = "Please enter your nationality.";
  }

  if (!state.preferredLanguage.trim()) {
    errors.preferredLanguage = "Please choose a preferred language.";
  }

  if (!`${state.generalArrivalPoint || ""}`.trim()) {
    errors.generalArrivalPoint = "Please choose how you expect to arrive.";
  }

  if (manualEnquiry.isManualEnquiryRequired) {
    errors.manualEnquiry = manualEnquiry.message;
  }

  return errors;
}

export function validateAttractions(state) {
  const errors = {};

  if (state.selectedDestinationIds.length < 2) {
    errors.selectedDestinationIds = "Please add at least 2 locations to continue.";
  }

  if (state.selectedDestinationIds.length > 8) {
    errors.selectedDestinationIds = "Automated booking supports up to 8 selected locations.";
  }

  return errors;
}

export function validateHotel(state) {
  const errors = {};
  const tierId = getActiveTierId(state);

  if (!isHotelSelectionRequired(tierId)) {
    return errors;
  }

  if (!state.hotelId) {
    errors.hotelId = "Please choose one of the three approved hotels.";
  }

  return errors;
}

export function validateArrival(state) {
  const errors = {};
  const tierId = getActiveTierId(state);
  const supportedArrivalOptions = getSupportedArrivalOptionsForTier(tierId);

  if (!state.arrivalOption) {
    errors.arrivalOption = "Please choose an arrival option.";
    return errors;
  }

  if (!supportedArrivalOptions.includes(state.arrivalOption)) {
    errors.arrivalOption = "Please choose one of the supported pickup options for the selected tier.";
    return errors;
  }

  if (state.arrivalOption === PICKUP_OPTIONS.KLIA) {
    const requiredFields = ["terminal", "airline", "flightNumber", "arrivalTime", "luggageQuantity"];
    requiredFields.forEach((field) => {
      if (!`${state.arrivalDetails[field] || ""}`.trim()) {
        errors[field] = "This field is required for KLIA pickup.";
      }
    });
  }

  if (state.arrivalOption === PICKUP_OPTIONS.ETS) {
    const requiredFields = ["trainNumber", "departureStation", "arrivalTime", "luggageQuantity"];
    requiredFields.forEach((field) => {
      if (!`${state.arrivalDetails[field] || ""}`.trim()) {
        errors[field] = "This field is required for ETS pickup.";
      }
    });
  }

  if (state.arrivalOption === PICKUP_OPTIONS.SELF_ARRIVAL) {
    const requiredFields = ["meetingLocation", "arrivalTime"];
    requiredFields.forEach((field) => {
      if (!`${state.arrivalDetails[field] || ""}`.trim()) {
        errors[field] = "This field is required for self-arrival.";
      }
    });
  }

  return errors;
}

export function getMaxGroupSize() {
  return MAX_GROUP_SIZE;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasCountryCode(value) {
  return /^\+\d[\d\s-]{6,}$/.test(value.trim());
}

export function validateTravellerDetails(travellerDetails) {
  const errors = {};

  if (!travellerDetails.fullName.trim()) {
    errors.fullName = "Please enter the traveller's full name.";
  }

  if (!travellerDetails.nationality.trim()) {
    errors.nationality = "Please enter the traveller's nationality.";
  }

  if (!travellerDetails.email.trim()) {
    errors.email = "Please enter an email address.";
  } else if (!isValidEmail(travellerDetails.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!travellerDetails.whatsapp.trim()) {
    errors.whatsapp = "Please enter a WhatsApp number.";
  } else if (!hasCountryCode(travellerDetails.whatsapp)) {
    errors.whatsapp = "WhatsApp number must include an international country code.";
  }

  if (!travellerDetails.emergencyContact.trim()) {
    errors.emergencyContact = "Please enter an emergency contact.";
  }

  return errors;
}
