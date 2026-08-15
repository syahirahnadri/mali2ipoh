"use client";

import { use, useMemo, useState } from "react";
import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import FinalBookingReview from "@/components/trip-builder/FinalBookingReview";
import { getGuideRecommendation } from "@/lib/guide-matcher";
import { formatBookingStatus } from "@/lib/formatters";

export default function AdminBookingDetailsPage({ params }) {
  const { id } = use(params);
  const { bookings, isLoaded, updateBooking, addInternalNote, getNotes } = useAdminBookings();
  const booking = bookings.find((item) => item.id === id) || null;
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [noteText, setNoteText] = useState("");
  const notes = getNotes(id);
  const recommendation = useMemo(() => {
    if (!booking) {
      return null;
    }
    return getGuideRecommendation(booking, bookings);
  }, [booking, bookings]);

  if (!isLoaded) {
    return (
      <AdminPageFrame eyebrow="Booking details" title="Loading booking" description="Reading local POC booking data.">
        <section className="admin-card rounded-[2rem] p-6 text-sm text-muted">Loading booking...</section>
      </AdminPageFrame>
    );
  }

  if (!booking) {
    return (
      <AdminPageFrame eyebrow="Booking details" title="Booking not found" description="Booking missing from current browser local storage.">
        <section className="admin-card rounded-[2rem] p-6 text-sm text-muted">Booking not found.</section>
      </AdminPageFrame>
    );
  }

  function acceptBooking() {
    updateBooking(id, (current) => ({
      ...current,
      status:
        current.status === "PENDING_CONFIRMATION" ? "CONFIRMED" : current.status,
    }));
  }

  function assignGuide(guideId) {
    if (!guideId) {
      return;
    }

    const conflictCheck = getGuideRecommendation(booking, bookings);
    const allowedGuideIds = [
      conflictCheck.recommendedGuide?.id,
      ...conflictCheck.alternativeGuides.map((guide) => guide.id),
    ].filter(Boolean);

    if (!allowedGuideIds.includes(guideId)) {
      return;
    }

    updateBooking(id, (current) => ({
      ...current,
      assignedGuideId: guideId,
      status: "GUIDE_ASSIGNED",
    }));
  }

  function updateStatus() {
    if (!statusValue) {
      return;
    }

    updateBooking(id, { status: statusValue });
    setStatusValue("");
  }

  function saveNote() {
    if (!noteText.trim()) {
      return;
    }

    addInternalNote(id, {
      createdAt: new Date().toISOString(),
      text: noteText.trim(),
    });
    setNoteText("");
  }

  function cancelBooking() {
    if (!window.confirm("Cancel this booking?")) {
      return;
    }

    updateBooking(id, { status: "CANCELLED" });
  }

  return (
    <AdminPageFrame
      eyebrow="Booking details"
      title={booking.reference}
      description="Accept booking, review guide recommendation, assign guide, update status, add internal notes, or cancel booking."
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Current status</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {formatBookingStatus(booking.status)}
              {booking.assignedGuideId ? ` • Guide assigned: ${booking.assignedGuideId}` : ""}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={acceptBooking}
                className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              >
                Accept Booking
              </button>
              {recommendation?.recommendedGuide ? (
                <button
                  type="button"
                  onClick={() => assignGuide(recommendation.recommendedGuide.id)}
                  className="admin-input rounded-full px-5 py-3 text-sm font-semibold text-ink"
                >
                  Assign Recommended Guide
                </button>
              ) : null}
              <button
                type="button"
                onClick={cancelBooking}
                className="rounded-full border border-brand/30 bg-brand/5 px-5 py-3 text-sm font-semibold text-brand-deep"
              >
                Cancel Booking
              </button>
            </div>
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Customer information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <p className="text-sm text-muted">Traveller: {booking.traveller.fullName}</p>
              <p className="text-sm text-muted">Nationality: {booking.traveller.nationality}</p>
              <p className="text-sm text-muted">Email: {booking.traveller.email}</p>
              <p className="text-sm text-muted">WhatsApp: {booking.traveller.whatsapp}</p>
              <p className="text-sm text-muted">Emergency contact: {booking.traveller.emergencyContact}</p>
              <p className="text-sm text-muted">Adults: {booking.adults} • Children: {booking.children}</p>
              <p className="text-sm text-muted md:col-span-2">Dietary requirements: {booking.traveller.dietaryRequirements || "None"}</p>
              <p className="text-sm text-muted md:col-span-2">Accessibility requirements: {booking.traveller.accessibilityRequirements || "None"}</p>
              <p className="text-sm text-muted md:col-span-2">Special requests: {booking.traveller.specialRequests || "None"}</p>
            </div>
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <FinalBookingReview
              state={{
                ...booking,
                travellerDetails: {
                  ...booking.traveller,
                },
              }}
              itineraryDays={booking.recommendedItinerary}
              pricing={{ lineItems: booking.priceBreakdown, total: booking.totalMYR, nights: booking.totalNights }}
              travellerDetails={booking.traveller}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Guide recommendation</h2>
            {recommendation?.recommendedGuide ? (
              <>
                <div className="admin-highlight mt-4 rounded-[1.5rem] p-4">
                  <p className="font-semibold text-ink">{recommendation.recommendedGuide.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    Match {recommendation.recommendedGuide.matchPercentage}%
                  </p>
                  <div className="mt-3 space-y-1">
                    {recommendation.recommendedGuide.reasons.map((reason) => (
                      <p key={reason} className="text-sm text-muted">{reason}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold text-ink">Alternative eligible guides</p>
                  {recommendation.alternativeGuides.length ? (
                    recommendation.alternativeGuides.map((guide) => (
                      <button
                        key={guide.id}
                        type="button"
                        onClick={() => setSelectedGuideId(guide.id)}
                        className={`block w-full rounded-2xl border px-4 py-3 text-left ${
                          selectedGuideId === guide.id
                            ? "border-brand bg-brand/5"
                            : "admin-input"
                        }`}
                      >
                        <p className="font-semibold text-ink">{guide.name}</p>
                        <p className="mt-1 text-sm text-muted">Match {guide.matchPercentage}%</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No alternative eligible guides.</p>
                  )}
                </div>

                {selectedGuideId ? (
                  <button
                    type="button"
                    onClick={() => assignGuide(selectedGuideId)}
                    className="admin-input mt-4 rounded-full px-5 py-3 text-sm font-semibold text-ink"
                  >
                    Choose Another Guide
                  </button>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">{recommendation?.noGuideReason}</p>
            )}
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Update status</h2>
            <div className="mt-4 flex flex-col gap-3">
              <select
                value={statusValue}
                onChange={(event) => setStatusValue(event.target.value)}
                className="admin-input rounded-2xl px-4 py-3 text-sm text-ink"
              >
                <option value="">Choose status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="GUIDE_ASSIGNED">Guide Assigned</option>
                <option value="READY">Ready</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="INFORMATION_REQUIRED">Information Required</option>
                <option value="CHANGE_REQUESTED">Change Requested</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                type="button"
                onClick={updateStatus}
                className="admin-input rounded-full px-5 py-3 text-sm font-semibold text-ink"
              >
                Update Status
              </button>
            </div>
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Internal notes</h2>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows="4"
              className="admin-input mt-4 w-full rounded-2xl px-4 py-3 text-sm text-ink"
              placeholder="Add internal note"
            />
            <button
              type="button"
              onClick={saveNote}
              className="admin-input mt-4 rounded-full px-5 py-3 text-sm font-semibold text-ink"
            >
              Add Internal Note
            </button>
            <div className="mt-5 space-y-3">
              {notes.length ? (
                notes.map((note) => (
                  <div key={note.createdAt} className="admin-subtle-card rounded-2xl px-4 py-3">
                    <p className="text-sm text-muted">{note.createdAt}</p>
                    <p className="mt-2 text-sm text-ink">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No internal notes yet.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </AdminPageFrame>
  );
}
