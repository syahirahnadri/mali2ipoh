export const CATEGORY_IDS = {
  FAMOUS_LANDMARKS: "FAMOUS_LANDMARKS",
  LOCAL_FOOD: "LOCAL_FOOD",
  HERITAGE_CULTURE: "HERITAGE_CULTURE",
  NATURE: "NATURE",
};

export const PICKUP_OPTIONS = {
  KLIA: "KLIA",
  ETS: "ETS",
  SELF_ARRIVAL: "SELF_ARRIVAL",
};

export const BOOKING_STATUSES = {
  DRAFT: "DRAFT",
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  CONFIRMED: "CONFIRMED",
  GUIDE_ASSIGNED: "GUIDE_ASSIGNED",
  READY: "READY",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  INFORMATION_REQUIRED: "INFORMATION_REQUIRED",
  CHANGE_REQUESTED: "CHANGE_REQUESTED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  NO_SHOW: "NO_SHOW",
};

/**
 * @typedef {keyof typeof CATEGORY_IDS} DestinationCategoryKey
 * @typedef {typeof CATEGORY_IDS[DestinationCategoryKey]} DestinationCategory
 * @typedef {keyof typeof PICKUP_OPTIONS} PickupOptionKey
 * @typedef {typeof PICKUP_OPTIONS[PickupOptionKey]} ArrivalOption
 * @typedef {keyof typeof BOOKING_STATUSES} BookingStatusKey
 * @typedef {typeof BOOKING_STATUSES[BookingStatusKey]} BookingStatus
 *
 * @typedef Destination
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {DestinationCategory} category
 * @property {string} description
 * @property {string} image
 * @property {string} zone
 * @property {number} estimatedMinutes
 * @property {string=} openingTime
 * @property {string=} closingTime
 * @property {number[]} availableDays
 * @property {number} entranceFeeMYR
 * @property {string[]} tags
 * @property {string[]} accessibilityTags
 * @property {number} popularityScore
 *
 * @typedef Hotel
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} image
 * @property {string} zone
 * @property {number} starRating
 * @property {number} pricePerNightMYR
 * @property {number} roomCapacity
 * @property {string[]} facilities
 * @property {string[]} eligibleTierIds
 *
 * @typedef Guide
 * @property {string} id
 * @property {string} name
 * @property {string} photo
 * @property {string} email
 * @property {string} phone
 * @property {string[]} languages
 * @property {DestinationCategory[]} expertise
 * @property {boolean} internationalTravellerExperience
 * @property {ArrivalOption[]} pickupCapabilities
 * @property {string} vehicleType
 * @property {number} maxPassengers
 * @property {number} maxPassengersWithLuggage
 * @property {number} rating
 * @property {number} completedTours
 * @property {string[]} unavailableDates
 */
