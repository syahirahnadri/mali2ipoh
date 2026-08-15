import { BOOKING_STATUSES } from "@/types";
import {
  DEMO_SOURCE,
  demoPresentationBookings,
  demoPresentationNotes,
} from "@/data/demo-bookings";
import {
  getActiveTierId,
  getGuidesRequiredForTier,
} from "@/lib/tier-booking";
import { TIERS } from "@/data/tiers";

const BOOKINGS_KEY = "mali2ipoh-bookings";
const BOOKING_COUNTER_KEY = "mali2ipoh-booking-counter";
const BOOKING_NOTES_KEY = "mali2ipoh-booking-notes";

const EMPTY_TRAVELLER = {
  fullName: "",
  nationality: "",
  email: "",
  whatsapp: "",
  emergencyContact: "",
  dietaryRequirements: "",
  accessibilityRequirements: "",
  specialRequests: "",
};

const EMPTY_ARRIVAL_DETAILS = {
  terminal: "",
  airline: "",
  flightNumber: "",
  arrivalTime: "",
  luggageQuantity: "",
  oversizedLuggage: false,
  trainNumber: "",
  departureStation: "",
  meetingLocation: "",
};

function normalizeServiceCheckpoints(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => item && typeof item === "object").map((item) => ({
    id: item.id || "",
    checkpointType: item.checkpointType || "",
    scheduledMeetupTime: item.scheduledMeetupTime || "",
    scheduledMeetupLocation: item.scheduledMeetupLocation || "",
    guideId: item.guideId || "",
    guideCheckInTime: item.guideCheckInTime || "",
    guideCheckInMethod: item.guideCheckInMethod || "",
    customerArrivalConfirmedTime: item.customerArrivalConfirmedTime || "",
    adminVerifiedTime: item.adminVerifiedTime || "",
    punctualityStatus: item.punctualityStatus || "",
    minutesEarlyLate:
      item.minutesEarlyLate === null || item.minutesEarlyLate === undefined
        ? null
        : Number(item.minutesEarlyLate) || 0,
    punctualityNote: item.punctualityNote || "",
  }));
}

