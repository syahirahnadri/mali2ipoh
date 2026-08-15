import { destinationsById } from "@/data/destinations";
import { guidesById } from "@/data/guides";
import { hotelsById } from "@/data/hotels";
import {
  buildMonthlyDashboardSnapshot,
  buildGuideDistributionRows,
  buildGuidePerformanceMetrics,
  buildOperationalKpis,
} from "@/lib/admin-guide-kpis";
import { buildTierAnalytics, getActiveTierId, getAssignedGuideIds } from "@/lib/admin-tier-ops";

function sortCountsDescending(entries) {
  return entries.sort((left, right) => right.count - left.count);
}

export function buildAdminAnalytics(bookings) {
  const attractionCounts = {};
  const categoryCounts = {};
  const combinationCounts = {};
  const hotelCounts = {};
  const arrivalCounts = {};
  const statusCounts = {};
  const guideCounts = {};
  let totalGroupSize = 0;

  for (const booking of bookings) {
    const destinationNames = booking.selectedDestinationIds
      .map((id) => destinationsById[id])
      .filter(Boolean);

    totalGroupSize += booking.adults + booking.children;

    destinationNames.forEach((destination) => {
      attractionCounts[destination.name] = (attractionCounts[destination.name] || 0) + 1;
      categoryCounts[destination.category] = (categoryCounts[destination.category] || 0) + 1;
    });

    if (destinationNames.length > 1) {
      const combo = destinationNames
        .map((destination) => destination.name)
        .sort()
        .join(" + ");
      combinationCounts[combo] = (combinationCounts[combo] || 0) + 1;
    }

    const hotelName = hotelsById[booking.hotelId]?.name || "Unknown Hotel";
    hotelCounts[hotelName] = (hotelCounts[hotelName] || 0) + 1;

    arrivalCounts[booking.arrivalOption] = (arrivalCounts[booking.arrivalOption] || 0) + 1;
    statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;

    const primaryGuideId = getAssignedGuideIds(booking)[0];
    const guideName = primaryGuideId
      ? guidesById[primaryGuideId]?.name || "Unknown Guide"
      : "Unassigned";
    guideCounts[guideName] = (guideCounts[guideName] || 0) + 1;
  }

  const tierAnalytics = buildTierAnalytics(bookings);
  const guidePerformance = buildGuidePerformanceMetrics(bookings);
  const operationalKpis = buildOperationalKpis(bookings);

  return {
    mostSelectedAttractions: sortCountsDescending(
      Object.entries(attractionCounts).map(([label, count]) => ({ label, count })),
    ),
    mostBookedCategories: sortCountsDescending(
      Object.entries(categoryCounts).map(([label, count]) => ({ label, count })),
    ),
    mostCommonCombinations: sortCountsDescending(
      Object.entries(combinationCounts).map(([label, count]) => ({ label, count })),
    ),
    averageGroupSize: bookings.length ? (totalGroupSize / bookings.length).toFixed(1) : "0.0",
    hotelDistribution: sortCountsDescending(
      Object.entries(hotelCounts).map(([label, count]) => ({ label, count })),
    ),
    arrivalDistribution: sortCountsDescending(
      Object.entries(arrivalCounts).map(([label, count]) => ({ label, count })),
    ),
    statusDistribution: sortCountsDescending(
      Object.entries(statusCounts).map(([label, count]) => ({ label, count })),
    ),
    guideDistribution: sortCountsDescending(
      Object.entries(guideCounts).map(([label, count]) => ({ label, count })),
    ),
    guideWorkloadDistribution: sortCountsDescending(buildGuideDistributionRows(guidePerformance.metrics)),
    tierDistribution: sortCountsDescending(
      Object.entries(
        bookings.reduce((map, booking) => {
          const tierId = getActiveTierId(booking);
          map[tierId] = (map[tierId] || 0) + 1;
          return map;
        }, {}),
      ).map(([label, count]) => ({ label, count })),
    ),
    guidePerformance,
    operationalKpis,
    monthlyDashboard: buildMonthlyDashboardSnapshot(bookings, "2026-08"),
    ...tierAnalytics,
  };
}
