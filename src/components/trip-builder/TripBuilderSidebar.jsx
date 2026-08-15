import { destinationsById } from "@/data/destinations";
import { TIERS } from "@/data/tiers";
import { hotelsById } from "@/data/hotels";
import { buildItinerary, getTripNights } from "@/lib/itinerary-engine";
import { buildSamplePrice } from "@/lib/pricing";

export default function TripBuilderSidebar({ state }) {
  const selectedDestinations = state.selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean);
  const itinerary = buildItinerary(
    state.selectedDestinationIds,
    state.arrivalDate,
    state.departureDate,
  );
  const nights = getTripNights(state.arrivalDate, state.departureDate);
  const hotel = hotelsById[state.hotelId];
  const pricing = buildSamplePrice(state);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <section className="soft-card rounded-[1.75rem] p-5">
        <p className="eyebrow text-xs font-semibold text-brand-deep">
          Selection summary
        </p>
        <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
          <p>
            {state.arrivalDate && state.departureDate
              ? `${state.arrivalDate} to ${state.departureDate}`
              : "Travel dates not chosen yet"}
          </p>
          <p>
            {state.adults} adults
            {state.children ? ` • ${state.children} children` : ""}
          </p>
          <p>
            {selectedDestinations.length} selected attractions
            {nights ? ` • ${nights} nights` : ""}
          </p>
          <p>
            Tier: {TIERS[state.selectedTierId]?.name || TIERS[state.recommendedTierId]?.name || "Not selected yet"}
          </p>
        </div>
      </section>

      <section className="soft-card rounded-[1.75rem] p-5">
        <p className="text-sm font-semibold text-ink">Attractions</p>
        <div className="mt-4 space-y-3">
          {selectedDestinations.length ? (
            selectedDestinations.map((destination) => (
              <div
                key={destination.id}
                className="rounded-2xl border border-line bg-surface px-4 py-3"
              >
                <p className="font-semibold text-ink">{destination.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {destination.zone} • {destination.estimatedMinutes} min
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">
              Add attractions to see a running trip summary here.
            </p>
          )}
        </div>
      </section>

      <section className="soft-card rounded-[1.75rem] p-5">
        <p className="text-sm font-semibold text-ink">System snapshot</p>
        <div className="mt-4 space-y-3 text-sm text-muted">
          <p>
            Available touring time: {itinerary.totalAvailableMinutes || 0} minutes
          </p>
          <p>
            Estimated with buffers: {itinerary.totalBufferedMinutes || 0} minutes
          </p>
          <p>
            Preferred tier: {TIERS[state.preferredTierId]?.name || "Not specified"}
          </p>
          <p>Hotel: {hotel ? hotel.name : "Not selected yet"}</p>
          <p>Estimated total: MYR {pricing.total}</p>
        </div>
      </section>
    </aside>
  );
}
