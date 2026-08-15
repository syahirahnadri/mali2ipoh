"use client";

import { destinationsById } from "@/data/destinations";
import { formatTravellerDate, formatTravellerTime } from "@/lib/date";
import { buildScheduledStops } from "@/lib/itinerary-engine";

function getStops(day) {
  if (Array.isArray(day.scheduledStops) && day.scheduledStops.length > 0) {
    return day.scheduledStops;
  }

  return buildScheduledStops(day.destinationIds || []);
}

export default function ItineraryDayList({ itineraryDays, surfaceClassName = "bg-white" }) {
  return (
    <div className="mt-4 grid gap-3">
      {itineraryDays.map((day) => {
        const stops = getStops(day);

        return (
          <div
            key={`${day.dayNumber}-${day.date}`}
            className={`rounded-2xl border border-line px-4 py-4 ${surfaceClassName}`}
          >
            <p className="font-semibold text-ink">
              Day {day.dayNumber} • {formatTravellerDate(day.date)}
            </p>

            {stops.length > 0 ? (
              <div className="mt-3 grid gap-3">
                {stops.map((stop) => (
                  <div
                    key={`${day.dayNumber}-${stop.destinationId}-${stop.startTime}`}
                    className="grid gap-1 md:grid-cols-[9rem_1fr]"
                  >
                    <p className="text-sm font-medium text-ink">
                      {formatTravellerTime(stop.startTime)} - {formatTravellerTime(stop.endTime)}
                    </p>
                    <p className="text-sm text-muted">
                      {destinationsById[stop.destinationId]?.name || "Planned stop"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {(day.destinationIds || [])
                  .map((destinationId) => destinationsById[destinationId]?.name)
                  .filter(Boolean)
                  .join(" → ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
