import { guides, guidesById } from "@/data/guides";
import { getAssignedGuideIds } from "@/lib/admin-tier-ops";
import { PUNCTUALITY_STATUSES } from "@/lib/punctuality";

const COMPLETED_STATUSES = new Set(["COMPLETED"]);
const ACTIVE_STATUSES = new Set(["GUIDE_ASSIGNED", "READY", "IN_PROGRESS", "COMPLETED"]);
const MONTHLY_REVENUE_STATUSES = new Set([
  "CONFIRMED",
  "GUIDE_ASSIGNED",
  "READY",
  "IN_PROGRESS",
  "COMPLETED",
]);

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function getBookingFeedbackForGuide(booking, guideId) {
  if (!Array.isArray(booking.customerFeedback)) {
    return [];
  }

  return booking.customerFeedback.filter((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    return !item.guideId || item.guideId === guideId;
  });
}

function getCheckpointsForGuide(booking, guideId) {
  if (!Array.isArray(booking.serviceCheckpoints)) {
    return [];
  }

  return booking.serviceCheckpoints.filter((checkpoint) => {
    if (!checkpoint || typeof checkpoint !== "object") {
      return false;
    }

    return !checkpoint.guideId || checkpoint.guideId === guideId;
  });
}

function buildGuideMetric(guide, bookings) {
  const assignedBookings = bookings.filter((booking) => getAssignedGuideIds(booking).includes(guide.id));
  const assignedTrips = assignedBookings.length;
  const completedTrips = assignedBookings.filter((booking) => COMPLETED_STATUSES.has(booking.status)).length;
  const activeTrips = assignedBookings.filter((booking) => ACTIVE_STATUSES.has(booking.status)).length;
  const travellersServed = assignedBookings.reduce(
    (sum, booking) => sum + Number(booking.adults || 0) + Number(booking.children || 0),
    0,
  );
  const checkpoints = assignedBookings.flatMap((booking) => getCheckpointsForGuide(booking, guide.id));
  const feedbackEntries = assignedBookings.flatMap((booking) => getBookingFeedbackForGuide(booking, guide.id));
  const punctualityRecorded = checkpoints.filter(
    (checkpoint) =>
      checkpoint.punctualityStatus &&
      checkpoint.punctualityStatus !== PUNCTUALITY_STATUSES.PENDING,
  );
  const onTimeCheckpoints = punctualityRecorded.filter((checkpoint) =>
    [PUNCTUALITY_STATUSES.EARLY, PUNCTUALITY_STATUSES.ON_TIME].includes(checkpoint.punctualityStatus),
  ).length;
  const complaintCount = feedbackEntries.reduce(
    (sum, item) => sum + Math.max(0, Number(item.complaintCount) || 0),
    0,
  );
  const repeatRequestCount = feedbackEntries.filter((item) => Boolean(item.repeatRequest)).length;
  const ratingValues = feedbackEntries
    .map((item) => Number(item.rating))
    .filter((value) => !Number.isNaN(value) && value > 0);
  const averageRating = ratingValues.length ? round(average(ratingValues), 1) : guide.rating;
  const averageMinutesVariance = round(
    average(
      punctualityRecorded
        .map((checkpoint) => Number(checkpoint.minutesEarlyLate))
        .filter((value) => !Number.isNaN(value)),
    ),
    0,
  );

  return {
    guideId: guide.id,
    guide,
    assignedTrips,
    completedTrips,
    activeTrips,
    travellersServed,
    checkpointsTotal: checkpoints.length,
    punctualityRecordedCount: punctualityRecorded.length,
    onTimeCheckpoints,
    lateCheckpoints: punctualityRecorded.filter((checkpoint) => checkpoint.punctualityStatus === PUNCTUALITY_STATUSES.LATE).length,
    criticalLateCheckpoints: punctualityRecorded.filter((checkpoint) => checkpoint.punctualityStatus === PUNCTUALITY_STATUSES.CRITICAL_LATE).length,
    noShowCheckpoints: punctualityRecorded.filter((checkpoint) => checkpoint.punctualityStatus === PUNCTUALITY_STATUSES.NO_SHOW).length,
    onTimeRate: punctualityRecorded.length
      ? round((onTimeCheckpoints / punctualityRecorded.length) * 100, 0)
      : 0,
    averageMinutesVariance: Number.isNaN(averageMinutesVariance) ? 0 : averageMinutesVariance,
    averageRating,
    complaintCount,
    repeatRequestCount,
    feedbackCount: feedbackEntries.length,
  };
}

function attachGuideScore(metrics, maxAssignedTrips) {
  const ratingScore = (metrics.averageRating / 5) * 35;
  const punctualityScore = (metrics.onTimeRate / 100) * 20;
  const completionScore = metrics.assignedTrips
    ? (metrics.completedTrips / metrics.assignedTrips) * 15
    : 0;
  const complaintFreeScore = metrics.assignedTrips
    ? Math.max(0, 1 - (metrics.complaintCount / metrics.assignedTrips)) * 10
    : 10;
  const workloadScore = maxAssignedTrips
    ? (metrics.assignedTrips / maxAssignedTrips) * 10
    : 0;
  const repeatRequestScore = metrics.assignedTrips
    ? (metrics.repeatRequestCount / metrics.assignedTrips) * 10
    : 0;

  return {
    ...metrics,
    guideScore: round(
      ratingScore +
        punctualityScore +
        completionScore +
        complaintFreeScore +
        workloadScore +
        repeatRequestScore,
      1,
    ),
  };
}

