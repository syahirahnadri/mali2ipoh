"use client";

import { useState } from "react";
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

function AnalyticsList({ title, items, formatter, maxHeightClass = "" }) {
  return (
    <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-ink sm:text-xl">{title}</h2>
      <div className={`mt-4 space-y-2.5 ${maxHeightClass}`.trim()}>
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

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
        active
          ? "bg-brand text-white shadow-[0_12px_24px_rgba(21,110,168,0.22)]"
          : "border border-[#d8e5ef] bg-white text-muted hover:border-brand/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
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

function FocusCard({ title, value, note }) {
  return (
    <article className="admin-card rounded-[1.5rem] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
    </article>
  );
}

export default function AdminAnalyticsPage() {
  const { analytics, bookings } = useAdminBookings();
  const [activeTab, setActiveTab] = useState("overview");
  const monthly = analytics.monthlyDashboard;
  const guideLeaders = [
    { label: "Top guide", metric: monthly.guidePerformance.topGuide },
    { label: "Most punctual", metric: monthly.guidePerformance.mostPunctualGuide },
    { label: "Best rated", metric: monthly.guidePerformance.bestRatedGuide },
    { label: "Highest workload", metric: monthly.guidePerformance.highestWorkloadGuide },
  ];
  const punctualityRows = monthly.bookings
    .flatMap((booking) =>
      (booking.serviceCheckpoints || []).map((checkpoint) => ({
        booking,
        checkpoint,
      })),
    )
    .slice(0, 8);

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

          <section className="admin-card rounded-[1.75rem] p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                Overview
              </TabButton>
              <TabButton active={activeTab === "demand"} onClick={() => setActiveTab("demand")}>
                Demand
              </TabButton>
              <TabButton active={activeTab === "operations"} onClick={() => setActiveTab("operations")}>
                Operations
              </TabButton>
              <TabButton active={activeTab === "guides"} onClick={() => setActiveTab("guides")}>
                Guides
              </TabButton>
            </div>
          </section>

          {activeTab === "overview" ? (
            <>
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Monthly revenue"
                  value={formatCurrency(monthly.totalRevenue)}
                  note={`Average booking value ${formatCurrency(monthly.operationalKpis.averageBookingValue)}`}
                  highlight
                />
                <SummaryCard
                  title="Bookings created"
                  value={String(monthly.bookings.length)}
                  note="New bookings created during the current review window."
                  highlight
                />
                <SummaryCard
                  title="Trips needing guides"
                  value={String(monthly.operationalKpis.upcomingTripsNeedingGuide)}
                  note="Immediate operational risk ahead of future arrivals."
                  highlight
                />
                <SummaryCard
                  title="Service quality"
                  value={String(monthly.ratingAverage)}
                  note="Average guide rating from recorded traveller feedback."
                  highlight
                />
              </section>

              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FocusCard
                  title="Pending confirmations"
                  value={analytics.statusDistribution.find((item) => item.label === "PENDING_CONFIRMATION")?.count || 0}
                  note="Requests still waiting for confirmation."
                />
                <FocusCard
                  title="KLIA pickups"
                  value={monthly.kliaPickups}
                  note="Airport arrivals needing transport coordination."
                />
                <FocusCard
                  title="Smart Comfort acceptance"
                  value={`${analytics.smartComfortRecommendationAcceptanceRate}%`}
                  note="How often the recommended core tier gets accepted."
                />
                <FocusCard
                  title="Avg group size"
                  value={analytics.averageGroupSize}
                  note="Average traveller count across all tiers."
                />
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-ink sm:text-xl">Needs attention today</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                      <p className="text-muted">Upcoming guide gaps</p>
                      <p className="mt-1 font-semibold text-ink">{monthly.operationalKpis.upcomingTripsNeedingGuide}</p>
                    </div>
                    <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                      <p className="text-muted">Change request rate</p>
                      <p className="mt-1 font-semibold text-ink">{monthly.operationalKpis.changeRequestRate}%</p>
                    </div>
                    <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                      <p className="text-muted">Cancellation rate</p>
                      <p className="mt-1 font-semibold text-ink">{monthly.operationalKpis.cancellationRate}%</p>
                    </div>
                    <div className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                      <p className="text-muted">Premium logistics load</p>
                      <p className="mt-1 font-semibold text-ink">{monthly.partyBusTrips}</p>
                    </div>
                  </div>
                </article>

                <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-ink sm:text-xl">Guide snapshot</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {guideLeaders.map((item) => (
                      <div key={item.label} className="admin-subtle-card rounded-2xl px-3 py-3 text-sm">
                        <p className="text-muted">{item.label}</p>
                        <p className="mt-1 font-semibold text-ink">{item.metric?.guide.name || "No data yet"}</p>
                        <p className="mt-1 text-xs text-muted">
                          Score {item.metric?.guideScore || 0} • On-time {item.metric?.onTimeRate || 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-4 xl:grid-cols-2">
                <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-ink sm:text-xl">Business summary</h2>
                  <div className="mt-4 space-y-3 text-sm text-muted">
                    <div className="admin-subtle-card rounded-2xl px-3 py-3">
                      Demand remains concentrated around Smart Comfort, which continues to act as the commercial core.
                    </div>
                    <div className="admin-subtle-card rounded-2xl px-3 py-3">
                      Guide quality is being protected through combined score, punctuality, completion, and complaint signals.
                    </div>
                    <div className="admin-subtle-card rounded-2xl px-3 py-3">
                      The earliest scalability pressure points are guide coverage, KLIA pickups, and premium multi-resource trips.
                    </div>
                  </div>
                </article>

                <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-ink sm:text-xl">Quick mixes</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <FocusCard
                      title="Tier mix"
                      value={`${monthly.exploreBookings} / ${monthly.smartComfortBookings} / ${monthly.signatureBookings}`}
                      note="Explore / Smart Comfort / Signature"
                    />
                    <FocusCard
                      title="Pickup mix"
                      value={`${monthly.kliaPickups} / ${monthly.etsPickups}`}
                      note="KLIA / ETS demand split"
                    />
                    <FocusCard
                      title="Guide load"
                      value={monthly.guidesRequired}
                      note={`${monthly.dualGuideTrips} dual-guide trips`}
                    />
                    <FocusCard
                      title="Trips per active guide"
                      value={monthly.tripsPerActiveGuide}
                      note={`${monthly.activeGuides} active guides this month`}
                    />
                  </div>
                </article>
              </section>
            </>
          ) : null}

          {activeTab === "demand" ? (
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
              <AnalyticsList title="Most selected attractions" items={analytics.mostSelectedAttractions} maxHeightClass="max-h-[22rem] overflow-y-auto pr-1" />
              <AnalyticsList title="Most booked categories" items={analytics.mostBookedCategories} />
              <AnalyticsList title="Most common combinations" items={analytics.mostCommonCombinations} maxHeightClass="max-h-[28rem] overflow-y-auto pr-1" />
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
          ) : null}

          {activeTab === "operations" ? (
            <>
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard title="Confirmed rate" value={`${monthly.operationalKpis.confirmedRate}%`} note="Conversion from request into active operational trip." />
                <SummaryCard title="Cancellation rate" value={`${monthly.operationalKpis.cancellationRate}%`} note="Demand lost after booking creation." />
                <SummaryCard title="Change request rate" value={`${monthly.operationalKpis.changeRequestRate}%`} note="Signals friction in trip planning." />
                <SummaryCard title="Readiness tracked trips" value={String(monthly.readinessTrips)} note="Trips already inside readiness tracking." />
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <AnalyticsList title="Arrival distribution" items={analytics.arrivalDistribution} formatter={formatArrivalOption} />
                <AnalyticsList title="Booking status distribution" items={analytics.statusDistribution} formatter={formatBookingStatus} />
                <AnalyticsList title="Hotel selection distribution" items={analytics.hotelDistribution} />
                <AnalyticsList title="Guide assignment distribution" items={analytics.guideDistribution} />
              </section>
            </>
          ) : null}

          {activeTab === "guides" ? (
            <>
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

              <section className="grid gap-4 lg:grid-cols-2">
                <AnalyticsList title="Guide workload distribution" items={analytics.guideWorkloadDistribution} />
                <article className="admin-card rounded-[1.75rem] p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-ink sm:text-xl">Recent punctuality checkpoints</h2>
                  <div className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
                    {punctualityRows.map(({ booking, checkpoint }) => (
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
                </article>
              </section>

              <section className="admin-card rounded-[2rem] p-6">
                <h2 className="text-xl font-semibold text-ink">Guide KPI leaderboard</h2>
                <div className="mt-5 max-h-[28rem] overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-[rgba(246,250,255,0.98)] text-muted">
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
            </>
          ) : null}
        </>
      )}
    </AdminPageFrame>
  );
}
