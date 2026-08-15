import { destinationsById } from "@/data/destinations";
import { guides, guidesById } from "@/data/guides";
import { diffLocalCalendarDays, parseLocalDate } from "@/lib/date";
import { PICKUP_OPTIONS } from "@/types";

function getDateRange(dateFrom, dateTo) {
  const totalDays = Math.max(0, diffLocalCalendarDays(dateFrom, dateTo));
  return Array.from({ length: totalDays }, (_, index) => {
    const start = parseLocalDate(dateFrom);
    start.setDate(start.getDate() + index);
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, "0");
    const day = String(start.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

function getBookingZones(booking) {
  return booking.selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean)
    .map((destination) => destination.category);
}

function getLuggageQuantity(booking) {
  return Number(booking.arrivalDetails?.luggageQuantity || 0);
}

function guideHasAssignmentConflict(guide, booking, allBookings) {
  const bookingDates = new Set(getDateRange(booking.arrivalDate, booking.departureDate));
  const hardBlockedDates = new Set([
    ...(guide.unavailableDates || []),
    ...(guide.currentAssignments || []),
  ]);

  for (const date of bookingDates) {
    if (hardBlockedDates.has(date)) {
      return true;
    }
  }

  return allBookings.some((otherBooking) => {
    if (otherBooking.id === booking.id) {
      return false;
    }

    if (otherBooking.assignedGuideId !== guide.id) {
      return false;
    }

    const otherDates = getDateRange(otherBooking.arrivalDate, otherBooking.departureDate);
    return otherDates.some((date) => bookingDates.has(date));
  });
}

function buildRejectionReason(guide, booking, allBookings) {
  const groupSize = booking.adults + booking.children;
  const luggageQuantity = getLuggageQuantity(booking);
  const needsLuggageCapacity = luggageQuantity > 0;

  if (guideHasAssignmentConflict(guide, booking, allBookings)) {
    return "Guide unavailable during travel dates or already assigned to overlapping booking.";
  }

  if (groupSize > guide.maxPassengers) {
    return "Guide vehicle cannot support group size.";
  }

  if (needsLuggageCapacity && groupSize > guide.maxPassengersWithLuggage) {
    return "Guide vehicle cannot support group with luggage.";
  }

  if (
    booking.arrivalOption !== PICKUP_OPTIONS.SELF_ARRIVAL &&
    !guide.pickupCapabilities.includes(booking.arrivalOption)
  ) {
    return "Guide cannot support selected pickup type.";
  }

  if (
    booking.preferredLanguage &&
    !guide.languages.includes(booking.preferredLanguage)
  ) {
    return "Guide does not support traveller preferred language.";
  }

  return null;
}

function scoreGuide(guide, booking, allBookings) {
  const bookingCategories = getBookingZones(booking);
  const expertiseMatches = bookingCategories.filter((category) =>
    guide.expertise.includes(category),
  ).length;
  const uniqueCategories = new Set(bookingCategories).size || 1;
  const languageScore = guide.languages.includes(booking.preferredLanguage) ? 30 : 0;
  const expertiseScore = Math.round((expertiseMatches / uniqueCategories) * 30);
  const internationalScore = guide.internationalTravellerExperience ? 15 : 0;
  const ratingScore = Math.round((guide.rating / 5) * 15);
  const workloadCount = allBookings.filter(
    (storedBooking) => storedBooking.assignedGuideId === guide.id,
  ).length;
  const workloadScore = Math.max(0, 10 - Math.min(10, workloadCount * 2));

  const score =
    languageScore +
    expertiseScore +
    internationalScore +
    ratingScore +
    workloadScore;

  const reasons = [];

  if (languageScore) {
    reasons.push(`Supports ${booking.preferredLanguage}`);
  }

  if (expertiseScore) {
    reasons.push("Strong expertise match for selected trip themes");
  }

  if (internationalScore) {
    reasons.push("Experienced with international travellers");
  }

  if (ratingScore >= 13) {
    reasons.push("High customer rating");
  }

  if (workloadScore >= 6) {
    reasons.push("Balanced current workload");
  }

  return { score, reasons };
}

export function getGuideRecommendation(booking, allBookings = []) {
  const eligible = [];
  const rejected = [];

  for (const guide of guides) {
    const reason = buildRejectionReason(guide, booking, allBookings);

    if (reason) {
      rejected.push({ guide, reason });
      continue;
    }

    const result = scoreGuide(guide, booking, allBookings);
    eligible.push({
      guide,
      score: result.score,
      reasons: result.reasons,
    });
  }

  eligible.sort((left, right) => right.score - left.score);

  const recommended = eligible[0] || null;
  const alternatives = eligible.slice(1);

  return {
    recommendedGuide: recommended
      ? {
          ...recommended.guide,
          matchPercentage: Math.min(100, recommended.score),
          reasons: recommended.reasons,
        }
      : null,
    alternativeGuides: alternatives.map((entry) => ({
      ...entry.guide,
      matchPercentage: Math.min(100, entry.score),
      reasons: entry.reasons,
    })),
    rejectedGuides: rejected,
    noGuideReason: recommended
      ? null
      : "No eligible guide available for selected dates, pickup, capacity, and language.",
  };
}

export function getGuideById(guideId) {
  return guidesById[guideId] || null;
}
