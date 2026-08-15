"use client";

import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import {
  formatArrivalOption,
  formatBookingStatus,
  formatPunctualityStatus,
  formatTierId,
} from "@/lib/formatters";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function AnalyticsList({ title, items, formatter }) {
  return (
    <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-ink sm:text-xl">{title}</h2>
      <div className="mt-4 space-y-2.5">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.label}
              className="admin-subtle-card flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm"
            >
              <span className="text-ink">{formatter ? formatter(item.label) : item.label}</span>
              <span className="font-semibold text-brand-deep">{item.count}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No POC booking data yet.</p>
        )}
      </div>
    </article>
  );
}

function SummaryCard({ title, value, note, highlight = false }) {
  return (
    <article className={`${highlight ? "admin-highlight" : "admin-card"} rounded-[1.5rem] p-4 sm:p-5`}>
      <p className="text-xs uppercase tracking-[0.18em] text-muted sm:text-sm">{title}</p>
      <p className="mt-2 font-display text-3xl text-ink sm:mt-3 sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
    </article>
  );
}

export default function AdminAnalyticsPage() {
  const { analytics, bookings } = useAdminBookings();
  const monthly = analytics.monthlyDashboard;
  const guideLeaders = [
    { label: "Top guide", metric: monthly.guidePerformance.topGuide },
    { label: "Most punctual", metric: monthly.guidePerformance.mostPunctualGuide },
    { label: "Best rated", metric: monthly.guidePerformance.bestRatedGuide },
    { label: "Highest workload", metric: monthly.guidePerformance.highestWorkloadGuide },
  ];

  return (
    <AdminPageFrame
      eyebrow="Analytics"
      title="August 2026 operations dashboard"
      description="Presentation-ready KPI dashboard for the business review on Saturday, August 15, 2026. All figures come from local browser booking data."
    >
      {!bookings.length ? (
        <section className="admin-card rounded-[1.75rem] p-5 text-sm text-muted">
          No POC booking data yet.
        </section>
      ) : (
        <>
          <section className="admin-card rounded-[1.75rem] p-4 sm:p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.18em] text-muted sm:text-sm">Review window</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
                  August 1 to August 31, 2026
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  This dashboard is arranged to answer three business-review questions: how demand
                  is performing, whether quality is being protected, and where scalability pressure
                  appears first.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                  <p className="text-muted">Bookings created in August 2026</p>
                  <p className="mt-2 text-xl font-semibold text-ink sm:text-2xl">{monthly.bookings.length}</p>
                </div>
                <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                  <p className="text-muted">Projected booked value</p>
                  <p className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
                    {formatCurrency(monthly.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Monthly revenue"
              value={formatCurrency(monthly.totalRevenue)}
              note={`Average booking value ${formatCurrency(monthly.operationalKpis.averageBookingValue)}`}
              highlight
            />
            <SummaryCard
              title="Smart Comfort acceptance"
              value={`${analytics.smartComfortRecommendationAcceptanceRate}%`}
              note="Shows how often the recommended core tier is accepted."
              highlight
            />
            <SummaryCard
              title="Average group size"
              value={analytics.averageGroupSize}
              note="Average traveller count across all tiers."
              highlight
            />
            <SummaryCard
              title="Service quality signal"
              value={String(monthly.ratingAverage)}
              note="Average guide rating from recorded traveller feedback."
              highlight
            />
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Confirmed rate"
              value={`${monthly.operationalKpis.confirmedRate}%`}
              note="Tracks conversion from request into active operational trip."
            />
            <SummaryCard
              title="Cancellation rate"
              value={`${monthly.operationalKpis.cancellationRate}%`}
              note="Shows how much demand is lost after booking creation."
            />
            <SummaryCard
              title="Change request rate"
              value={`${monthly.operationalKpis.changeRequestRate}%`}
              note="Signals friction or mismatch in trip planning."
            />
            <SummaryCard
              title="Trips needing guides"
              value={String(monthly.operationalKpis.upcomingTripsNeedingGuide)}
              note="Immediate operational risk ahead of future arrivals."
            />
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Tier mix"
              value={`${monthly.exploreBookings} / ${monthly.smartComfortBookings} / ${monthly.signatureBookings}`}
              note="Explore / Smart Comfort / Signature bookings."
            />
            <SummaryCard
              title="Pickup mix"
              value={`${monthly.kliaPickups} / ${monthly.etsPickups}`}
              note="KLIA / ETS demand split."
            />
            <SummaryCard
              title="Guide load"
              value={String(monthly.guidesRequired)}
              note={`${monthly.dualGuideTrips} dual-guide trips • ${monthly.partyBusTrips} party-bus trips`}
            />
            <SummaryCard
              title="Trips per active guide"
              value={String(monthly.tripsPerActiveGuide)}
              note={`${monthly.activeGuides} active guides supporting August demand`}
            />
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {guideLeaders.map((item) => (
              <SummaryCard
                key={item.label}
                title={item.label}
                value={item.metric?.guide.name || "No data yet"}
                note={`Score ${item.metric?.guideScore || 0} • On-time ${item.metric?.onTimeRate || 0}%`}
              />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-ink sm:text-xl">Founder summary</h2>
              <div className="mt-4 space-y-3 text-sm text-muted">
                <div className="admin-subtle-card rounded-2xl px-3 py-3">
                  <p className="font-semibold text-ink">1. Demand is concentrated around Smart Comfort.</p>
                  <p className="mt-1">
                    This validates Smart Comfort as the current commercial core of the Mali2Ipoh offer.
                  </p>
                </div>
                <div className="admin-subtle-card rounded-2xl px-3 py-3">
                  <p className="font-semibold text-ink">2. Guide quality is measured with balance.</p>
                  <p className="mt-1">
                    Top-guide ranking now combines rating, punctuality, completion reliability, workload,
                    and complaint-free delivery rather than counting trips only.
                  </p>
                </div>
                <div className="admin-subtle-card rounded-2xl px-3 py-3">
                  <p className="font-semibold text-ink">3. Scalability pressure is visible through resource load.</p>
                  <p className="mt-1">
                    KLIA pickups, dual-guide trips, and premium logistics show where operations become heavier first.
                  </p>
                </div>
              </div>
            </article>

            <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-ink sm:text-xl">Scalability stress-test view</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                  <p className="text-muted">Readiness-tracked trips</p>
                  <p className="mt-1 font-semibold text-ink">{monthly.readinessTrips}</p>
                </div>
                <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                  <p className="text-muted">Upcoming guide gaps</p>
                  <p className="mt-1 font-semibold text-ink">{monthly.operationalKpis.upcomingTripsNeedingGuide}</p>
                </div>
                <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                  <p className="text-muted">KLIA operational load</p>
                  <p className="mt-1 font-semibold text-ink">{monthly.kliaPickups}</p>
                </div>
                <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                  <p className="text-muted">Premium logistics load</p>
                  <p className="mt-1 font-semibold text-ink">{monthly.partyBusTrips}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                These indicators answer the practical question, &quot;If bookings rise next month, what
                breaks first?&quot; The current model suggests guide capacity, KLIA support, and premium
                multi-resource trips are the earliest pressure points.
              </p>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <AnalyticsList
              title="Recommended tier distribution"
              items={analytics.recommendedTierDistribution}
              formatter={formatTierId}
            />
            <AnalyticsList
              title="Selected tier distribution"
              items={analytics.selectedTierDistribution}
              formatter={formatTierId}
            />
            <AnalyticsList title="Most selected attractions" items={analytics.mostSelectedAttractions} />
            <AnalyticsList title="Most booked categories" items={analytics.mostBookedCategories} />
            <AnalyticsList title="Most common combinations" items={analytics.mostCommonCombinations} />
            <AnalyticsList title="Hotel selection distribution" items={analytics.hotelDistribution} />
            <AnalyticsList
              title="Arrival distribution"
              items={analytics.arrivalDistribution}
              formatter={formatArrivalOption}
            />
            <AnalyticsList
              title="Booking status distribution"
              items={analytics.statusDistribution}
              formatter={formatBookingStatus}
            />
            <AnalyticsList title="Guide assignment distribution" items={analytics.guideDistribution} />
            <AnalyticsList title="Guide workload distribution" items={analytics.guideWorkloadDistribution} />
            <AnalyticsList
              title="Average estimated value by tier"
              items={analytics.averageEstimatedValueByTier.map((item) => ({
                label: item.label,
                count: item.average,
              }))}
              formatter={formatTierId}
            />
            <AnalyticsList
              title="Average group size by tier"
              items={analytics.averageGroupSizeByTier.map((item) => ({
                label: item.label,
                count: item.average,
              }))}
              formatter={formatTierId}
            />
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Guide KPI leaderboard</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted">
                  <tr className="border-b border-line">
                    {[
                      "Guide",
                      "Score",
                      "Assigned",
                      "Completed",
                      "On-time",
                      "Avg rating",
                      "Complaints",
                      "Repeat requests",
                    ].map((label) => (
                      <th key={label} className="px-2 py-3 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthly.guidePerformance.metrics.map((metric) => (
                    <tr key={metric.guideId} className="border-b border-[#eef3f7] last:border-b-0">
                      <td className="px-2 py-3 font-semibold text-ink">{metric.guide.name}</td>
                      <td className="px-2 py-3 text-muted">{metric.guideScore}</td>
                      <td className="px-2 py-3 text-muted">{metric.assignedTrips}</td>
                      <td className="px-2 py-3 text-muted">{metric.completedTrips}</td>
                      <td className="px-2 py-3 text-muted">{metric.onTimeRate}%</td>
                      <td className="px-2 py-3 text-muted">{metric.averageRating}</td>
                      <td className="px-2 py-3 text-muted">{metric.complaintCount}</td>
                      <td className="px-2 py-3 text-muted">{metric.repeatRequestCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Recorded punctuality checkpoints</h2>
            <div className="mt-5 space-y-3">
              {monthly.bookings
                .flatMap((booking) =>
                  (booking.serviceCheckpoints || []).map((checkpoint) => ({
                    booking,
                    checkpoint,
                  })),
                )
                .slice(0, 8)
                .map(({ booking, checkpoint }) => (
                  <div key={checkpoint.id} className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
                    <p className="font-semibold text-ink">
                      {booking.reference} • {checkpoint.guideId || "Unassigned"}
                    </p>
                    <p className="mt-1 text-muted">
                      {formatPunctualityStatus(checkpoint.punctualityStatus)} • Scheduled{" "}
                      {checkpoint.scheduledMeetupTime || "Not set"} • Actual{" "}
                      {checkpoint.guideCheckInTime || "Pending"}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </AdminPageFrame>
  );
}
