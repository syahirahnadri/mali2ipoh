"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PICKUP_OPTIONS } from "@/types";

const STORAGE_KEY = "mali2ipoh-trip-builder";

const defaultState = {
  arrivalDate: "",
  departureDate: "",
  adults: 2,
  children: 0,
  childrenAges: [],
  nationality: "",
  preferredLanguage: "English",
  generalArrivalPoint: "KLIA",
  accommodationPreference: "3-4-star hotel",
  partyBusPreference: "Not required",
  selectedDestinationIds: [],
  preferredTierId: null,
  recommendedTierId: null,
  selectedTierId: null,
  tierMatchScore: 0,
  tierRecommendationReasons: [],
  eligibleTierIds: [],
  tierIneligibilityReasons: {},
  hotelId: "",
  arrivalOption: PICKUP_OPTIONS.KLIA,
  travellerDetails: {
    fullName: "",
    nationality: "",
    email: "",
    whatsapp: "",
    emergencyContact: "",
    dietaryRequirements: "",
    accessibilityRequirements: "",
    specialRequests: "",
  },
  arrivalDetails: {
    terminal: "",
    airline: "",
    flightNumber: "",
    arrivalTime: "",
    luggageQuantity: "",
    oversizedLuggage: false,
    trainNumber: "",
    departureStation: "",
    meetingLocation: "",
  },
};

const TripBuilderContext = createContext(null);

function normalizeState(value) {
  return {
    ...defaultState,
    ...value,
    arrivalDetails: {
      ...defaultState.arrivalDetails,
      ...(value?.arrivalDetails || {}),
    },
    travellerDetails: {
      ...defaultState.travellerDetails,
      ...(value?.travellerDetails || {}),
    },
    childrenAges: Array.isArray(value?.childrenAges) ? value.childrenAges : [],
    selectedDestinationIds: Array.isArray(value?.selectedDestinationIds)
      ? value.selectedDestinationIds
      : [],
    tierRecommendationReasons: Array.isArray(value?.tierRecommendationReasons)
      ? value.tierRecommendationReasons
      : [],
    eligibleTierIds: Array.isArray(value?.eligibleTierIds) ? value.eligibleTierIds : [],
    tierIneligibilityReasons:
      value?.tierIneligibilityReasons && typeof value.tierIneligibilityReasons === "object"
        ? value.tierIneligibilityReasons
        : {},
  };
}

export function TripBuilderProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (storedValue) {
        setState(normalizeState(JSON.parse(storedValue)));
      }

      setIsHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      updateBasics(partialState) {
        setState((currentState) => normalizeState({ ...currentState, ...partialState }));
      },
      updateTierSelection(partialState) {
        setState((currentState) => normalizeState({ ...currentState, ...partialState }));
      },
      setChildrenCount(count) {
        setState((currentState) => {
          const nextCount = Number(count) || 0;
          const nextAges = Array.from({ length: nextCount }, (_, index) => {
            return currentState.childrenAges[index] || "";
          });

          return normalizeState({
            ...currentState,
            children: nextCount,
            childrenAges: nextAges,
          });
        });
      },
      setChildAge(index, value) {
        setState((currentState) => {
          const nextAges = [...currentState.childrenAges];
          nextAges[index] = value;

          return normalizeState({
            ...currentState,
            childrenAges: nextAges,
          });
        });
      },
      toggleDestination(destinationId) {
        setState((currentState) => {
          const selectedDestinationIds = currentState.selectedDestinationIds.includes(destinationId)
            ? currentState.selectedDestinationIds.filter((id) => id !== destinationId)
            : [...currentState.selectedDestinationIds, destinationId];

          return normalizeState({
            ...currentState,
            selectedDestinationIds,
          });
        });
      },
      setHotelId(hotelId) {
        setState((currentState) => normalizeState({ ...currentState, hotelId }));
      },
      setArrivalOption(arrivalOption) {
        setState((currentState) =>
          normalizeState({
            ...currentState,
            arrivalOption,
          }),
        );
      },
      updateArrivalDetails(partialState) {
        setState((currentState) =>
          normalizeState({
            ...currentState,
            arrivalDetails: {
              ...currentState.arrivalDetails,
              ...partialState,
            },
          }),
        );
      },
      updateTravellerDetails(partialState) {
        setState((currentState) =>
          normalizeState({
            ...currentState,
            travellerDetails: {
              ...currentState.travellerDetails,
              ...partialState,
            },
          }),
        );
      },
      resetBuilder() {
        setState(defaultState);
      },
    }),
    [isHydrated, state],
  );

  return (
    <TripBuilderContext.Provider value={value}>
      {children}
    </TripBuilderContext.Provider>
  );
}

export function useTripBuilder() {
  const context = useContext(TripBuilderContext);

  if (!context) {
    throw new Error("useTripBuilder must be used inside TripBuilderProvider.");
  }

  return context;
}
