"use client";

import Link from "next/link";
import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { guides } from "@/data/guides";

const TODAY = "2026-08-14";

export default function AdminGuidesPage() {
  const { bookings } = useAdminBookings();

  function isGuideBusy(guide) {
    return bookings.some(
      (booking) =>
        booking.assignedGuideId === guide.id &&
        booking.arrivalDate >= TODAY &&
        booking.status !== "CANCELLED" &&
        booking.status !== "COMPLETED",
    );
  }

  return (
    <AdminPageFrame
      eyebrow="Tour guides"
      title="Guide directory"
      description="Browse guide capabilities, vehicle limits, languages, expertise, pickup support, and availability."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {guides.map((guide) => (
          <article key={guide.id} className="admin-card rounded-[1.75rem] p-5">
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

            <Link href={`/admin/guides/${guide.id}`} className="mt-5 inline-block text-sm font-semibold text-brand-deep">
              View Profile
            </Link>
          </article>
        ))}
      </section>
    </AdminPageFrame>
  );
}
