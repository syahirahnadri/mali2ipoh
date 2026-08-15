"use client";

import { use } from "react";
import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { getGuideMetricById } from "@/lib/admin-guide-kpis";
import { getGuideById } from "@/lib/guide-matcher";
import { formatCheckpointType, formatPunctualityStatus } from "@/lib/formatters";

export default function AdminGuideProfilePage({ params }) {
  const { id } = use(params);
  const guide = getGuideById(id);
  const { bookings } = useAdminBookings();

  if (!guide) {
    return (
      <AdminPageFrame eyebrow="Guide profile" title="Guide not found" description="Guide missing from mock data.">
        <section className="admin-card rounded-[2rem] p-6 text-sm text-muted">Guide not found.</section>
      </AdminPageFrame>
    );
  }

  const assignments = bookings.filter((booking) => booking.assignedGuideId === guide.id);
  const metric = getGuideMetricById(bookings, guide.id);
  const guideCheckpoints = assignments.flatMap((booking) =>
    Array.isArray(booking.serviceCheckpoints)
      ? booking.serviceCheckpoints.filter((checkpoint) => checkpoint.guideId === guide.id)
      : [],
  );

  return (
    <AdminPageFrame
      eyebrow="Guide profile"
      title={guide.name}
      description="Full guide information, unavailable dates, existing assignments, and performance snapshot."
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="admin-card rounded-[2rem] p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
              <p className="text-muted">Guide score</p>
              <p className="mt-1 font-semibold text-ink">{metric?.guideScore || 0}/100</p>
            </div>
            <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
              <p className="text-muted">On-time rate</p>
              <p className="mt-1 font-semibold text-ink">{metric?.onTimeRate || 0}%</p>
            </div>
            <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
              <p className="text-muted">Average guide rating</p>
              <p className="mt-1 font-semibold text-ink">{metric?.averageRating || guide.rating}</p>
            </div>
            <div className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
              <p className="text-muted">Complaints / repeat requests</p>
              <p className="mt-1 font-semibold text-ink">
                {metric?.complaintCount || 0} / {metric?.repeatRequestCount || 0}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted">
            <p>Email: {guide.email}</p>
            <p>Phone: {guide.phone}</p>
            <p>Languages: {guide.languages.join(", ")}</p>
            <p>Expertise: {guide.expertise.join(", ")}</p>
            <p>International travellers: {guide.internationalTravellerExperience ? "Yes" : "No"}</p>
            <p>KLIA pickup: {guide.pickupCapabilities.includes("KLIA") ? "Yes" : "No"}</p>
            <p>ETS pickup: {guide.pickupCapabilities.includes("ETS") ? "Yes" : "No"}</p>
            <p>Vehicle: {guide.vehicleType}</p>
            <p>Passenger capacity: {guide.maxPassengers}</p>
            <p>Passenger capacity with luggage: {guide.maxPassengersWithLuggage}</p>
            <p>Rating: {guide.rating}</p>
            <p>Completed tours: {guide.completedTours}</p>
          </div>
        </article>

        <article className="admin-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-ink">Unavailable dates</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.unavailableDates.map((date) => (
              <span key={date} className="admin-chip rounded-full px-3 py-2 text-xs text-muted">
                {date}
              </span>
            ))}
          </div>

          <h2 className="mt-6 text-xl font-semibold text-ink">Existing assignments</h2>
          <div className="mt-4 space-y-3">
            {assignments.length ? (
              assignments.map((booking) => (
                <div key={booking.id} className="admin-subtle-card rounded-2xl px-4 py-3">
                  <p className="font-semibold text-ink">{booking.reference}</p>
                  <p className="mt-1 text-sm text-muted">{booking.arrivalDate} to {booking.departureDate}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No current assigned bookings.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-card rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-ink">Punctuality checkpoints</h2>
        <div className="mt-4 space-y-3">
          {guideCheckpoints.length ? (
            guideCheckpoints.map((checkpoint) => (
              <div key={checkpoint.id} className="admin-subtle-card rounded-2xl px-4 py-3 text-sm">
                <p className="font-semibold text-ink">{formatCheckpointType(checkpoint.checkpointType)}</p>
                <p className="mt-1 text-muted">
                  Scheduled {checkpoint.scheduledMeetupTime || "Not set"} • Actual {checkpoint.guideCheckInTime || "Pending"}
                </p>
                <p className="mt-1 text-muted">
                  {formatPunctualityStatus(checkpoint.punctualityStatus)}
                  {checkpoint.minutesEarlyLate !== null && checkpoint.minutesEarlyLate !== undefined
                    ? ` • ${checkpoint.minutesEarlyLate} mins`
                    : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No punctuality checkpoints recorded yet.</p>
          )}
        </div>
      </section>
    </AdminPageFrame>
  );
}
