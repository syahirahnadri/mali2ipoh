"use client";

import Link from "next/link";
import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { guides } from "@/data/guides";
import { buildGuidePerformanceMetrics } from "@/lib/admin-guide-kpis";

const TODAY = "2026-08-15";

export default function AdminGuidesPage() {
  const { bookings } = useAdminBookings();
  const guidePerformance = buildGuidePerformanceMetrics(bookings);

  function isGuideBusy(guide) {
    return bookings.some(
      (booking) =>
        booking.assignedGuideId === guide.id &&
        booking.arrivalDate >= TODAY &&
        booking.status !== "CANCELLED" &&
        booking.status !== "COMPLETED",
    );
  }

  function getGuideMetric(guideId) {
    return guidePerformance.metrics.find((item) => item.guideId === guideId) || null;
  }

  return (
    <AdminPageFrame
      eyebrow="Tour guides"
      title="Guide directory"
      description="Browse guide capabilities together with punctuality, complaints, workload, and weighted monthly performance."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Top guide", value: guidePerformance.topGuide?.guide.name || "No data yet" },
          { label: "Most punctual", value: guidePerformance.mostPunctualGuide?.guide.name || "No data yet" },
          { label: "Best rated", value: guidePerformance.bestRatedGuide?.guide.name || "No data yet" },
          { label: "Highest workload", value: guidePerformance.highestWorkloadGuide?.guide.name || "No data yet" },
        ].map((item) => (
          <article key={item.label} className="admin-highlight rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-ink">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {guides.map((guide) => (
          <article key={guide.id} className="admin-card rounded-[1.75rem] p-5">
            {(() => {
              const metrics = getGuideMetric(guide.id);

              return (
                <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">{guide.name}</h2>
                <p className="mt-1 text-sm text-muted">{guide.languages.join(" • ")}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isGuideBusy(guide) ? "bg-brand/10 text-brand-deep" : "bg-accent/10 text-accent"}`}>
                {isGuideBusy(guide) ? "Busy" : "Available"}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-muted">
              <p>Expertise: {guide.expertise.join(", ")}</p>
              <p>Vehicle: {guide.vehicleType}</p>
              <p>Passenger capacity: {guide.maxPassengers}</p>
              <p>With luggage: {guide.maxPassengersWithLuggage}</p>
              <p>Pickup: {guide.pickupCapabilities.join(", ")}</p>
              <p>Rating: {guide.rating} • Completed tours: {guide.completedTours}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
                <p className="text-muted">Guide score</p>
                <p className="mt-1 font-semibold text-ink">{metrics?.guideScore || 0}/100</p>
              </div>
              <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
                <p className="text-muted">On-time rate</p>
                <p className="mt-1 font-semibold text-ink">{metrics?.onTimeRate || 0}%</p>
              </div>
              <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
                <p className="text-muted">Assigned trips</p>
                <p className="mt-1 font-semibold text-ink">{metrics?.assignedTrips || 0}</p>
              </div>
              <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
                <p className="text-muted">Complaints / repeat requests</p>
                <p className="mt-1 font-semibold text-ink">
                  {metrics?.complaintCount || 0} / {metrics?.repeatRequestCount || 0}
                </p>
              </div>
            </div>

            <Link href={`/admin/guides/${guide.id}`} className="mt-5 inline-block text-sm font-semibold text-brand-deep">
              View Profile
            </Link>
                </>
              );
            })()}
          </article>
        ))}
      </section>
    </AdminPageFrame>
  );
}
