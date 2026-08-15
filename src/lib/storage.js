import { BOOKING_STATUSES } from "@/types";

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

  const booking = {
    id,
    reference,
    createdAt,
    arrivalDate: state.arrivalDate,
    departureDate: state.departureDate,
    adults: state.adults,
    children: state.children,
    childrenAges: state.childrenAges,
    preferredLanguage: state.preferredLanguage,
    selectedDestinationIds: state.selectedDestinationIds,
    recommendedItinerary: itineraryDays,
    hotelId: state.hotelId,
    arrivalOption: state.arrivalOption,
    arrivalDetails: state.arrivalDetails,
    traveller: state.travellerDetails,
    priceBreakdown: pricing.lineItems,
    totalMYR: pricing.total,
    totalNights: pricing.nights,
    status: BOOKING_STATUSES.PENDING_CONFIRMATION,
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
