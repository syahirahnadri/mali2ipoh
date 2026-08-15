"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DESTINATION_CATEGORIES,
  destinationsByCategory,
  destinationsById,
} from "@/data/destinations";
import { TIERS, TIER_IDS } from "@/data/tiers";
import { hotelsById } from "@/data/hotels";
import Button from "@/components/shared/Button";
import ItineraryDayList from "@/components/shared/ItineraryDayList";
import ProgressIndicator from "@/components/trip-builder/ProgressIndicator";
import TripBuilderPageShell from "@/components/trip-builder/TripBuilderPageShell";
import TripBuilderSidebar from "@/components/trip-builder/TripBuilderSidebar";
import { buildItinerary, getTripNights, recommendHotel } from "@/lib/itinerary-engine";
import { buildSamplePrice } from "@/lib/pricing";
import {
  getActiveTierId,
  getArrivalOptionLabelForTier,
  getEligibleHotelsForTier,
  getGuidesRequiredForTier,
  getSupportedArrivalOptionsForTier,
  getTierChargeableItems,
  getTierIncludedServices,
  isHotelSelectionRequired,
} from "@/lib/tier-booking";
import {
  buildTierPlanningSummary,
  getTravellerCount,
} from "@/lib/tier-flow";
import {
  getMaxGroupSize,
  validateArrival,
  validateAttractions,
  validateBasics,
  validateHotel,
} from "@/lib/validators";
import {
  TripBuilderProvider,
  useTripBuilder,
} from "@/providers/trip-builder-provider";
import { PICKUP_OPTIONS } from "@/types";

const STEP_COPY = {
  basics: {
    eyebrow: "Smart Trip Builder",
    title: "Tell us about your travel dates, group, and arrival plan.",
    description:
      "We use these basics to check whether the trip is supported, understand how you expect to arrive, and recommend the most suitable tier.",
  },
  attractions: {
    eyebrow: "Location selection",
    title: "Choose every place you want included in your Ipoh trip.",
    description:
      "You stay in control of the locations. Mali2Ipoh arranges them into a workable trip, but never silently replaces them.",
  },
  recommendation: {
    eyebrow: "Feasibility and tiers",
    title: "Review trip feasibility, then confirm the tier you want to continue with.",
    description:
      "We first check whether your selected locations are practical for the available time, then recommend the most suitable eligible tier.",
  },
  hotel: {
    eyebrow: "Hotel selection",
    title: "Choose the hotel flow that matches your selected tier.",
    description:
      "Explore continues without a hotel selection, Smart Comfort shows approved 3-4 star options, and Signature shows the current 5-star option.",
  },
  arrival: {
    eyebrow: "Arrival details",
    title: "Tell us how the trip begins.",
    description:
      "Pickup options now follow the selected tier so the transport flow matches what Mali2Ipoh can actually support.",
  },
  review: {
    eyebrow: "Trip review",
    title: "Review the trip, the selected tier, and the current sample total.",
    description:
      "This keeps the existing booking journey intact while showing the new tier recommendation outcome alongside your trip details.",
  },
};

const ARRIVAL_POINT_OPTIONS = [
  "KLIA",
  "Ipoh ETS",
  "Already in Ipoh",
  "Not decided",
];

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-brand-deep">{error}</p>;
}

