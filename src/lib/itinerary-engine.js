import { destinationsById } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { addLocalDays, diffLocalCalendarDays, parseLocalDate } from "@/lib/date";

const MINUTES_PER_DAY = 420;
const PER_STOP_BUFFER = 30;

export function getTripNights(arrivalDate, departureDate) {
  return Math.max(0, diffLocalCalendarDays(arrivalDate, departureDate));
}

export function getTourDays(arrivalDate, departureDate) {
  return Math.max(1, getTripNights(arrivalDate, departureDate));
}

function getOpeningScore(destination) {
  if (!destination.openingTime) {
    return 9999;
  }

  const [hours, minutes] = destination.openingTime.split(":").map(Number);
  return hours * 60 + minutes;
}

function sortDestinationsForItinerary(selectedDestinations) {
  const zoneWeights = selectedDestinations.reduce((weights, destination) => {
    weights[destination.zone] = (weights[destination.zone] || 0) + 1;
    return weights;
  }, {});

  return [...selectedDestinations].sort((left, right) => {
    const zoneDifference = zoneWeights[right.zone] - zoneWeights[left.zone];
    if (zoneDifference !== 0) {
      return zoneDifference;
    }

    const openingDifference = getOpeningScore(left) - getOpeningScore(right);
    if (openingDifference !== 0) {
      return openingDifference;
    }

    return right.popularityScore - left.popularityScore;
  });
}

export function addDays(dateString, offset) {
  return addLocalDays(dateString, offset);
}

export function buildItinerary(selectedDestinationIds, arrivalDate, departureDate) {
  const selectedDestinations = selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean);
  const arrival = parseLocalDate(arrivalDate);
  const departure = parseLocalDate(departureDate);

  if (!arrival || !departure || departure <= arrival) {
    return {
      fitsSchedule: false,
      totalAttractionMinutes: 0,
      totalBufferedMinutes: 0,
      totalAvailableMinutes: 0,
      warning: "Please choose valid arrival and departure dates before building itinerary.",
      overflowDestinationIds: [],
      itineraryDays: [],
      unassignedDestinations: [],
      selectedDestinations,
      tourDays: 0,
    };
  }

  const tourDays = getTourDays(arrivalDate, departureDate);
  const sortedDestinations = sortDestinationsForItinerary(selectedDestinations);
  const days = Array.from({ length: tourDays }, (_, index) => ({
    dayNumber: index + 1,
    date: addDays(arrivalDate, index),
    destinationIds: [],
    estimatedMinutes: 0,
  }));
  const overflow = [];

  for (const destination of sortedDestinations) {
    const destinationMinutes = destination.estimatedMinutes + PER_STOP_BUFFER;
    const bestDay = days.find(
      (day) => day.estimatedMinutes + destinationMinutes <= MINUTES_PER_DAY,
    );

    if (!bestDay) {
      overflow.push(destination);
      continue;
    }

    bestDay.destinationIds.push(destination.id);
    bestDay.estimatedMinutes += destinationMinutes;
  }

  const totalAttractionMinutes = selectedDestinations.reduce(
    (total, destination) => total + destination.estimatedMinutes,
    0,
  );
  const totalBufferedMinutes =
    totalAttractionMinutes + selectedDestinations.length * PER_STOP_BUFFER + tourDays * 60;
  const totalAvailableMinutes = tourDays * MINUTES_PER_DAY;
  const fitsSchedule = overflow.length === 0 && totalBufferedMinutes <= totalAvailableMinutes;

  return {
    fitsSchedule,
    totalAttractionMinutes,
    totalBufferedMinutes,
    totalAvailableMinutes,
    warning:
      fitsSchedule
        ? null
        : "Your current selection is ambitious for the time available. We recommend removing one lower-priority stop or adding more touring time.",
    overflowDestinationIds: overflow.map((destination) => destination.id),
    itineraryDays: days
      .filter((day) => day.destinationIds.length > 0)
      .filter((day) => day.date >= arrivalDate && day.date < departureDate),
    unassignedDestinations: overflow,
    selectedDestinations,
    tourDays,
  };
}

export function recommendHotel({
  selectedDestinationIds,
  adults,
  children,
  arrivalDate,
  departureDate,
}) {
  const selectedDestinations = selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean);
  const groupSize = adults + children;
  const nights = getTripNights(arrivalDate, departureDate);
  const zones = selectedDestinations.map((destination) => destination.zone);
  const oldTownCount = zones.filter((zone) => zone === "Old Town").length;
  const natureCount = zones.filter((zone) => zone === "Tambun" || zone === "Jelapang").length;

  if (groupSize >= 4 || natureCount >= 2 || nights >= 3) {
    return hotels.find((hotel) => hotel.id === "hotel-tambun");
  }

  if (oldTownCount >= 2 && groupSize <= 2) {
    return hotels.find((hotel) => hotel.id === "hotel-old-town");
  }

  return hotels.find((hotel) => hotel.id === "hotel-wei-lane");
}