function normalizeCustomerFeedback(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => item && typeof item === "object").map((item) => ({
    guideId: item.guideId || "",
    rating: Number(item.rating) || 0,
    complaintCount: Number(item.complaintCount) || 0,
    repeatRequest: Boolean(item.repeatRequest),
    comment: item.comment || "",
    submittedAt: item.submittedAt || "",
  }));
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function normalizePriceLineItems(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeBooking(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const pricingBreakdown = normalizePriceLineItems(
    record.pricingBreakdown || record.priceBreakdown,
  );
  const estimatedTotalMYR = Number(record.estimatedTotalMYR ?? record.totalMYR) || 0;
  const traveller =
    record.traveller && typeof record.traveller === "object" ? record.traveller : {};
  const arrivalDetails =
    record.arrivalDetails && typeof record.arrivalDetails === "object"
      ? record.arrivalDetails
      : {};

  return {
    ...record,
    childrenAges: Array.isArray(record.childrenAges) ? record.childrenAges : [],
    selectedDestinationIds: normalizeStringArray(record.selectedDestinationIds),
    recommendedItinerary: Array.isArray(record.recommendedItinerary)
      ? record.recommendedItinerary
      : [],
    traveller: {
      ...EMPTY_TRAVELLER,
      ...traveller,
    },
    arrivalDetails: {
      ...EMPTY_ARRIVAL_DETAILS,
      ...arrivalDetails,
    },
    priceBreakdown: pricingBreakdown,
    pricingBreakdown,
    totalMYR: estimatedTotalMYR,
    estimatedTotalMYR,
    totalNights: Number(record.totalNights) || 0,
    status: record.status || BOOKING_STATUSES.PENDING_CONFIRMATION,
    preferredTierId: record.preferredTierId || null,
    recommendedTierId: record.recommendedTierId || null,
    selectedTierId: record.selectedTierId || null,
    tierMatchScore: Number(record.tierMatchScore) || 0,
    tierRecommendationReasons: Array.isArray(record.tierRecommendationReasons)
      ? record.tierRecommendationReasons
      : [],
    eligibleTierIds: normalizeStringArray(record.eligibleTierIds),
    tierIneligibilityReasons:
      record.tierIneligibilityReasons && typeof record.tierIneligibilityReasons === "object"
        ? record.tierIneligibilityReasons
        : {},
    smallGroupSupplementApplied: Boolean(record.smallGroupSupplementApplied),
    guidesRequired: Number(record.guidesRequired) || 0,
    multilingualRequired: Boolean(record.multilingualRequired),
    partyBusRequired: Boolean(record.partyBusRequired),
    pickupIncluded: Boolean(record.pickupIncluded),
    estimatedTotalLabel: record.estimatedTotalLabel || "Estimated Total",
    serviceCheckpoints: normalizeServiceCheckpoints(record.serviceCheckpoints),
    customerFeedback: normalizeCustomerFeedback(record.customerFeedback),
  };
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getStoredBookings() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const raw = storage.getItem(BOOKINGS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((booking) => normalizeBooking(booking)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function getBookingById(id) {
  return getStoredBookings().find((booking) => booking.id === id) || null;
}

function setStoredBookings(bookings) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function getNextSequence(year) {
  const storage = getStorage();
  const bookings = getStoredBookings();
  const currentValue = Number(storage?.getItem(BOOKING_COUNTER_KEY) || "0");
  const maxExisting = bookings.reduce((maxValue, booking) => {
    const match = /^M2I-(\d{4})-(\d{4})$/.exec(booking.reference || "");
    if (!match) {
      return maxValue;
    }

    const bookingYear = Number(match[1]);
    const sequence = Number(match[2]);

    if (bookingYear !== year) {
      return maxValue;
    }

    return Math.max(maxValue, sequence);
  }, 0);
  const nextValue = Math.max(currentValue, maxExisting) + 1;

  if (storage) {
    storage.setItem(BOOKING_COUNTER_KEY, String(nextValue));
  }

  return nextValue;
}

function formatSequence(sequence) {
  return String(sequence).padStart(4, "0");
}

export function createBookingReference(sequence, year) {
  return `M2I-${year}-${formatSequence(sequence)}`;
}

export function createBookingId(sequence, year) {
  return `booking-${year}-${formatSequence(sequence)}`;
}

export function saveBookingFromState({ state, itineraryDays, pricing }) {
  const storage = getStorage();

  if (!storage) {
    throw new Error("Booking storage is only available in the browser.");
  }

  const createdAt = new Date().toISOString();
  const year = new Date(createdAt).getFullYear();
  const bookings = getStoredBookings();
  let sequence = getNextSequence(year);
  let id = createBookingId(sequence, year);
  let reference = createBookingReference(sequence, year);

  while (bookings.some((booking) => booking.id === id || booking.reference === reference)) {
    sequence += 1;
    id = createBookingId(sequence, year);
    reference = createBookingReference(sequence, year);
  }

  const selectedTierId = getActiveTierId(state);
  const selectedTier = TIERS[selectedTierId];
  const booking = {
    id,
    reference,
    createdAt,
    arrivalDate: state.arrivalDate,
    departureDate: state.departureDate,
    adults: state.adults,
    children: state.children,
    childrenAges: state.childrenAges,
    nationality: state.nationality,
    preferredLanguage: state.preferredLanguage,
    preferredTierId: state.preferredTierId,
    recommendedTierId: state.recommendedTierId,
    selectedTierId,
    tierMatchScore: state.tierMatchScore,
    tierRecommendationReasons: state.tierRecommendationReasons,
    eligibleTierIds: state.eligibleTierIds,
    tierIneligibilityReasons: state.tierIneligibilityReasons,
    smallGroupSupplementApplied: pricing.smallGroupSupplementApplied,
    guidesRequired: getGuidesRequiredForTier(selectedTierId),
    multilingualRequired: Boolean(selectedTier?.multilingualRequired),
    partyBusRequired: Boolean(pricing.partyBusRequired),
    pickupIncluded: Boolean(pricing.pickupIncluded),
    selectedDestinationIds: state.selectedDestinationIds,
    recommendedItinerary: itineraryDays,
    hotelId: state.hotelId,
    arrivalOption: state.arrivalOption,
    arrivalDetails: state.arrivalDetails,
    traveller: state.travellerDetails,
    pricingBreakdown: pricing.lineItems,
    priceBreakdown: pricing.lineItems,
    estimatedTotalMYR: pricing.total,
    totalMYR: pricing.total,
    totalNights: pricing.nights,
    estimatedTotalLabel: "Estimated Total",
    status: BOOKING_STATUSES.PENDING_CONFIRMATION,
    serviceCheckpoints: [],
    customerFeedback: [],
  };

  const normalizedBooking = normalizeBooking(booking);

  setStoredBookings([...bookings, normalizedBooking]);

  return normalizedBooking;
}

export function updateStoredBooking(id, updater) {
  const bookings = getStoredBookings();
  const index = bookings.findIndex((booking) => booking.id === id);

  if (index === -1) {
    return null;
  }

  const currentBooking = bookings[index];
  const nextBooking =
    typeof updater === "function"
      ? updater(currentBooking)
      : { ...currentBooking, ...updater };

  if (!nextBooking) {
    return currentBooking;
  }

  const nextBookings = [...bookings];
  nextBookings[index] = normalizeBooking(nextBooking);
  setStoredBookings(nextBookings);
  return nextBookings[index];
}

function getStoredNotesMap() {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  const raw = storage.getItem(BOOKING_NOTES_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function setStoredNotesMap(notesMap) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(BOOKING_NOTES_KEY, JSON.stringify(notesMap));
}

export function importPresentationDemoBookings() {
  const storage = getStorage();

  if (!storage) {
    return { addedCount: 0, totalCount: 0 };
  }

  const existingBookings = getStoredBookings();
  const existingIds = new Set(existingBookings.map((booking) => booking.id));
  const existingReferences = new Set(existingBookings.map((booking) => booking.reference));
  const nextDemoBookings = demoPresentationBookings
    .filter((booking) => !existingIds.has(booking.id) && !existingReferences.has(booking.reference))
    .map((booking) => normalizeBooking(booking));

  const mergedBookings = [...existingBookings, ...nextDemoBookings];
  setStoredBookings(mergedBookings);

  const notesMap = getStoredNotesMap();
  Object.entries(demoPresentationNotes).forEach(([bookingId, notes]) => {
    if (!Array.isArray(notesMap[bookingId])) {
      notesMap[bookingId] = notes;
    }
  });
  setStoredNotesMap(notesMap);

  const maxDemoSequence = mergedBookings.reduce((maxValue, booking) => {
    const match = /^M2I-(\d{4})-(\d{4})$/.exec(booking.reference || "");
    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number(match[2]));
  }, 0);
  storage.setItem(BOOKING_COUNTER_KEY, String(maxDemoSequence));

  return {
    addedCount: nextDemoBookings.length,
    totalCount: mergedBookings.length,
  };
}

export function clearPresentationDemoBookings() {
  const storage = getStorage();

  if (!storage) {
    return { removedCount: 0, totalCount: 0 };
  }

  const existingBookings = getStoredBookings();
  const filteredBookings = existingBookings.filter((booking) => booking.source !== DEMO_SOURCE);
  const removedCount = existingBookings.length - filteredBookings.length;
  setStoredBookings(filteredBookings);

  const notesMap = getStoredNotesMap();
  Object.keys(demoPresentationNotes).forEach((bookingId) => {
    delete notesMap[bookingId];
  });
  setStoredNotesMap(notesMap);

  return {
    removedCount,
    totalCount: filteredBookings.length,
  };
}

export function getBookingInternalNotes(bookingId) {
  const notesMap = getStoredNotesMap();
  return Array.isArray(notesMap[bookingId]) ? notesMap[bookingId] : [];
}

export function appendBookingInternalNote(bookingId, note) {
  const notesMap = getStoredNotesMap();
  const nextNotes = [
    ...(Array.isArray(notesMap[bookingId]) ? notesMap[bookingId] : []),
    note,
  ];
  notesMap[bookingId] = nextNotes;
  setStoredNotesMap(notesMap);
  return nextNotes;
}
