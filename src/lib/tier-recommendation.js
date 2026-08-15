import { TIERS, TIER_IDS } from "@/data/tiers";
import { getArrivalContext } from "@/lib/tier-booking";
import { diffLocalCalendarDays } from "@/lib/date";
import { getTierEligibility } from "@/lib/tier-eligibility";
import { PICKUP_OPTIONS } from "@/types";

function getTravellerCount(input) {
  return (Number(input.adults) || 0) + (Number(input.children) || 0);
}

function getLocationCount(input) {
  return Array.isArray(input.selectedDestinationIds) ? input.selectedDestinationIds.length : 0;
}

function getTripDays(input) {
  return Math.max(0, diffLocalCalendarDays(input.arrivalDate, input.departureDate));
}

function normalizeText(value) {
  return `${value || ""}`.trim().toLowerCase();
}

function isOverseasTraveller(input) {
  const nationality = normalizeText(input.nationality);

  if (!nationality) {
    return false;
  }

  return !["malaysia", "malaysian"].includes(nationality);
}

function scoreExplore(input) {
  let score = 0;
  const reasons = [];
  const travellerCount = getTravellerCount(input);
  const tripDays = getTripDays(input);
  const locationCount = getLocationCount(input);
  const arrivalContext = getArrivalContext(input);

  if (travellerCount >= 2 && travellerCount <= 3) {
    score += 2;
    reasons.push("Fits a small private group.");
  }

  if (tripDays > 0 && tripDays <= 2) {
    score += 2;
    reasons.push("Matches a shorter 1-2 day trip.");
  }

  if (locationCount === 2) {
    score += 2;
    reasons.push("Works well with exactly 2 selected locations.");
  }

  if (arrivalContext === PICKUP_OPTIONS.ETS) {
    score += 1;
    reasons.push("Matches an Ipoh ETS arrival plan.");
  }

  return { score, reasons };
}

function scoreSmartComfort(input) {
  let score = 0;
  const reasons = [];
  const tripDays = getTripDays(input);
  const locationCount = getLocationCount(input);
  const arrivalContext = getArrivalContext(input);
  const preferredTierId = input.preferredTierId;

  if (tripDays > 2) {
    score += 3;
    reasons.push(`Supports your ${tripDays}-day trip.`);
  }

  if (locationCount > 2) {
    score += 3;
    reasons.push(`Supports all ${locationCount} selected locations.`);
  }

  if (arrivalContext === PICKUP_OPTIONS.KLIA) {
    score += 2;
    reasons.push("KLIA pickup can be added.");
  }

  if (arrivalContext === PICKUP_OPTIONS.ETS) {
    score += 1;
    reasons.push("Ipoh ETS pickup can be added.");
  }

  if (normalizeText(input.preferredLanguage) && normalizeText(input.preferredLanguage) !== "english") {
    score += 1;
    reasons.push("Multilingual guide support is available.");
  }

  if (isOverseasTraveller(input)) {
    score += 1;
    reasons.push("Well suited to overseas travellers who want smoother logistics.");
  }

  if (preferredTierId === TIER_IDS.SMART_COMFORT) {
    score += 1;
    reasons.push("Matches your preferred tier from the landing page.");
  }

  if (arrivalContext !== PICKUP_OPTIONS.KLIA || getTravellerCount(input) <= 5) {
    score += 1;
    reasons.push("Keeps the trip flexible without premium-only features.");
  }

  return { score, reasons };
}

function scoreSignature(input) {
  let score = 0;
  const reasons = [];
  const travellerCount = getTravellerCount(input);
  const locationCount = getLocationCount(input);
  const arrivalContext = getArrivalContext(input);

  if (travellerCount >= 4) {
    score += 2;
    reasons.push("Fits a larger private group.");
  }

  if (locationCount >= 5) {
    score += 1;
    reasons.push("Works well for a fuller premium group itinerary.");
  }

  if (travellerCount >= 6) {
    score += 2;
    reasons.push("A larger group can make better use of premium transport support.");
  }

  if (input.preferredTierId === TIER_IDS.SIGNATURE) {
    score += 3;
    reasons.push("Matches your preferred tier from the landing page.");
  }

  if (arrivalContext === PICKUP_OPTIONS.KLIA) {
    score += 1;
    reasons.push("Included KLIA pickup can suit your arrival needs.");
  }

  return { score, reasons };
}

function scoreTier(tierId, input) {
  if (tierId === TIER_IDS.EXPLORE) {
    return scoreExplore(input);
  }

  if (tierId === TIER_IDS.SIGNATURE) {
    return scoreSignature(input);
  }

  return scoreSmartComfort(input);
}

function compareTierMatches(left, right) {
  if (right.matchScore !== left.matchScore) {
    return right.matchScore - left.matchScore;
  }

  if (left.tierId === TIER_IDS.SMART_COMFORT) {
    return -1;
  }

  if (right.tierId === TIER_IDS.SMART_COMFORT) {
    return 1;
  }

  return 0;
}

export function getTierRecommendation(input) {
  const eligibility = getTierEligibility(input);
  const eligibleMatches = eligibility
    .filter((item) => item.isEligible)
    .map((item) => {
      const scored = scoreTier(item.tierId, input);

      return {
        tierId: item.tierId,
        tier: TIERS[item.tierId],
        matchScore: scored.score,
        reasons: scored.reasons,
      };
    })
    .sort(compareTierMatches);

  const recommended = eligibleMatches[0] || null;

  return {
    recommendedTierId: recommended?.tierId || null,
    recommendedTier: recommended?.tier || null,
    matchScore: recommended?.matchScore || 0,
    customerFacingReasons: recommended?.reasons || [],
    eligibleTierIds: eligibleMatches.map((item) => item.tierId),
    eligibleTiers: eligibleMatches,
    ineligibleTiers: eligibility
      .filter((item) => !item.isEligible)
      .map((item) => ({
        tierId: item.tierId,
        tier: item.tier,
        reasons: item.reasons,
      })),
  };
}