function InfoPanel({ title, description, variant = "default" }) {
  const classes =
    variant === "warning"
      ? "border-brand/30 bg-brand/5"
      : variant === "accent"
        ? "border-accent/25 bg-accent/10"
        : "border-line bg-surface";

  return (
    <div className={`rounded-[1.5rem] border p-5 ${classes}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

function getCurrentStep(searchParams) {
  const rawStep = searchParams?.step;
  const step = Array.isArray(rawStep) ? rawStep[0] : rawStep;
  const allowedSteps = [
    "basics",
    "attractions",
    "recommendation",
    "hotel",
    "arrival",
    "review",
  ];

  return allowedSteps.includes(step) ? step : "basics";
}

function getPreferredTierParam(searchParams) {
  const rawValue = searchParams?.preferredTier;
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return Object.prototype.hasOwnProperty.call(TIERS, value) ? value : null;
}

function getAttractionList(activeCategory) {
  if (activeCategory === "ALL") {
    return Object.values(destinationsByCategory).flat();
  }

  return destinationsByCategory[activeCategory] || [];
}

function getLocationRulesText(travellerCount) {
  if (travellerCount >= 4) {
    return "Smart Comfort and Signature can support 2-8 selected locations for this group size.";
  }

  return "Explore may work for exactly 2 locations, but Smart Comfort can still support up to 8 for small private groups.";
}

function getTierConfirmationSelection(state, recommendation) {
  if (state.selectedTierId && recommendation.eligibleTierIds.includes(state.selectedTierId)) {
    return state.selectedTierId;
  }

  if (recommendation.recommendedTierId === TIER_IDS.SMART_COMFORT) {
    return TIER_IDS.SMART_COMFORT;
  }

  return null;
}

function ArrivalFields({ state, errors, updateArrivalDetails }) {
  if (state.arrivalOption === PICKUP_OPTIONS.KLIA) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Terminal</span>
          <input
            type="text"
            value={state.arrivalDetails.terminal}
            onChange={(event) => updateArrivalDetails({ terminal: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.terminal} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Airline</span>
          <input
            type="text"
            value={state.arrivalDetails.airline}
            onChange={(event) => updateArrivalDetails({ airline: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.airline} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Flight number</span>
          <input
            type="text"
            value={state.arrivalDetails.flightNumber}
            onChange={(event) =>
              updateArrivalDetails({ flightNumber: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.flightNumber} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Arrival time</span>
          <input
            type="time"
            value={state.arrivalDetails.arrivalTime}
            onChange={(event) => updateArrivalDetails({ arrivalTime: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.arrivalTime} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Luggage quantity</span>
          <input
            type="number"
            min="0"
            value={state.arrivalDetails.luggageQuantity}
            onChange={(event) =>
              updateArrivalDetails({ luggageQuantity: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.luggageQuantity} />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={state.arrivalDetails.oversizedLuggage}
            onChange={(event) =>
              updateArrivalDetails({ oversizedLuggage: event.target.checked })
            }
          />
          Oversized luggage
        </label>
      </div>
    );
  }

  if (state.arrivalOption === PICKUP_OPTIONS.ETS) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Train number</span>
          <input
            type="text"
            value={state.arrivalDetails.trainNumber}
            onChange={(event) =>
              updateArrivalDetails({ trainNumber: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.trainNumber} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Departure station</span>
          <input
            type="text"
            value={state.arrivalDetails.departureStation}
            onChange={(event) =>
              updateArrivalDetails({ departureStation: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.departureStation} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Arrival time</span>
          <input
            type="time"
            value={state.arrivalDetails.arrivalTime}
            onChange={(event) => updateArrivalDetails({ arrivalTime: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.arrivalTime} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Luggage quantity</span>
          <input
            type="number"
            min="0"
            value={state.arrivalDetails.luggageQuantity}
            onChange={(event) =>
              updateArrivalDetails({ luggageQuantity: event.target.value })
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          />
          <FieldError error={errors.luggageQuantity} />
        </label>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Meeting location</span>
        <input
          type="text"
          value={state.arrivalDetails.meetingLocation}
          onChange={(event) =>
            updateArrivalDetails({ meetingLocation: event.target.value })
          }
          className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
        />
        <FieldError error={errors.meetingLocation} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-ink">Expected arrival time</span>
        <input
          type="time"
          value={state.arrivalDetails.arrivalTime}
          onChange={(event) => updateArrivalDetails({ arrivalTime: event.target.value })}
          className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
        />
        <FieldError error={errors.arrivalTime} />
      </label>
    </div>
  );
}

function TierCard({
  tierId,
  state,
  tierState,
  selectedTierId,
  recommendedTierId,
  preferredTierId,
  onChoose,
}) {
  const tier = TIERS[tierId];
  const isEligible = tierState?.isEligible;
  const isRecommended = recommendedTierId === tierId;
  const isPreferred = preferredTierId === tierId;
  const isSelected = selectedTierId === tierId;

  return (
    <article
      className={`rounded-[1.5rem] border p-5 transition ${
        isSelected
          ? "border-brand bg-brand/8"
          : isRecommended
            ? "border-accent/40 bg-accent/10"
            : "border-line bg-surface"
      } ${!isEligible ? "opacity-75" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-semibold text-ink">{tier.name}</h3>
        {isRecommended ? (
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-deep">
            Recommended
          </span>
        ) : null}
        {isPreferred ? (
          <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink">
            Your preference
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-7 text-muted">{tier.positioning}</p>
      <div className="mt-5 grid gap-3 rounded-[1.25rem] border border-line/70 bg-white/65 p-4 text-sm text-muted sm:grid-cols-2">
        <p>Group size: {tier.minPax}-{tier.maxPax} travellers</p>
        <p>Trip duration: up to {tier.maxDays} days</p>
        <p>
          Locations:{" "}
          {tier.minLocations === tier.maxLocations
            ? `exactly ${tier.minLocations}`
            : `${tier.minLocations}-${tier.maxLocations}`}
        </p>
        <p>
          Guide support: {tier.guidesRequired}{" "}
          {tier.guidesRequired === 1 ? "guide" : "guides"}
          {tier.multilingualRequired ? " with multilingual support" : ""}
        </p>
      </div>

      {isEligible ? (
        <>
          {tierState?.reasons?.length ? (
            <div className="mt-5 rounded-[1.25rem] border border-accent/20 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-ink">Why it fits</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {tierState.reasons.map((reason) => (
                <p key={reason} className="text-sm text-muted">
                  {reason}
                </p>
              ))}
              </div>
            </div>
          ) : null}
          <Button
            onClick={() => onChoose(tierId)}
            variant={isSelected ? "primary" : "secondary"}
            className="mt-5 w-full"
          >
            {isSelected ? `Selected ${tier.name}` : `Choose ${tier.name}`}
          </Button>
        </>
      ) : (
        <div className="mt-5 rounded-[1.25rem] border border-brand/20 bg-brand/5 p-4">
          <p className="text-sm font-semibold text-ink">Unavailable for this trip</p>
          <div className="mt-3 space-y-2">
            {tierState?.reasons?.map((reason) => (
              <p key={reason} className="text-sm leading-7 text-muted">
                {reason}
              </p>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function TripBuilderPageContent({ searchParams }) {
  const router = useRouter();
  const {
    state,
    isHydrated,
    updateBasics,
    updateTierSelection,
    setChildrenCount,
    setChildAge,
    toggleDestination,
    setHotelId,
    setArrivalOption,
    updateArrivalDetails,
  } = useTripBuilder();
  const [errors, setErrors] = useState({});
  const [activeCategory, setActiveCategory] = useState("ALL");
  const currentStep = getCurrentStep(searchParams);
  const preferredTierParam = getPreferredTierParam(searchParams);
  const selectedDestinations = state.selectedDestinationIds
    .map((id) => destinationsById[id])
    .filter(Boolean);
  const planningSummary = useMemo(() => buildTierPlanningSummary(state), [state]);
  const activeTierId = getActiveTierId(state);
  const hotelSelectionRequired = isHotelSelectionRequired(activeTierId);
  const eligibleHotels = useMemo(() => getEligibleHotelsForTier(activeTierId), [activeTierId]);
  const supportedArrivalOptions = useMemo(
    () => getSupportedArrivalOptionsForTier(activeTierId),
    [activeTierId],
  );
  const itinerary = useMemo(
    () => buildItinerary(state.selectedDestinationIds, state.arrivalDate, state.departureDate),
    [state.arrivalDate, state.departureDate, state.selectedDestinationIds],
  );
  const recommendedHotel = useMemo(() => {
    if (!hotelSelectionRequired) {
      return null;
    }

    const suggestedHotel = recommendHotel(state);
    if (suggestedHotel && eligibleHotels.some((hotel) => hotel.id === suggestedHotel.id)) {
      return suggestedHotel;
    }

    return eligibleHotels[0] || null;
  }, [eligibleHotels, hotelSelectionRequired, state]);
  const pricing = useMemo(() => buildSamplePrice(state), [state]);
  const nights = getTripNights(state.arrivalDate, state.departureDate);
  const travellerCount = getTravellerCount(state);
  const includedServices = getTierIncludedServices(activeTierId);
  const chargeableItems = getTierChargeableItems(activeTierId);
  const eligibleTierStates = planningSummary.eligibility.map((item) => ({
    ...item,
    reasons:
      item.tierId === planningSummary.recommendation.recommendedTierId
        ? planningSummary.recommendation.customerFacingReasons
        : item.reasons,
  }));
  const tierSelection =
    state.selectedTierId && planningSummary.recommendation.eligibleTierIds.includes(state.selectedTierId)
      ? state.selectedTierId
      : getTierConfirmationSelection(state, planningSummary.recommendation);
  const recommendationIsFeasible =
    !planningSummary.manualEnquiry.isManualEnquiryRequired &&
    planningSummary.closedDestinationWarnings.length === 0 &&
    planningSummary.locationCount >= 2 &&
    planningSummary.locationCount <= 8 &&
    planningSummary.itinerary.fitsSchedule;

  useEffect(() => {
    if (!preferredTierParam || state.preferredTierId === preferredTierParam) {
      return;
    }

    updateTierSelection({
      preferredTierId: preferredTierParam,
    });
  }, [preferredTierParam, state.preferredTierId, updateTierSelection]);

  useEffect(() => {
    const nextRecommendedTierId = planningSummary.recommendation.recommendedTierId;
    const nextEligibleTierIds = planningSummary.recommendation.eligibleTierIds;
    const nextTierIneligibilityReasons = planningSummary.recommendation.ineligibleTiers.reduce(
      (result, item) => {
        result[item.tierId] = item.reasons;
        return result;
      },
      {},
    );

    const shouldResetSelectedTier =
      state.selectedTierId && !nextEligibleTierIds.includes(state.selectedTierId);

    if (
      state.recommendedTierId === nextRecommendedTierId &&
      state.tierMatchScore === planningSummary.recommendation.matchScore &&
      JSON.stringify(state.tierRecommendationReasons) ===
        JSON.stringify(planningSummary.recommendation.customerFacingReasons) &&
      JSON.stringify(state.eligibleTierIds) === JSON.stringify(nextEligibleTierIds) &&
      JSON.stringify(state.tierIneligibilityReasons) ===
        JSON.stringify(nextTierIneligibilityReasons) &&
      !shouldResetSelectedTier
    ) {
      return;
    }

    updateTierSelection({
      recommendedTierId: nextRecommendedTierId,
      tierMatchScore: planningSummary.recommendation.matchScore,
      tierRecommendationReasons: planningSummary.recommendation.customerFacingReasons,
      eligibleTierIds: nextEligibleTierIds,
      tierIneligibilityReasons: nextTierIneligibilityReasons,
      selectedTierId: shouldResetSelectedTier ? null : state.selectedTierId,
    });
  }, [
    planningSummary.recommendation,
    state.eligibleTierIds,
    state.recommendedTierId,
    state.selectedTierId,
    state.tierIneligibilityReasons,
    state.tierMatchScore,
    state.tierRecommendationReasons,
    updateTierSelection,
  ]);

  useEffect(() => {
    if (!hotelSelectionRequired) {
      if (state.hotelId) {
        setHotelId("");
      }
      return;
    }

    if (state.hotelId && eligibleHotels.some((hotel) => hotel.id === state.hotelId)) {
      return;
    }

    if (eligibleHotels.length === 1) {
      setHotelId(eligibleHotels[0].id);
      return;
    }

    if (state.hotelId) {
      setHotelId("");
    }
  }, [eligibleHotels, hotelSelectionRequired, setHotelId, state.hotelId]);

  useEffect(() => {
    if (supportedArrivalOptions.includes(state.arrivalOption)) {
      return;
    }

    if (supportedArrivalOptions.length === 1) {
      setArrivalOption(supportedArrivalOptions[0]);
      return;
    }

    if (state.arrivalOption && supportedArrivalOptions.length) {
      setArrivalOption(supportedArrivalOptions[0]);
    }
  }, [setArrivalOption, state.arrivalOption, supportedArrivalOptions]);

  function goToStep(step) {
    router.push(`/trip-builder?step=${step}`);
  }

  function continueFromBasics() {
    const nextErrors = validateBasics(state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      goToStep("attractions");
    }
  }

  function handleToggleDestination(destinationId) {
    const isSelected = state.selectedDestinationIds.includes(destinationId);

    if (!isSelected && state.selectedDestinationIds.length >= 8) {
      setErrors({
        selectedDestinationIds:
          "Automated booking supports up to 8 selected locations. Please remove one before adding another.",
      });
      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      selectedDestinationIds: undefined,
    }));
    toggleDestination(destinationId);
  }

  function continueFromAttractions() {
    const nextErrors = validateAttractions(state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      goToStep("recommendation");
    }
  }

  function chooseTier(tierId) {
    if (!planningSummary.recommendation.eligibleTierIds.includes(tierId)) {
      return;
    }

    updateTierSelection({
      selectedTierId: tierId,
    });
    setErrors((currentErrors) => ({
      ...currentErrors,
      selectedTierId: undefined,
    }));
  }

  function continueFromRecommendation() {
    const nextErrors = {};

    if (planningSummary.manualEnquiry.isManualEnquiryRequired) {
      nextErrors.recommendation = planningSummary.manualEnquiry.message;
    } else if (planningSummary.closedDestinationWarnings.length > 0) {
      nextErrors.recommendation =
        "Please review your selected locations because one or more stops appear closed on your current trip dates.";
    } else if (!planningSummary.itinerary.fitsSchedule) {
      nextErrors.recommendation =
        "Please remove a location or extend the trip before continuing.";
    } else if (!planningSummary.recommendation.eligibleTierIds.length) {
      nextErrors.recommendation =
        "No automated tier is eligible for the current trip details. Please adjust the trip or request a manual review.";
    } else if (!tierSelection) {
      nextErrors.selectedTierId = "Please choose an eligible tier to continue.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      updateTierSelection({
        selectedTierId: tierSelection,
      });
      goToStep("hotel");
    }
  }

  function continueFromHotel() {
    const nextErrors = validateHotel(state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      goToStep("arrival");
    }
  }

  function continueFromArrival() {
    const nextErrors = validateArrival(state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      goToStep("review");
    }
  }

  const copy = STEP_COPY[currentStep];

  return (
    <TripBuilderPageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      <ProgressIndicator currentStep={currentStep} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="soft-card rounded-[2rem] p-6 md:p-8">
          {!isHydrated ? (
            <p className="text-sm text-muted">Loading your builder selections...</p>
          ) : null}

          {currentStep === "basics" ? (
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">Arrival date</span>
                  <input
                    type="date"
                    value={state.arrivalDate}
                    onChange={(event) => updateBasics({ arrivalDate: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  />
                  <FieldError error={errors.arrivalDate} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-ink">Departure date</span>
                  <input
                    type="date"
                    value={state.departureDate}
                    onChange={(event) => updateBasics({ departureDate: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  />
                  <FieldError error={errors.departureDate} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-ink">Adults</span>
                  <input
                    type="number"
                    min="0"
                    max={getMaxGroupSize()}
                    value={state.adults}
                    onChange={(event) => updateBasics({ adults: Number(event.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-ink">Children</span>
                  <input
                    type="number"
                    min="0"
                    max={getMaxGroupSize()}
                    value={state.children}
                    onChange={(event) => setChildrenCount(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  />
                </label>
              </div>

              <FieldError error={errors.travellers} />

              {state.children > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-ink">Children ages</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {state.childrenAges.map((age, index) => (
                      <label key={`child-age-${index}`} className="block">
                        <span className="text-sm text-muted">Child {index + 1}</span>
                        <input
                          type="number"
                          min="0"
                          max="17"
                          value={age}
                          onChange={(event) => setChildAge(index, event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                        />
                      </label>
                    ))}
                  </div>
                  <FieldError error={errors.childrenAges} />
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">Nationality</span>
                  <input
                    type="text"
                    value={state.nationality}
                    onChange={(event) => updateBasics({ nationality: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                    placeholder="Example: United Kingdom"
                  />
                  <FieldError error={errors.nationality} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-ink">Preferred language</span>
                  <select
                    value={state.preferredLanguage}
                    onChange={(event) => updateBasics({ preferredLanguage: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  >
                    {["English", "Malay", "Mandarin", "Arabic", "Tamil"].map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.preferredLanguage} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-ink">General arrival point</span>
                  <select
                    value={state.generalArrivalPoint}
                    onChange={(event) =>
                      updateBasics({ generalArrivalPoint: event.target.value })
                    }
                    className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  >
                    {ARRIVAL_POINT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.generalArrivalPoint} />
                </label>
              </div>

              {errors.manualEnquiry ? (
                <InfoPanel
                  title="Manual review needed"
                  description={errors.manualEnquiry}
                  variant="warning"
                />
              ) : null}

              <InfoPanel
                title="What happens next"
                description="You will choose your locations first. Hotel class and premium transport details are handled later only if the selected tier requires them."
                variant="accent"
              />

              <div className="flex justify-end">
                <Button onClick={continueFromBasics}>Continue to Locations</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "attractions" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoPanel
                  title={`${planningSummary.locationCount} selected`}
                  description={`Minimum required: 2. Maximum supported: 8.`}
                />
                <InfoPanel
                  title={`${planningSummary.tripDays} trip days`}
                  description="Available touring days based on your arrival and departure dates."
                />
                <InfoPanel
                  title={`${planningSummary.itinerary.totalAttractionMinutes} attraction minutes`}
                  description="Estimated visit duration before travel buffers and meal timing."
                />
                <InfoPanel
                  title={`MYR ${planningSummary.estimatedAttractionFees}`}
                  description="Estimated attraction fees based on the current group size."
                />
              </div>

              <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-5">
                <p className="text-sm font-semibold text-ink">Location rules for this trip</p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {getLocationRulesText(travellerCount)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory("ALL")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    activeCategory === "ALL"
                      ? "bg-brand text-white"
                      : "border border-line bg-surface text-ink"
                  }`}
                >
                  All categories
                </button>
                {Object.entries(DESTINATION_CATEGORIES).map(([categoryId, category]) => (
                  <button
                    key={categoryId}
                    type="button"
                    onClick={() => setActiveCategory(categoryId)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      activeCategory === categoryId
                        ? "bg-brand text-white"
                        : "border border-line bg-surface text-ink"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <FieldError error={errors.selectedDestinationIds} />

              <div className="grid gap-4">
                {getAttractionList(activeCategory).map((destination) => {
                  const isSelected = state.selectedDestinationIds.includes(destination.id);

                  return (
                    <article
                      key={destination.id}
                      className="rounded-[1.5rem] border border-line bg-surface p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-deep">
                              {DESTINATION_CATEGORIES[destination.category].label}
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-ink">
                              {destination.name}
                            </h3>
                          </div>
                          <p className="text-sm leading-7 text-muted">
                            {destination.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted">
                            <span className="rounded-full border border-line px-3 py-1">
                              {destination.estimatedMinutes} min
                            </span>
                            <span className="rounded-full border border-line px-3 py-1">
                              Entrance fee: MYR {destination.entranceFeeMYR}
                            </span>
                            <span className="rounded-full border border-line px-3 py-1">
                              Opens: {destination.openingTime || "Flexible"}
                            </span>
                            <span className="rounded-full border border-line px-3 py-1">
                              Accessibility: {destination.accessibilityTags.join(", ")}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleDestination(destination.id)}
                          className={`rounded-full px-5 py-3 text-sm font-semibold ${
                            isSelected
                              ? "bg-accent text-white"
                              : "border border-line bg-white text-ink"
                          }`}
                        >
                          {isSelected ? "Remove" : "Add to My Trip"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button href="/trip-builder?step=basics" variant="secondary">
                  Back to Basics
                </Button>
                <Button onClick={continueFromAttractions}>
                  Continue to Feasibility Check
                </Button>
              </div>
            </div>
          ) : null}

          {currentStep === "recommendation" ? (
            <div className="space-y-6">
              {planningSummary.manualEnquiry.isManualEnquiryRequired ? (
                <InfoPanel
                  title={planningSummary.manualEnquiry.title}
                  description={planningSummary.manualEnquiry.message}
                  variant="warning"
                />
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <InfoPanel
                  title={
                    planningSummary.itinerary.fitsSchedule
                      ? "Selection looks practical"
                      : "Selection needs adjustment"
                  }
                  description={
                    planningSummary.itinerary.fitsSchedule
                      ? `Your current selection with buffers fits within ${planningSummary.itinerary.totalAvailableMinutes} available touring minutes.`
                      : planningSummary.itinerary.warning
                  }
                  variant={planningSummary.itinerary.fitsSchedule ? "accent" : "warning"}
                />
                <InfoPanel
                  title="Trip summary"
                  description={`${planningSummary.travellerCount} travellers • ${planningSummary.tripDays} days • ${planningSummary.locationCount} selected locations`}
                />
              </div>

              {planningSummary.closedDestinationWarnings.length ? (
                <div className="rounded-[1.5rem] border border-brand/30 bg-brand/5 p-5">
                  <p className="text-sm font-semibold text-ink">Opening-day warning</p>
                  <div className="mt-3 space-y-2">
                    {planningSummary.closedDestinationWarnings.map((warning) => (
                      <p key={warning.destinationId} className="text-sm leading-7 text-muted">
                        {warning.reason}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {planningSummary.itinerary.unassignedDestinations.length ? (
                <div className="rounded-[1.5rem] border border-brand/30 bg-brand/5 p-5">
                  <p className="text-sm font-semibold text-ink">
                    Locations that currently do not fit
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {planningSummary.itinerary.unassignedDestinations
                      .map((destination) => destination.name)
                      .join(", ")}
                  </p>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-5">
                <p className="text-sm font-semibold text-ink">
                  Recommended tier:{" "}
                  {planningSummary.recommendation.recommendedTier?.name || "Manual review needed"}
                </p>
                {planningSummary.recommendation.customerFacingReasons.length ? (
                  <div className="mt-3 space-y-2">
                    {planningSummary.recommendation.customerFacingReasons.map((reason) => (
                      <p key={reason} className="text-sm leading-7 text-muted">
                        {reason}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-7 text-muted">
                    We need more suitable trip details before recommending an automated tier.
                  </p>
                )}
                {state.preferredTierId ? (
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Preferred tier from the landing page:{" "}
                    <span className="font-semibold text-ink">
                      {TIERS[state.preferredTierId]?.name || state.preferredTierId}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5">
                {eligibleTierStates.map((tierState) => (
                  <TierCard
                    key={tierState.tierId}
                    tierId={tierState.tierId}
                    state={state}
                    tierState={tierState}
                    selectedTierId={tierSelection}
                    recommendedTierId={planningSummary.recommendation.recommendedTierId}
                    preferredTierId={state.preferredTierId}
                    onChoose={chooseTier}
                  />
                ))}
              </div>

              <FieldError error={errors.recommendation} />
              <FieldError error={errors.selectedTierId} />

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button href="/trip-builder?step=attractions" variant="secondary">
                    Change Locations
                  </Button>
                  <Button href="/trip-builder?step=basics" variant="secondary">
                    Change Trip Details
                  </Button>
                </div>
                <Button
                  onClick={continueFromRecommendation}
                  disabled={!recommendationIsFeasible && !planningSummary.manualEnquiry.isManualEnquiryRequired}
                >
                  {tierSelection
                    ? `Continue with ${TIERS[tierSelection]?.name || "Selected Tier"}`
                    : "Choose a Tier to Continue"}
                </Button>
              </div>
            </div>
          ) : null}

          {currentStep === "hotel" ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-5">
                <p className="text-sm font-semibold text-ink">Current recommendation context</p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  You are continuing with{" "}
                  <span className="font-semibold text-ink">
                    {TIERS[state.selectedTierId]?.name || TIERS[state.recommendedTierId]?.name || "the current trip"}
                  </span>
                  . Hotel options now follow the selected tier rules.
                </p>
              </div>

              {!hotelSelectionRequired ? (
                <InfoPanel
                  title="No hotel selection needed"
                  description="Explore does not include a hotel recommendation in this flow. You can continue directly to the arrival step."
                  variant="accent"
                />
              ) : (
                <>
                  <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-5">
                    <p className="text-sm font-semibold text-ink">System recommendation</p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      Based on your group size, selected areas, and trip length, we recommend{" "}
                      <span className="font-semibold text-ink">
                        {recommendedHotel?.name || "the current eligible stay"}
                      </span>
                      .
                    </p>
                  </div>

                  <FieldError error={errors.hotelId} />

                  <div className="grid gap-4">
                    {eligibleHotels.map((hotel) => {
                      const isSelected = state.hotelId === hotel.id;
                      const isRecommended = recommendedHotel?.id === hotel.id;

                      return (
                        <button
                          key={hotel.id}
                          type="button"
                          onClick={() => setHotelId(hotel.id)}
                          className={`rounded-[1.5rem] border p-5 text-left transition ${
                            isSelected
                              ? "border-brand bg-brand/5"
                              : "border-line bg-surface"
                          }`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-semibold text-ink">{hotel.name}</h3>
                                <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink">
                                  {hotel.starRating}-star
                                </span>
                                {isRecommended ? (
                                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                                    Recommended
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-sm text-muted">{hotel.zone}</p>
                              <p className="mt-3 text-sm leading-7 text-muted">
                                {hotel.description}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {hotel.facilities.map((facility) => (
                                  <span
                                    key={facility}
                                    className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                                  >
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm uppercase tracking-[0.18em] text-muted">
                                Starting from
                              </p>
                              <p className="mt-1 text-2xl font-semibold text-ink">
                                MYR {hotel.pricePerNightMYR}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button href="/trip-builder?step=recommendation" variant="secondary">
                  Back to Tier Recommendation
                </Button>
                <Button onClick={continueFromHotel}>Continue to Arrival</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "arrival" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {supportedArrivalOptions.map((optionValue) => (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => setArrivalOption(optionValue)}
                    className={`rounded-[1.5rem] border p-5 text-left ${
                      state.arrivalOption === optionValue
                        ? "border-brand bg-brand/5"
                        : "border-line bg-surface"
                    }`}
                  >
                    <p className="text-lg font-semibold text-ink">
                      {getArrivalOptionLabelForTier(optionValue, activeTierId)}
                    </p>
                  </button>
                ))}
              </div>

              <InfoPanel
                title="Pickup rule for this tier"
                description={
                  activeTierId === TIER_IDS.EXPLORE
                    ? "Explore currently supports pickup only from Ipoh ETS."
                    : activeTierId === TIER_IDS.SIGNATURE
                      ? "Signature uses KLIA pickup into Ipoh as the premium included arrival flow."
                      : "Smart Comfort supports KLIA pickup or Ipoh ETS pickup."
                }
                variant="accent"
              />

              <FieldError error={errors.arrivalOption} />

              <ArrivalFields
                state={state}
                errors={errors}
                updateArrivalDetails={updateArrivalDetails}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button href="/trip-builder?step=hotel" variant="secondary">
                  Back to Hotel
                </Button>
                <Button onClick={continueFromArrival}>Continue to Review</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "review" ? (
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-line bg-surface p-5">
                <h2 className="text-xl font-semibold text-ink">Selected tier</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <p className="text-sm leading-7 text-muted">
                    Recommended tier:{" "}
                    {TIERS[state.recommendedTierId]?.name || "Not available"}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Selected tier: {TIERS[state.selectedTierId]?.name || "Not confirmed yet"}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Preferred tier: {TIERS[state.preferredTierId]?.name || "Not specified"}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Match score: {state.tierMatchScore || 0}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line bg-surface p-5">
                <h2 className="text-xl font-semibold text-ink">Dates and travellers</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <p className="text-sm leading-7 text-muted">
                    Dates: {state.arrivalDate || "TBD"} to {state.departureDate || "TBD"}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Travellers: {state.adults} adults
                    {state.children ? ` and ${state.children} children` : ""}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Nationality: {state.nationality || "TBD"}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Preferred language: {state.preferredLanguage}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line bg-surface p-5">
                <h2 className="text-xl font-semibold text-ink">Recommended itinerary</h2>
                <ItineraryDayList itineraryDays={itinerary.itineraryDays} />
              </div>

              <div className="rounded-[1.5rem] border border-line bg-surface p-5">
                <h2 className="text-xl font-semibold text-ink">Hotel and arrival</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <p className="text-sm leading-7 text-muted">
                    Hotel: {hotelSelectionRequired
                      ? `${hotelsById[state.hotelId]?.name || "Not chosen yet"}${nights ? ` • ${nights} nights` : ""}`
                      : "Not included for Explore"}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    Arrival: {getArrivalOptionLabelForTier(state.arrivalOption, activeTierId)}
                  </p>
                  <p className="text-sm leading-7 text-muted md:col-span-2">
                    Guide service: {getGuidesRequiredForTier(activeTierId)}{" "}
                    {getGuidesRequiredForTier(activeTierId) === 1 ? "guide" : "guides"}
                    {activeTierId === TIER_IDS.SIGNATURE ? " with premium transport support." : " included as part of the guided trip."}
                  </p>
                  <p className="text-sm leading-7 text-muted md:col-span-2">
                    Included services: {includedServices.join(" • ")}
                  </p>
                  <p className="text-sm leading-7 text-muted md:col-span-2">
                    Chargeable items: {chargeableItems.join(" • ")}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line bg-surface p-5">
                <h2 className="text-xl font-semibold text-ink">Your trip estimate</h2>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Your estimate combines the selected trip services, accommodation where included,
                  attraction fees, arrival transfer, and applicable taxes.
                </p>
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
                  <span className="text-sm font-semibold text-ink">Estimated trip total</span>
                  <span className="text-2xl font-semibold text-ink">MYR {pricing.total}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Shared daily services are spread across your group. The final amount is confirmed
                  after your booking details are reviewed.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button href="/trip-builder?step=arrival" variant="secondary">
                  Back to Arrival
                </Button>
                <Button href="/checkout">Continue to Traveller Details</Button>
              </div>
            </div>
          ) : null}
        </section>

        <TripBuilderSidebar state={state} />
      </div>
    </TripBuilderPageShell>
  );
}

export default function TripBuilderPage({ searchParams }) {
  const resolvedSearchParams = use(searchParams);

  return (
    <TripBuilderProvider>
      <TripBuilderPageContent searchParams={resolvedSearchParams} />
    </TripBuilderProvider>
  );
}
