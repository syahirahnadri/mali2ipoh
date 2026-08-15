"use client";

import { use, useMemo, useState } from "react";
import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { guidesById } from "@/data/guides";
import FinalBookingReview from "@/components/trip-builder/FinalBookingReview";
import {
  CHECKPOINT_TYPES,
  CHECK_IN_METHODS,
  deriveCheckpointType,
  evaluatePunctuality,
} from "@/lib/punctuality";
import {
  getAssignedGuideIds,
  getBookingTierValidation,
  getPartyBusAvailability,
} from "@/lib/admin-tier-ops";
import { getGuideRecommendation } from "@/lib/guide-matcher";
import {
  formatBookingStatus,
  formatCheckInMethod,
  formatCheckpointType,
  formatPunctualityStatus,
  formatTierId,
} from "@/lib/formatters";

export default function AdminBookingDetailsPage({ params }) {
  const { id } = use(params);
  const { bookings, isLoaded, updateBooking, addInternalNote, getNotes } = useAdminBookings();
  const booking = bookings.find((item) => item.id === id) || null;
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [selectedSecondGuideId, setSelectedSecondGuideId] = useState("");
  const [selectedPartyBusId, setSelectedPartyBusId] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [noteText, setNoteText] = useState("");
  const [scheduledMeetupTime, setScheduledMeetupTime] = useState("");
  const [actualCheckInTime, setActualCheckInTime] = useState("");
  const [checkpointType, setCheckpointType] = useState("");
  const [checkInMethod, setCheckInMethod] = useState("");
  const [punctualityNote, setPunctualityNote] = useState("");
  const notes = getNotes(id);
  const tierValidation = useMemo(() => {
    if (!booking) {
      return null;
    }
    return getBookingTierValidation(booking);
  }, [booking]);
  const partyBusAvailability = useMemo(() => {
    if (!booking) {
      return null;
    }
    return getPartyBusAvailability(booking);
  }, [booking]);
  const recommendation = useMemo(() => {
    if (!booking) {
      return null;
    }
    return getGuideRecommendation(booking, bookings);
  }, [booking, bookings]);
  const secondaryRecommendation = useMemo(() => {
    if (!booking || !tierValidation || tierValidation.guidesRequired < 2) {
      return null;
    }

    const blockedGuideIds = new Set(getAssignedGuideIds(booking));
    if (selectedGuideId) {
      blockedGuideIds.add(selectedGuideId);
    }

    const result = getGuideRecommendation(booking, bookings);
    const recommendedGuide = [
      result.recommendedGuide,
      ...result.alternativeGuides,
    ].filter(Boolean).find((guide) => !blockedGuideIds.has(guide.id)) || null;
    const alternatives = result.alternativeGuides.filter((guide) => !blockedGuideIds.has(guide.id));

    return {
      recommendedGuide,
      alternativeGuides: alternatives,
    };
  }, [booking, bookings, selectedGuideId, tierValidation]);

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

    updateBooking(id, (current) => {
      const nextAssignedGuideIds = tierValidation?.guidesRequired >= 2
        ? [guideId, selectedSecondGuideId].filter(Boolean)
        : [guideId];
      const nextStatus =
        tierValidation?.guidesRequired >= 2
          ? nextAssignedGuideIds.length >= 2 && (!partyBusAvailability?.required || selectedPartyBusId)
            ? "GUIDE_ASSIGNED"
            : current.status === "PENDING_CONFIRMATION"
              ? "CONFIRMED"
              : current.status
          : "GUIDE_ASSIGNED";

      return {
        ...current,
        assignedGuideId: nextAssignedGuideIds[0] || "",
        assignedGuideIds: nextAssignedGuideIds,
        assignedPartyBusId: selectedPartyBusId || current.assignedPartyBusId || "",
        status: nextStatus,
      };
    });
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

  function savePunctualityCheckpoint() {
    const primaryGuideId = getAssignedGuideIds(booking)[0];
    const effectiveScheduledMeetupTime =
      scheduledMeetupTime ||
      booking.serviceCheckpoints?.[0]?.scheduledMeetupTime ||
      booking.arrivalDetails?.arrivalTime ||
      "09:00";
    const effectiveCheckpointType =
      checkpointType ||
      booking.serviceCheckpoints?.[0]?.checkpointType ||
      deriveCheckpointType(booking.arrivalOption);
    const effectiveCheckInMethod =
      checkInMethod ||
      booking.serviceCheckpoints?.[0]?.guideCheckInMethod ||
      CHECK_IN_METHODS.ADMIN_MANUAL_UPDATE;

    if (!primaryGuideId || !effectiveScheduledMeetupTime) {
      return;
    }

    const result = evaluatePunctuality(effectiveScheduledMeetupTime, actualCheckInTime);

    updateBooking(id, (current) => ({
      ...current,
      serviceCheckpoints: [
        ...(Array.isArray(current.serviceCheckpoints) ? current.serviceCheckpoints : []).filter(
          (checkpoint) => checkpoint.id !== `${current.id}-primary-checkpoint`,
        ),
        {
          id: `${current.id}-primary-checkpoint`,
          checkpointType: effectiveCheckpointType,
          scheduledMeetupTime: effectiveScheduledMeetupTime,
          scheduledMeetupLocation:
            current.arrivalOption === "KLIA"
              ? current.arrivalDetails?.terminal || "KLIA arrival hall"
              : current.arrivalOption === "ETS"
                ? "Ipoh ETS station"
                : "Trip day meetup point",
          guideId: primaryGuideId,
          guideCheckInTime: actualCheckInTime,
          guideCheckInMethod: effectiveCheckInMethod,
          customerArrivalConfirmedTime: actualCheckInTime,
          adminVerifiedTime: new Date().toISOString(),
          punctualityStatus: result.status,
          minutesEarlyLate: result.minutesEarlyLate,
          punctualityNote: punctualityNote.trim(),
        },
      ],
    }));
    setPunctualityNote("");
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
              {getAssignedGuideIds(booking).length
                ? ` • Guides assigned: ${getAssignedGuideIds(booking).map((guideId) => guidesById[guideId]?.name || guideId).join(", ")}`
                : ""}
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
            <h2 className="text-xl font-semibold text-ink">Tier validation</h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted">Selected tier: {formatTierId(tierValidation?.tierId)}</p>
              {tierValidation?.checks.map((check) => (
                <div key={check.label} className="admin-subtle-card rounded-2xl px-4 py-3">
                  <p className="text-sm font-semibold text-ink">
                    {check.label}: {check.value} — {check.detail}
                  </p>
                </div>
              ))}
              <div className="admin-subtle-card rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold text-ink">
                  Guide requirement: {tierValidation?.guidesRequired}{" "}
                  {tierValidation?.guidesRequired === 1 ? "guide" : "guides"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Party bus: {tierValidation?.partyBusRequired ? "Required" : "Not required"}
                </p>
              </div>
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
                    Confirm Primary Guide
                  </button>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">{recommendation?.noGuideReason}</p>
            )}
          </section>

          <section className="admin-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-ink">Punctuality tracking</h2>
            <p className="mt-3 text-sm text-muted">
              Record the first service checkpoint for this booking so guide punctuality can be scored in admin analytics.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Checkpoint type</span>
                <select
                  value={
                    checkpointType ||
                    booking.serviceCheckpoints?.[0]?.checkpointType ||
                    deriveCheckpointType(booking.arrivalOption)
                  }
                  onChange={(event) => setCheckpointType(event.target.value)}
                  className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
                >
                  {Object.values(CHECKPOINT_TYPES).map((option) => (
                    <option key={option} value={option}>
                      {formatCheckpointType(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Check-in method</span>
                <select
                  value={
                    checkInMethod ||
                    booking.serviceCheckpoints?.[0]?.guideCheckInMethod ||
                    CHECK_IN_METHODS.ADMIN_MANUAL_UPDATE
                  }
                  onChange={(event) => setCheckInMethod(event.target.value)}
                  className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
                >
                  {Object.values(CHECK_IN_METHODS).map((option) => (
                    <option key={option} value={option}>
                      {formatCheckInMethod(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Scheduled meetup time</span>
                <input
                  type="time"
                  value={
                    scheduledMeetupTime ||
                    booking.serviceCheckpoints?.[0]?.scheduledMeetupTime ||
                    booking.arrivalDetails?.arrivalTime ||
                    "09:00"
                  }
                  onChange={(event) => setScheduledMeetupTime(event.target.value)}
                  className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Actual guide check-in time</span>
                <input
                  type="time"
                  value={actualCheckInTime}
                  onChange={(event) => setActualCheckInTime(event.target.value)}
                  className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Checkpoint note</span>
              <textarea
                value={punctualityNote}
                onChange={(event) => setPunctualityNote(event.target.value)}
                rows={3}
                className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
                placeholder="Optional note about guide arrival, traffic, or verification source."
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={savePunctualityCheckpoint}
                className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              >
                Save Punctuality Checkpoint
              </button>
              {booking.serviceCheckpoints?.[0] ? (
                <div className="admin-subtle-card rounded-full px-4 py-3 text-sm text-muted">
                  Last result: {formatPunctualityStatus(booking.serviceCheckpoints[0].punctualityStatus)}
                </div>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              {(booking.serviceCheckpoints || []).length ? (
                booking.serviceCheckpoints.map((checkpoint) => (
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

          {tierValidation?.guidesRequired >= 2 ? (
            <section className="admin-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-ink">Second guide requirement</h2>
              {secondaryRecommendation?.recommendedGuide ? (
                <>
                  <div className="admin-highlight mt-4 rounded-[1.5rem] p-4">
                    <p className="font-semibold text-ink">{secondaryRecommendation.recommendedGuide.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      Match {secondaryRecommendation.recommendedGuide.matchPercentage}%
                    </p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[secondaryRecommendation.recommendedGuide, ...secondaryRecommendation.alternativeGuides]
                      .filter(Boolean)
                      .map((guide) => (
                        <button
                          key={guide.id}
                          type="button"
                          onClick={() => setSelectedSecondGuideId(guide.id)}
                          className={`block w-full rounded-2xl border px-4 py-3 text-left ${
                            selectedSecondGuideId === guide.id ? "border-brand bg-brand/5" : "admin-input"
                          }`}
                        >
                          <p className="font-semibold text-ink">{guide.name}</p>
                          <p className="mt-1 text-sm text-muted">Match {guide.matchPercentage}%</p>
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">No second guide is currently eligible.</p>
              )}
            </section>
          ) : null}

          {partyBusAvailability?.required ? (
            <section className="admin-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-ink">Party-bus resource</h2>
              {partyBusAvailability.availableBuses.length ? (
                <div className="mt-4 space-y-3">
                  {partyBusAvailability.availableBuses.map((bus) => (
                    <button
                      key={bus.id}
                      type="button"
                      onClick={() => setSelectedPartyBusId(bus.id)}
                      className={`block w-full rounded-2xl border px-4 py-3 text-left ${
                        selectedPartyBusId === bus.id ? "border-brand bg-brand/5" : "admin-input"
                      }`}
                    >
                      <p className="font-semibold text-ink">{bus.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        Capacity {bus.capacity} • luggage {bus.luggageCapacity} • KLIA capable
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">No party bus is currently available.</p>
              )}
              {partyBusAvailability.unavailableReasons.length ? (
                <div className="mt-4 space-y-2">
                  {partyBusAvailability.unavailableReasons.map((reason) => (
                    <p key={reason} className="text-sm text-muted">{reason}</p>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

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
