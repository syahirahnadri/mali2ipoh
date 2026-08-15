"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import FinalBookingReview from "@/components/trip-builder/FinalBookingReview";
import ProgressIndicator from "@/components/trip-builder/ProgressIndicator";
import TripBuilderPageShell from "@/components/trip-builder/TripBuilderPageShell";
import TripBuilderSidebar from "@/components/trip-builder/TripBuilderSidebar";
import { buildItinerary } from "@/lib/itinerary-engine";
import { buildSamplePrice } from "@/lib/pricing";
import { saveBookingFromState } from "@/lib/storage";
import { validateTravellerDetails } from "@/lib/validators";
import {
  TripBuilderProvider,
  useTripBuilder,
} from "@/providers/trip-builder-provider";

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-brand-deep">{error}</p>;
}

function TravellerDetailsContent() {
  const router = useRouter();
  const { state, isHydrated, updateTravellerDetails } = useTripBuilder();
  const [errors, setErrors] = useState({});
  const [hasConfirmedTerms, setHasConfirmedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef(false);
  const itinerary = useMemo(
    () => buildItinerary(state.selectedDestinationIds, state.arrivalDate, state.departureDate),
    [state.arrivalDate, state.departureDate, state.selectedDestinationIds],
  );
  const pricing = useMemo(() => buildSamplePrice(state), [state]);

  function handleSubmit() {
    if (submissionRef.current) {
      return;
    }

    const nextErrors = validateTravellerDetails(state.travellerDetails);

    if (!hasConfirmedTerms) {
      nextErrors.bookingTerms =
        "Please confirm that the information provided is correct and that you agree to the booking terms.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submissionRef.current = true;
    setIsSubmitting(true);

    try {
      const booking = saveBookingFromState({
        state,
        itineraryDays: itinerary.itineraryDays,
        pricing,
      });

      router.replace(`/booking/confirmation/${booking.id}`);
    } catch {
      submissionRef.current = false;
      setIsSubmitting(false);
      setErrors({
        submit:
          "We could not save the booking in this browser. Please try again in a moment.",
      });
    }
  }

  return (
    <TripBuilderPageShell
      eyebrow="Traveller details"
      title="Add the lead traveller information and confirm the booking."
      description="This is the final booking step for the POC. Complete the required traveller details, review the trip one last time, and confirm the booking."
    >
      <ProgressIndicator currentStep="traveller" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <article className="soft-card rounded-[2rem] p-6 md:p-8">
            {!isHydrated ? (
              <p className="text-sm text-muted">Loading your current trip...</p>
            ) : null}

            <h2 className="text-xl font-semibold text-ink">Traveller details</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Full name</span>
                <input
                  type="text"
                  value={state.travellerDetails.fullName}
                  onChange={(event) =>
                    updateTravellerDetails({ fullName: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
                <FieldError error={errors.fullName} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Nationality</span>
                <input
                  type="text"
                  value={state.travellerDetails.nationality}
                  onChange={(event) =>
                    updateTravellerDetails({ nationality: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
                <FieldError error={errors.nationality} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Email address</span>
                <input
                  type="email"
                  value={state.travellerDetails.email}
                  onChange={(event) =>
                    updateTravellerDetails({ email: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
                <FieldError error={errors.email} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  WhatsApp number with country code
                </span>
                <input
                  type="text"
                  value={state.travellerDetails.whatsapp}
                  onChange={(event) =>
                    updateTravellerDetails({ whatsapp: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  placeholder="+44 7123 456789"
                />
                <FieldError error={errors.whatsapp} />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-ink">Emergency contact</span>
                <input
                  type="text"
                  value={state.travellerDetails.emergencyContact}
                  onChange={(event) =>
                    updateTravellerDetails({ emergencyContact: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
                <FieldError error={errors.emergencyContact} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Dietary requirements
                </span>
                <textarea
                  value={state.travellerDetails.dietaryRequirements}
                  onChange={(event) =>
                    updateTravellerDetails({
                      dietaryRequirements: event.target.value,
                    })
                  }
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Accessibility requirements
                </span>
                <textarea
                  value={state.travellerDetails.accessibilityRequirements}
                  onChange={(event) =>
                    updateTravellerDetails({
                      accessibilityRequirements: event.target.value,
                    })
                  }
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-ink">Special requests</span>
                <textarea
                  value={state.travellerDetails.specialRequests}
                  onChange={(event) =>
                    updateTravellerDetails({ specialRequests: event.target.value })
                  }
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                />
              </label>
            </div>
          </article>

          <article className="soft-card rounded-[2rem] p-6 md:p-8">
            <h2 className="text-xl font-semibold text-ink">Final booking review</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Please review the trip, arrival information, traveller details, and final total before confirming the booking.
            </p>

            <div className="mt-6">
              <FinalBookingReview
                state={state}
                itineraryDays={itinerary.itineraryDays}
                pricing={pricing}
              />
            </div>
          </article>

          <article className="soft-card rounded-[2rem] p-6 md:p-8">
            <label className="flex items-start gap-3 text-sm leading-7 text-ink">
              <input
                type="checkbox"
                checked={hasConfirmedTerms}
                onChange={(event) => setHasConfirmedTerms(event.target.checked)}
                className="mt-1"
              />
              <span>
                I confirm that the information provided is correct and I agree to
                the booking terms.
              </span>
            </label>
            <FieldError error={errors.bookingTerms} />
            <FieldError error={errors.submit} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button href="/trip-builder?step=review" variant="secondary">
                Back to Trip Review
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Confirming Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </article>
        </section>

        <TripBuilderSidebar state={state} />
      </div>
    </TripBuilderPageShell>
  );
}

export default function CheckoutPage() {
  return (
    <TripBuilderProvider>
      <TravellerDetailsContent />
    </TripBuilderProvider>
  );
}
