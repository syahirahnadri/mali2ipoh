"use client";

import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { formatArrivalOption, formatBookingStatus } from "@/lib/formatters";

function AnalyticsList({ title, items, formatter }) {
  return (
    <article className="admin-card rounded-[2rem] p-6">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="admin-subtle-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
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

export default function AdminAnalyticsPage() {
  const { analytics, bookings } = useAdminBookings();

  return (
    <AdminPageFrame
      eyebrow="Analytics"
      title="POC booking analytics"
      description="Analytics calculated only from local browser booking data. No production claims."
    >
      {!bookings.length ? (
        <section className="admin-card rounded-[2rem] p-6 text-sm text-muted">
          No POC booking data yet.
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="admin-highlight rounded-[1.75rem] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Average group size</p>
              <p className="mt-3 font-display text-4xl text-ink">{analytics.averageGroupSize}</p>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <AnalyticsList title="Most selected attractions" items={analytics.mostSelectedAttractions} />
            <AnalyticsList title="Most booked categories" items={analytics.mostBookedCategories} />
            <AnalyticsList title="Most common combinations" items={analytics.mostCommonCombinations} />
            <AnalyticsList title="Hotel selection distribution" items={analytics.hotelDistribution} />
            <AnalyticsList title="Arrival distribution" items={analytics.arrivalDistribution} formatter={formatArrivalOption} />
            <AnalyticsList title="Booking status distribution" items={analytics.statusDistribution} formatter={formatBookingStatus} />
            <AnalyticsList title="Guide assignment distribution" items={analytics.guideDistribution} />
          </section>
        </>
      )}
    </AdminPageFrame>
  );
}
