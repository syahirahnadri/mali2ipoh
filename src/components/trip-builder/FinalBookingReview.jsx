import { destinationsById } from "@/data/destinations";
import { TIERS } from "@/data/tiers";
import { hotelsById } from "@/data/hotels";
import { formatTravellerDate } from "@/lib/date";
import {
  getActiveTierId,
  getArrivalOptionLabelForTier,
  getGuidesRequiredForTier,
  getTierChargeableItems,
  getTierIncludedServices,
  isHotelSelectionRequired,
} from "@/lib/tier-booking";
import { PICKUP_OPTIONS } from "@/types";

function getArrivalDetailsLines(state) {
  if (state.arrivalOption === PICKUP_OPTIONS.KLIA) {
    return [
      `Terminal: ${state.arrivalDetails.terminal || "TBD"}`,
      `Airline: ${state.arrivalDetails.airline || "TBD"}`,
      `Flight: ${state.arrivalDetails.flightNumber || "TBD"}`,
      `Arrival time: ${state.arrivalDetails.arrivalTime || "TBD"}`,
      `Luggage: ${state.arrivalDetails.luggageQuantity || "TBD"}`,
    ];
  }

  if (state.arrivalOption === PICKUP_OPTIONS.ETS) {
    return [
      `Train: ${state.arrivalDetails.trainNumber || "TBD"}`,
      `Departure station: ${state.arrivalDetails.departureStation || "TBD"}`,
      `Arrival time: ${state.arrivalDetails.arrivalTime || "TBD"}`,
      `Luggage: ${state.arrivalDetails.luggageQuantity || "TBD"}`,
    ];
  }

  if (state.arrivalOption === PICKUP_OPTIONS.SELF_ARRIVAL) {
    return [
      `Meeting location: ${state.arrivalDetails.meetingLocation || "TBD"}`,
      `Expected arrival time: ${state.arrivalDetails.arrivalTime || "TBD"}`,
    ];
  }

  return [];
}

export default function FinalBookingReview({
  state,
  itineraryDays,
  pricing,
  travellerDetails,
}) {
  const tierId = getActiveTierId(state);
  const selectedDestinations = state.selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean);
  const hotel = hotelsById[state.hotelId];
  const arrivalLines = getArrivalDetailsLines(state);
  const traveller = travellerDetails || state.travellerDetails;
  const hotelRequired = isHotelSelectionRequired(tierId);
  const includedServices = getTierIncludedServices(tierId);
  const chargeableItems = getTierChargeableItems(tierId);
  const guidesRequired = getGuidesRequiredForTier(tierId);

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Tier summary</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-7 text-muted">
            Recommended tier: {TIERS[state.recommendedTierId]?.name || "TBD"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Selected tier: {TIERS[state.selectedTierId]?.name || TIERS[tierId]?.name || "TBD"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Guides required: {guidesRequired}
          </p>
          <p className="text-sm leading-7 text-muted">
            Party bus requirement: {pricing.partyBusRequired ? "Required" : "Not required"}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Travel details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-7 text-muted">
            Dates: {formatTravellerDate(state.arrivalDate)} to {formatTravellerDate(state.departureDate)}
          </p>
          <p className="text-sm leading-7 text-muted">
            Group: {state.adults} adults
            {state.children ? ` and ${state.children} children` : ""}
          </p>
          <p className="text-sm leading-7 text-muted">
            Nationality: {state.nationality || traveller.nationality || "TBD"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Preferred language: {state.preferredLanguage}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Selected destinations</h2>
        <div className="mt-4 grid gap-3">
          {selectedDestinations.map((destination) => (
            <div
              key={destination.id}
              className="rounded-2xl border border-line bg-white px-4 py-4"
            >
              <p className="font-semibold text-ink">{destination.name}</p>
              <p className="mt-1 text-sm text-muted">
                {destination.zone} • {destination.estimatedMinutes} min
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Recommended itinerary</h2>
        <div className="mt-4 grid gap-3">
          {itineraryDays.map((day) => (
            <div
              key={`${day.dayNumber}-${day.date}`}
              className="rounded-2xl border border-line bg-white px-4 py-4"
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
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Hotel and arrival</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-7 text-muted">
            Hotel: {hotelRequired
              ? `${hotel?.name || "TBD"} ${pricing.nights ? `• ${pricing.nights} nights` : ""}`
              : "Not included for Explore"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Arrival option: {getArrivalOptionLabelForTier(state.arrivalOption, tierId)}
          </p>
        </div>
        {arrivalLines.length ? (
          <div className="mt-4 grid gap-2">
            {arrivalLines.map((line) => (
              <p key={line} className="text-sm leading-7 text-muted">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        <div className="mt-4 grid gap-2">
          <p className="text-sm leading-7 text-muted">
            Included services: {includedServices.join(" • ")}
          </p>
          <p className="text-sm leading-7 text-muted">
            Chargeable add-ons: {chargeableItems.join(" • ")}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Traveller information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-7 text-muted">Full name: {traveller.fullName || "TBD"}</p>
          <p className="text-sm leading-7 text-muted">Email: {traveller.email || "TBD"}</p>
          <p className="text-sm leading-7 text-muted">
            WhatsApp: {traveller.whatsapp || "TBD"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Emergency contact: {traveller.emergencyContact || "TBD"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Dietary requirements: {traveller.dietaryRequirements || "None"}
          </p>
          <p className="text-sm leading-7 text-muted">
            Accessibility requirements: {traveller.accessibilityRequirements || "None"}
          </p>
          <p className="text-sm leading-7 text-muted md:col-span-2">
            Special requests: {traveller.specialRequests || "None"}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold text-ink">Price breakdown</h2>
        <div className="mt-4 space-y-3">
          {pricing.lineItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted">{item.label}</span>
              <span className="font-semibold text-ink">MYR {item.amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold text-ink">Estimated Total</span>
          <span className="text-2xl font-semibold text-ink">MYR {pricing.total}</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted">
          Approximate per-person value: MYR {pricing.approximatePerPersonValue}
        </p>
      </div>
    </div>
  );
}