export function buildGuidePerformanceMetrics(bookings) {
  const rawMetrics = guides.map((guide) => buildGuideMetric(guide, bookings));
  const maxAssignedTrips = rawMetrics.reduce(
    (maxValue, metric) => Math.max(maxValue, metric.assignedTrips),
    0,
  );
  const metrics = rawMetrics
    .map((metric) => attachGuideScore(metric, maxAssignedTrips))
    .sort((left, right) => right.guideScore - left.guideScore);

  return {
    metrics,
    topGuide: metrics[0] || null,
    bestRatedGuide: [...metrics].sort((left, right) => right.averageRating - left.averageRating)[0] || null,
    mostPunctualGuide: [...metrics].sort((left, right) => right.onTimeRate - left.onTimeRate)[0] || null,
    highestWorkloadGuide: [...metrics].sort((left, right) => right.assignedTrips - left.assignedTrips)[0] || null,
  };
}

export function getGuideMetricById(bookings, guideId) {
  const { metrics } = buildGuidePerformanceMetrics(bookings);
  return metrics.find((metric) => metric.guideId === guideId) || null;
}

export function buildOperationalKpis(bookings) {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((booking) =>
    ["CONFIRMED", "GUIDE_ASSIGNED", "READY", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
  ).length;
  const cancelledBookings = bookings.filter((booking) => booking.status === "CANCELLED").length;
  const changeRequestedBookings = bookings.filter((booking) => booking.status === "CHANGE_REQUESTED").length;
  const informationRequiredBookings = bookings.filter((booking) => booking.status === "INFORMATION_REQUIRED").length;
  const readyTrips = bookings.filter((booking) => booking.status === "READY").length;
  const upcomingTripsNeedingGuide = bookings.filter(
    (booking) => booking.arrivalDate >= "2026-08-15" && getAssignedGuideIds(booking).length < (booking.guidesRequired || 1),
  ).length;
  const revenue = bookings.reduce((sum, booking) => sum + Number(booking.totalMYR || 0), 0);

  return {
    totalBookings,
    confirmedRate: totalBookings ? round((confirmedBookings / totalBookings) * 100, 0) : 0,
    cancellationRate: totalBookings ? round((cancelledBookings / totalBookings) * 100, 0) : 0,
    changeRequestRate: totalBookings ? round((changeRequestedBookings / totalBookings) * 100, 0) : 0,
    informationRequiredRate: totalBookings ? round((informationRequiredBookings / totalBookings) * 100, 0) : 0,
    readinessRate: totalBookings ? round((readyTrips / totalBookings) * 100, 0) : 0,
    averageBookingValue: totalBookings ? round(revenue / totalBookings, 0) : 0,
    upcomingTripsNeedingGuide,
  };
}

export function filterBookingsForMonth(bookings, monthKey) {
  return bookings.filter((booking) => {
    const createdAt = typeof booking.createdAt === "string" ? booking.createdAt : "";
    return createdAt.startsWith(monthKey);
  });
}

export function buildMonthlyDashboardSnapshot(bookings, monthKey = "2026-08") {
  const monthBookings = filterBookingsForMonth(bookings, monthKey);
  const guidePerformance = buildGuidePerformanceMetrics(monthBookings);
  const operationalKpis = buildOperationalKpis(monthBookings);
  const totalRevenue = monthBookings
    .filter((booking) => MONTHLY_REVENUE_STATUSES.has(booking.status))
    .reduce((sum, booking) => sum + Number(booking.totalMYR || 0), 0);
  const smartComfortBookings = monthBookings.filter(
    (booking) => booking.selectedTierId === "SMART_COMFORT",
  ).length;
  const signatureBookings = monthBookings.filter(
    (booking) => booking.selectedTierId === "SIGNATURE",
  ).length;
  const exploreBookings = monthBookings.filter(
    (booking) => booking.selectedTierId === "EXPLORE",
  ).length;
  const kliaPickups = monthBookings.filter((booking) => booking.arrivalOption === "KLIA").length;
  const etsPickups = monthBookings.filter((booking) => booking.arrivalOption === "ETS").length;
  const guidesRequired = monthBookings.reduce(
    (sum, booking) => sum + Math.max(1, Number(booking.guidesRequired) || 1),
    0,
  );
  const activeGuides = guidePerformance.metrics.filter((metric) => metric.assignedTrips > 0).length;
  const dualGuideTrips = monthBookings.filter((booking) => (booking.guidesRequired || 0) >= 2).length;
  const partyBusTrips = monthBookings.filter((booking) => booking.partyBusRequired).length;
  const readinessTrips = monthBookings.filter((booking) =>
    ["READY", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
  ).length;
  const ratingAverage = guidePerformance.metrics.length
    ? round(
        average(
          guidePerformance.metrics
            .map((metric) => Number(metric.averageRating))
            .filter((value) => !Number.isNaN(value) && value > 0),
        ),
        1,
      )
    : 0;

  return {
    monthKey,
    bookings: monthBookings,
    guidePerformance,
    operationalKpis,
    totalRevenue,
    smartComfortBookings,
    signatureBookings,
    exploreBookings,
    kliaPickups,
    etsPickups,
    guidesRequired,
    activeGuides,
    dualGuideTrips,
    partyBusTrips,
    readinessTrips,
    ratingAverage,
    tripsPerActiveGuide: activeGuides ? round(monthBookings.length / activeGuides, 1) : 0,
  };
}

export function buildGuideDistributionRows(metrics) {
  return metrics.map((item) => ({
    label: item.guide.name,
    count: item.assignedTrips,
  }));
}

export function getGuideName(guideId) {
  return guidesById[guideId]?.name || guideId;
}
