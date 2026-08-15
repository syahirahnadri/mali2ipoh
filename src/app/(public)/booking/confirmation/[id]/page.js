"use client";

import { use, useEffect, useMemo, useState } from "react";
import Button from "@/components/shared/Button";
import TripBuilderPageShell from "@/components/trip-builder/TripBuilderPageShell";
import { destinationsById } from "@/data/destinations";
import { hotelsById } from "@/data/hotels";
import { formatTravellerDate } from "@/lib/date";
import { formatBookingStatus, formatTierId } from "@/lib/formatters";
import {
  getArrivalOptionLabelForTier,
  getActiveTierId,
} from "@/lib/tier-booking";
import { getBookingById } from "@/lib/storage";

function ConfirmationContent({ id }) {
  const [booking, setBooking] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setBooking(getBookingById(id));
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [id]);

  const hotel = useMemo(() => {
    if (!booking) {
      return null;
    }

    return hotelsById[booking.hotelId];
  }, [booking]);
  const tierId = booking ? getActiveTierId(booking) : null;
  const selectedDestinations = useMemo(() => {
    if (!booking) {
      return [];
    }

    return booking.selectedDestinationIds
      .map((destinationId) => destinationsById[destinationId])
      .filter(Boolean);
  }, [booking]);

  return (
    <TripBuilderPageShell
      eyebrow="Booking confirmation"
      title="Your Mali2Ipoh booking has been created."
      description="Your trip request has been received and is currently awaiting confirmation."
    >
      {!isLoaded ? (
        <section className="soft-card rounded-[2rem] p-6 md:p-8">
          <p className="text-sm text-muted">Loading booking confirmation...</p>
        </section>
      ) : null}

      {isLoaded && !booking ? (
        <section className="soft-card rounded-[2rem] p-6 md:p-8">
          <h2 className="text-xl font-semibold text-ink">Booking not found</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            We could not find a booking matching this reference.
          </p>
          <div className="mt-6">
            <Button href="/">Return to Homepage</Button>
          </div>
        </section>
      ) : null}

      {booking ? (
        <div className="space-y-6">
          <section className="soft-card rounded-[2rem] p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted">
                  Booking reference
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">{booking.reference}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted">
                  Status
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {formatBookingStatus(booking.status)}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted">
                  Traveller
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {booking.traveller.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted">
                  Estimated total
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  MYR {booking.estimatedTotalMYR || booking.totalMYR}
                </p>
              </div>
            </div>
          </section>

          <section className="soft-card rounded-[2rem] p-6 md:p-8">
            <h2 className="text-xl font-semibold text-ink">Booking summary</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <p className="text-sm leading-7 text-muted">
                Selected tier: {formatTierId(booking.selectedTierId || tierId)}
              </p>
              <p className="text-sm leading-7 text-muted">
                Recommended tier: {formatTierId(booking.recommendedTierId)}
              </p>
              <p className="text-sm leading-7 text-muted">
                Travel dates: {formatTravellerDate(booking.arrivalDate)} to {formatTravellerDate(booking.departureDate)}
              </p>
              <p className="text-sm leading-7 text-muted">
                Group size: {booking.adults} adults
                {booking.children ? ` and ${booking.children} children` : ""}
              </p>
              <p className="text-sm leading-7 text-muted">
                Hotel: {hotel?.name || "Not included or not selected"}
              </p>
              <p className="text-sm leading-7 text-muted">
                Arrival option: {getArrivalOptionLabelForTier(booking.arrivalOption, tierId)}
              </p>
              <p className="text-sm leading-7 text-muted">
                Guides required: {booking.guidesRequired || 0}
              </p>
              <p className="text-sm leading-7 text-muted">
                Status: Pending Confirmation
              </p>
            </div>
          </section>

          <section className="soft-card rounded-[2rem] p-6 md:p-8">
            <h2 className="text-xl font-semibold text-ink">Selected locations</h2>
            <div className="mt-5 grid gap-3">
              {selectedDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="rounded-2xl border border-line bg-surface px-4 py-4"
                >
                  <p className="font-semibold text-ink">{destination.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {destination.zone} • {destination.estimatedMinutes} min
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-[2rem] p-6 md:p-8">
            <h2 className="text-xl font-semibold text-ink">Recommended itinerary</h2>
            <div className="mt-5 grid gap-3">
              {booking.recommendedItinerary.map((day) => (
                <div
                  key={`${day.dayNumber}-${day.date}`}
                  className="rounded-2xl border border-line bg-surface px-4 py-4"
                >
                  <p className="font-semibold text-ink">
                    Day {day.dayNumber} • {formatTravellerDate(day.date)}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {day.destinationIds
                      .map((destinationId) => destinationsById[destinationId]?.name)
                      .join(" → ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button href="/">Return to Homepage</Button>
              <Button variant="secondary" disabled>
                View My Booking
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </TripBuilderPageShell>
  );
}

export default function BookingConfirmationPage({ params }) {
  const resolvedParams = use(params);

  return <ConfirmationContent id={resolvedParams.id} />;
}
