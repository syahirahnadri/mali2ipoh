# Mali2Ipoh Smart Comfort Booking Flow Update

## Prompt-Ready Implementation Specification for the Existing Next.js POC

Read this document completely before modifying the project.

This is an update to an existing working Mali2Ipoh Next.js application. The current application already contains a landing page, Smart Trip Builder, location selection, itinerary generation, hotel selection, arrival selection, price calculation, traveller-details form, booking confirmation and localStorage booking persistence.

Do not rebuild the project from scratch. Preserve all existing working features and update the current booking journey according to this specification.

---

# 1. Technical Requirements

Use the existing project stack:

- Next.js App Router
- React
- JavaScript
- Tailwind CSS
- Existing localStorage booking persistence
- Existing Mali2Ipoh visual design

File conventions:

- Use `.js` for Next.js pages, configuration, mock data and utility logic.
- Use `.jsx` for reusable React components.
- Do not create `.ts` or `.tsx` files.
- Do not install unnecessary packages.
- Reuse existing components and utilities where practical.
- Preserve the existing responsive behaviour.

Before implementation:

1. Inspect the existing project structure.
2. Identify the current Trip Builder state management.
3. Identify the current booking localStorage key and schema.
4. Identify the existing itinerary, pricing and confirmation logic.
5. Extend the existing implementation instead of creating duplicate systems.

---

# 2. Product Objective

Mali2Ipoh's primary product and USP is the **Smart Comfort customisable package**.

The three tiers do not have equal strategic importance:

- **Explore** is the short, essential alternative.
- **Smart Comfort** is the main product that should suit and attract most overseas travellers.
- **Signature** is the premium alternative for travellers who explicitly want luxury features.

The system should recommend Smart Comfort whenever it is operationally eligible and genuinely matches the customer's requirements.

The recommendation must remain transparent. Customers must be allowed to compare and select another eligible tier.

The core customer promise is:

> Customers choose the places. Mali2Ipoh makes the trip work.

The system must never silently replace a customer's selected locations.

---

# 3. Final Tier Rules

## Tier 1: Explore

- Group size: 2–3 travellers
- Maximum duration: 2 days
- Locations: exactly 2 customer-selected locations
- Guide requirement: 1 suitable tour guide
- Support: guide during scheduled tour hours plus emergency support
- Hotel: not included; optional hotel may be offered separately
- Main transportation: suitable guide vehicle
- Arrival options:
  - Ipoh ETS pickup as a paid add-on
  - Self-arrival
- KLIA pickup: not available

## Tier 2: Smart Comfort — Main Recommended Product

- Group size: 2–8 travellers
- Maximum duration: 9 days
- Locations: 2–8 customer-selected locations
- Guide requirement: 1 multilingual tour guide
- Support: guide during scheduled tour hours plus emergency support
- Hotel: approved 3–4-star hotel
- Main transportation: suitable guide vehicle
- Arrival options:
  - KLIA pickup as a paid add-on
  - Ipoh ETS pickup as a paid add-on
  - Self-arrival
- Groups of 2–3 travellers use a small private-group rate or minimum group charge

## Tier 3: Signature

- Group size: 4–8 travellers
- Maximum duration: 9 days
- Locations: 2–8 customer-selected locations
- Guide requirement: 2 multilingual tour guides
- Support: scheduled rotating guide support plus emergency assistance
- Hotel: approved 5-star hotel
- Main transportation: party bus
- Pickup is included
- Arrival options:
  - KLIA
  - Ipoh ETS
  - Ipoh hotel
  - Approved Ipoh address or meeting point

## Unsupported bookings

The automated POC does not support:

- Solo travellers
- Groups above 8 travellers
- Trips above 9 days

Show a manual-enquiry message instead of allowing an invalid booking.

---

# 4. Shared Tier Configuration

Create one shared tier configuration file. The landing page, Trip Builder, recommendation engine, pricing engine and admin panel must use the same configuration.

Suggested structure:

```js
export const TIERS = {
  EXPLORE: {
    id: "EXPLORE",
    name: "Explore",
    positioning: "Short and personal",
    minPax: 2,
    maxPax: 3,
    maxDays: 2,
    minLocations: 2,
    maxLocations: 2,
    guidesRequired: 1,
    multilingualRequired: false,
    hotelStars: [],
    hotelIncluded: false,
    partyBusRequired: false,
    transportOptions: ["ETS_ADDON", "SELF_ARRIVAL"],
  },

  SMART_COMFORT: {
    id: "SMART_COMFORT",
    name: "Smart Comfort",
    positioning: "Hassle-free and flexible",
    minPax: 2,
    maxPax: 8,
    maxDays: 9,
    minLocations: 2,
    maxLocations: 8,
    guidesRequired: 1,
    multilingualRequired: true,
    hotelStars: [3, 4],
    hotelIncluded: true,
    smallGroupMaximum: 3,
    smallGroupSupplementApplies: true,
    partyBusRequired: false,
    transportOptions: [
      "KLIA_ADDON",
      "ETS_ADDON",
      "SELF_ARRIVAL",
    ],
  },

  SIGNATURE: {
    id: "SIGNATURE",
    name: "Signature",
    positioning: "Premium and personalised",
    minPax: 4,
    maxPax: 8,
    maxDays: 9,
    minLocations: 2,
    maxLocations: 8,
    guidesRequired: 2,
    multilingualRequired: true,
    hotelStars: [5],
    hotelIncluded: true,
    partyBusRequired: true,
    transportOptions: [
      "KLIA_INCLUDED",
      "ETS_INCLUDED",
      "IPOH_HOTEL_INCLUDED",
      "IPOH_ADDRESS_INCLUDED",
    ],
  },
};
```

Do not duplicate these rules across different components.

---

# 5. Updated Landing Page

## Hero section

Revise the hero so it primarily communicates Smart Comfort's value.

Recommended content direction:

### Headline

> Build a Hassle-Free Ipoh Trip Around What You Love

### Supporting message

> Choose your preferred Ipoh locations, and we will arrange your itinerary, multilingual guide, accommodation and arrival options.

### Actions

- Primary: `Build My Smart Comfort Trip`
- Secondary: `Compare Trip Options`

The primary CTA opens the guided Trip Builder. It must not bypass trip validation.

## Tier comparison section

Add or update a three-tier comparison:

1. Explore
2. Smart Comfort
3. Signature

Smart Comfort must be visually prioritised:

- Position it in the centre.
- Make it slightly larger or more visually prominent.
- Use the primary accent colour.
- Add `Recommended`.
- Add `Best for Overseas Travellers`.
- Do not claim `Most Popular` until real booking data supports it.
- Give it the strongest CTA.

### Explore summary

> A short, personal Ipoh experience for couples and small groups.

### Smart Comfort summary

> A hassle-free customisable Ipoh journey with multilingual support, comfortable accommodation and flexible arrival options.

### Signature summary

> A premium group experience with two multilingual guides, five-star accommodation, party-bus travel and included pickup.

## Tier-card behaviour

- Clicking Smart Comfort starts the builder with `preferredTier` set to `SMART_COMFORT`.
- Clicking Explore or Signature sets the corresponding preferred tier.
- A preferred tier is not automatically confirmed.
- The system must validate the customer's information before confirming eligibility.
- If the preferred tier is incompatible, explain why and recommend an eligible alternative.

---

# 6. New Booking Flow

The new flow must preserve customer-controlled location selection.

```text
1. Trip Basics
2. Customer Location Selection
3. Feasibility Check
4. Tier Recommendation
5. Tier Confirmation
6. Recommended Itinerary
7. Eligible Hotel Selection
8. Eligible Pickup Selection
9. Price and Inclusions Review
10. Traveller Details
11. Final Review
12. Booking Confirmation
```

---

# 7. Step 1 — Trip Basics

Collect:

- Arrival date
- Departure date
- Adults
- Children
- Children ages when applicable
- Nationality
- Preferred language
- General arrival point:
  - KLIA
  - Ipoh ETS
  - Already in Ipoh
  - Not decided
- Accommodation preference:
  - I will arrange my own
  - 3–4-star hotel
  - 5-star hotel
- Party-bus preference:
  - Interested
  - Not required

Do not collect full flight or train details yet.

Validate:

- Arrival date is required.
- Departure date must be after arrival date.
- At least one traveller is required.
- More than 8 travellers should open the manual-enquiry state.
- Trips above 9 days should open the manual-enquiry state.
- Date-only values must not shift because of UTC or timezone conversion.

---

# 8. Step 2 — Customer Location Selection

The customer must choose all locations themselves.

Keep the four existing categories:

- Famous Landmarks
- Local Food
- Heritage & Culture
- Nature

Do not automatically add, remove or replace locations.

Each card should retain or display:

- Image
- Name
- Category
- Short description
- Estimated visit duration
- Entrance-fee indicator
- Opening information
- Accessibility indicator
- `Add to My Trip` or `Remove` action

## Dynamic location rules

### Two to three travellers

- Explore may be eligible for exactly 2 locations and a maximum of 2 days.
- Smart Comfort may be eligible for 2–8 locations and a maximum of 9 days.
- Do not limit the user to 2 locations merely because the group has 2–3 travellers.
- Allow up to 8 selections because Smart Comfort is available to small private groups.

### Four to eight travellers

- Smart Comfort and Signature may support 2–8 locations.
- Explore is not eligible.

Display:

- Selected count
- Minimum required count
- Maximum supported count
- Estimated required touring time
- Available trip days
- Estimated attraction fees

Do not allow more than 8 locations.

---

# 9. Step 3 — Feasibility Check

When the customer continues, check:

- Trip duration
- Selected-location count
- Attraction estimated durations
- Opening days and hours
- Estimated travel buffers
- Group size
- Arrival point

The feasibility engine may:

- Confirm the selection is practical.
- Warn that too much is selected.
- Ask the customer to remove a location.
- Ask the customer to extend the trip.
- Suggest an alternative date for a closed attraction.
- Suggest a similar optional replacement.

The customer makes the final location decision.

Never silently modify `selectedDestinationIds`.

---

# 10. Step 4 — Tier Eligibility and Recommendation

Create a shared recommendation utility.

## First: apply hard eligibility rules

A tier is ineligible when any hard rule is violated.

### Explore hard rules

- 2–3 travellers
- Maximum 2 days
- Exactly 2 locations
- No KLIA pickup

### Smart Comfort hard rules

- 2–8 travellers
- Maximum 9 days
- 2–8 locations

### Signature hard rules

- 4–8 travellers
- Maximum 9 days
- 2–8 locations

## Second: score eligible tiers

Smart Comfort should be recommended when it is eligible and fits the customer's needs.

Suggested Smart Comfort scoring signals:

- Trip is longer than 2 days
- More than 2 locations selected
- KLIA arrival
- Ipoh ETS arrival
- 3–4-star hotel preference
- Multilingual support required
- Overseas nationality
- Customer does not request party bus or 5-star hotel

Suggested Explore scoring signals:

- 2–3 travellers
- No more than 2 days
- Exactly 2 locations
- Self-arrival or ETS
- Customer arranges own accommodation

Suggested Signature scoring signals:

- 4–8 travellers
- 5-star preference
- Party-bus preference
- Premium group experience requested
- Included pickup preferred

## Business preference rule

If Smart Comfort and another tier are both eligible and similarly suitable, Smart Comfort may win the tie because it is Mali2Ipoh's main product.

Do not recommend Smart Comfort if it violates a hard eligibility rule.

## Recommendation output

Return:

- Recommended tier ID
- Match score
- Customer-facing reasons
- Eligible alternatives
- Ineligible tiers with reasons

Example:

```text
Recommended: Smart Comfort

Why it matches:
- Supports your 5-day trip
- Supports all 6 selected locations
- Multilingual guide included
- 4-star accommodation available
- KLIA pickup can be added
```

---

# 11. Step 5 — Tier Confirmation

Display the recommended tier prominently.

Actions:

- `Continue with Smart Comfort`
- `Compare Eligible Tiers`
- `Change Trip Details`

Requirements:

- Preselect Smart Comfort when it is the valid recommendation.
- Do not automatically confirm it without customer action.
- Let customers choose another eligible tier.
- Disable ineligible tiers.
- Explain why a tier is unavailable.
- If the customer changes tier, immediately revalidate hotel, pickup and pricing eligibility.

If a customer entered the builder through a landing-page tier card, show that tier as their preference but still display the system recommendation.

---

# 12. Step 6 — Recommended Itinerary

Generate the itinerary using only customer-selected locations.

The system may decide:

- Day assignment
- Visit order
- Start and end times
- Meal timing
- Travel buffers
- Attraction opening-time compatibility

The system must not decide which locations the customer visits.

Allow:

- Accept itinerary
- Return to location selection
- Remove a location
- Request a reordered itinerary

The first itinerary date must equal the booking arrival date or first confirmed tour date. Do not create a date before arrival or after departure.

---

# 13. Step 7 — Tier-Based Hotel Selection

Update hotel mock data with:

- Star rating
- Price per night
- Room capacity
- Facilities
- Eligible tiers

## Explore

Show:

- `I will arrange my own accommodation`
- Optional hotel add-ons, if the business supports them

If self-arranged, collect the accommodation name and address.

## Smart Comfort

Show only approved 3-star and 4-star hotels.

Calculate:

- Rooms required
- Nights
- Total hotel price

## Signature

Show only approved 5-star hotels.

If no eligible 5-star hotel exists, disable Signature and explain that availability is required.

---

# 14. Step 8 — Tier-Based Pickup Selection

## Explore

Available:

- `ETS_ADDON`
- `SELF_ARRIVAL`

Do not display KLIA pickup.

## Smart Comfort

Available:

- `KLIA_ADDON`
- `ETS_ADDON`
- `SELF_ARRIVAL`

For groups of 2–3, display the small private-group pricing notice where applicable.

## Signature

Pickup is included.

Available:

- `KLIA_INCLUDED`
- `ETS_INCLUDED`
- `IPOH_HOTEL_INCLUDED`
- `IPOH_ADDRESS_INCLUDED`

Do not add a normal transport add-on charge for Signature.

## Conditional fields

### KLIA

- Terminal
- Airline
- Flight number
- Arrival date
- Arrival time
- Luggage count
- Oversized luggage

### ETS

- Train number
- Departure station
- Arrival date
- Arrival time
- Luggage count

### Ipoh hotel/address

- Hotel or address
- Requested pickup time
- Contact number

---

# 15. Step 9 — Updated Pricing Engine

Use a hybrid price model:

```text
Tier service rate per group/day
+ Hotel rooms × nights
+ Attraction costs per person
+ Eligible arrival add-on
+ Optional extras
+ Taxes/service charges
```

## Explore

- Explore group/day rate
- Attraction fees
- Optional hotel
- Optional ETS transfer

## Smart Comfort

- Smart Comfort group/day rate
- Small-group supplement or minimum group rate for 2–3 travellers
- 3–4-star hotel
- Attraction fees
- Optional KLIA or ETS transfer

## Signature

- Signature group/day rate
- 5-star hotel
- Attraction fees
- Two-guide service
- Party bus
- Included pickup

Avoid double-charging an included Signature item.

## Customer-facing breakdown

Display:

- Selected tier
- Tier service rate
- Number of days
- Accommodation
- Attractions
- Arrival transfer
- Optional extras
- Taxes/service charges
- Estimated total
- Approximate per-person value

Use `Estimated Total`, not `Final POC Total`.

Label sample POC values clearly.

---

# 16. Step 10 — Traveller Details

Retain the existing traveller-details form.

Required:

- Full name
- Nationality
- Email
- WhatsApp with country code
- Emergency contact

Optional:

- Dietary requirements
- Accessibility requirements
- Special requests

For Signature, optionally collect:

- Special occasion
- Party-bus notes
- Premium arrival request

Do not create different customer accounts for the POC.

---

# 17. Step 11 — Final Review

Display:

- Recommended and selected tier
- Recommendation reasons
- Travel dates
- Group size
- Customer-selected locations
- System-arranged itinerary
- Hotel
- Arrival/pickup
- Guides required
- Party-bus requirement
- Included services
- Chargeable add-ons
- Traveller details
- Estimated total

Require confirmation:

> I confirm that my selected locations, itinerary, traveller details and arrival information are correct, and I agree to the booking terms.

Prevent duplicate submissions.

---

# 18. Step 12 — Booking Creation and Confirmation

Extend the existing booking schema.

Add:

```js
{
  preferredTierId,
  recommendedTierId,
  selectedTierId,
  tierMatchScore,
  tierRecommendationReasons,
  eligibleTierIds,
  tierIneligibilityReasons,
  smallGroupSupplementApplied,
  guidesRequired,
  multilingualRequired,
  partyBusRequired,
  pickupIncluded,
  selectedDestinationIds,
  recommendedItinerary,
  hotelId,
  arrivalOption,
  arrivalDetails,
  pricingBreakdown,
  estimatedTotalMYR
}
```

Preserve compatibility with existing locally stored bookings. Missing tier fields in older bookings must not crash the application.

New booking initial status:

```text
PENDING_CONFIRMATION
```

Confirmation page must show:

- Booking reference
- `Pending Confirmation`
- Selected tier
- Traveller
- Travel dates
- Group size
- Customer-selected locations
- Recommended itinerary
- Hotel
- Arrival option
- Estimated total

Do not mention localStorage or browser storage in customer-facing text.

---

# 19. Admin Panel Updates

The admin panel must use the same tier configuration.

## Dashboard

Add:

- Bookings by tier
- Smart Comfort recommendation count
- Smart Comfort selection count
- Smart Comfort recommendation acceptance rate
- Tier 1 to Tier 2 upgrade count
- Tier 2 to Tier 3 upgrade count
- Bookings requiring two guides
- Party-bus bookings
- Small-group Smart Comfort bookings

## Booking list

Add columns or responsive fields:

- Selected tier
- Group size
- Duration
- Number of locations
- Hotel class
- Pickup type
- Pickup included/add-on
- Guides assigned/required
- Party-bus status

## Booking details

Show tier validation:

```text
Selected tier: Smart Comfort
Group size: 3 — Eligible, small-group rate applies
Duration: 5 days — Eligible
Locations: 5 — Eligible
Hotel: 4 star — Eligible
Arrival: KLIA — Add-on available
Guide requirement: 1 multilingual guide
```

## Guide assignment

### Explore

- Assign 1 suitable guide.

### Smart Comfort

- Assign 1 multilingual guide.
- Check full-trip availability.
- Check group and luggage capacity.
- Check KLIA/ETS capability when selected.

### Signature

- Assign 2 multilingual guides.
- Prevent assignment completion until both guides are selected.
- Check overlapping bookings.
- Check party-bus availability.

## Party-bus resource

Create mock party-bus data containing:

- ID
- Name
- Capacity
- Luggage capacity
- KLIA capability
- Ipoh service radius
- Available dates
- Maintenance dates
- Assigned bookings
- Status

## Admin warnings

Show warnings for:

- Invalid group size
- Invalid duration
- Invalid location count
- Ineligible hotel
- Ineligible pickup option
- Missing multilingual guide
- Missing second Signature guide
- Party bus unavailable
- Guide/booking overlap
- Missing arrival information

---

# 20. Analytics and Product Metrics

Calculate from local POC booking data:

- Recommended tier distribution
- Selected tier distribution
- Smart Comfort recommendation acceptance rate
- Explore-to-Smart-Comfort change rate
- Smart-Comfort-to-Signature change rate
- Average estimated value by tier
- Most-selected destinations by tier
- Most common destination combinations by tier
- Average group size by tier
- KLIA versus ETS demand
- Small-group Smart Comfort count

Do not describe mock POC data as real customer performance.

---

# 21. Required Edge Cases

Handle:

1. Two travellers, two days, two locations:
   - Explore and Smart Comfort may both be eligible.
   - Recommend based on hotel, arrival and support preferences.

2. Two travellers, five days, five locations:
   - Explore is ineligible.
   - Smart Comfort is recommended with small-group pricing.

3. Three travellers requiring KLIA pickup:
   - Explore is ineligible for KLIA.
   - Smart Comfort is recommended.

4. Six travellers, five days, six locations, four-star preference:
   - Smart Comfort is recommended.

5. Six travellers, five days, six locations, five-star and party-bus preference:
   - Signature is recommended.

6. Six travellers preferring Signature but no party bus is available:
   - Signature becomes unavailable for those dates.
   - Recommend Smart Comfort or manual review.

7. One traveller:
   - No automated tier.
   - Show manual enquiry.

8. Nine travellers:
   - No automated tier.
   - Show group enquiry.

9. More than eight locations:
   - Prevent continuation.
   - Do not silently remove selections.

10. Existing old booking without tier fields:
    - Admin and confirmation views must render safely.

---

# 22. Migration Requirements

The current project already works. Apply changes carefully.

1. Do not remove existing customer selections.
2. Preserve the existing booking localStorage key unless there is a compelling technical reason to migrate it.
3. If the booking schema changes, add backward-compatible normalisation.
4. Reuse the existing itinerary engine and extend it where needed.
5. Reuse the existing pricing UI but update its calculations and labels.
6. Insert the tier recommendation between location validation and itinerary/hotel selection.
7. Filter existing hotel choices using tier star eligibility.
8. Filter existing arrival choices using tier transport eligibility.
9. Update the confirmation page to display the selected tier.
10. Update admin views without breaking old bookings.

---

# 23. Implementation Order

Implement and test in this order:

## Phase A — Shared rules

- Add tier configuration.
- Add tier eligibility utility.
- Add tier recommendation/scoring utility.
- Add backward-compatible booking normalisation.

## Phase B — Landing page

- Update hero.
- Add/update tier comparison.
- Highlight Smart Comfort.
- Add tier preference entry links.

## Phase C — Trip Builder

- Update trip basics.
- Preserve location selection.
- Add feasibility check.
- Add recommendation step.
- Add comparison and tier confirmation.

## Phase D — Tier-dependent booking steps

- Generate itinerary from customer selections.
- Filter hotels.
- Filter pickup options.
- Update pricing.
- Update final review.

## Phase E — Booking persistence

- Extend booking data.
- Maintain old-booking compatibility.
- Update confirmation page.

## Phase F — Admin panel

- Add tier information.
- Update guide assignment.
- Add party-bus resource.
- Add tier analytics.

---

# 24. Acceptance Tests

The work is complete only when all of these pass:

## Customer control

- Customer selects all locations manually.
- The system never silently changes selected locations.
- The system only arranges the locations into an itinerary.

## Smart Comfort strategy

- Smart Comfort is visually highlighted on the landing page.
- Smart Comfort supports 2–8 travellers.
- Small groups receive the correct rate notice.
- Smart Comfort is recommended when it is eligible and provides the best fit.
- The recommendation explains customer-facing reasons.
- Customers can select another eligible tier.

## Tier enforcement

- Explore rejects trips above 2 days.
- Explore requires exactly 2 locations.
- Explore does not allow KLIA pickup.
- Smart Comfort allows 2–8 locations and up to 9 days.
- Smart Comfort filters hotels to 3–4 stars.
- Signature requires 4–8 travellers.
- Signature filters hotels to 5 stars.
- Signature requires 2 guides and a party bus.
- Signature does not double-charge included pickup.

## Persistence and admin

- New tier information persists in the booking.
- Older bookings still render.
- Booking appears correctly in admin.
- Correct number and type of guides are required.
- Party-bus availability is checked for Signature.
- Dashboard and analytics update.

## Quality

- Mobile, tablet and desktop layouts work.
- No customer-facing POC implementation language appears unnecessarily.
- Customer-facing status labels do not use raw enum formatting.
- Date-only values do not shift because of timezone conversion.
- No duplicate bookings are created.

---

# 25. Final Development Instruction

Use this exact instruction when prompting the coding assistant:

```text
Read mali2ipoh-smart-comfort-booking-flow-prompt.md completely.

Update the existing Mali2Ipoh Next.js application according to the document.
Do not rebuild the project and do not remove existing working functionality.

Use JavaScript only:
- .js for pages, logic, configuration and mock data
- .jsx for reusable React components
- no .ts or .tsx files

Most importantly:
- customers must continue choosing all locations themselves
- Smart Comfort is the main recommended product
- Smart Comfort supports 2–8 travellers
- tier recommendations must use hard eligibility rules first
- customers must be allowed to choose another eligible tier
- the system arranges selected locations but never silently replaces them
- preserve backward compatibility with existing localStorage bookings

Implement the work in the phases listed in the document.
After every phase, run the application and verify that the existing booking journey still works.

When implementation is complete:
1. Run npm run lint.
2. Run npm run build.
3. Fix all errors and warnings caused by the changes.
4. Test every acceptance scenario in the document.
5. Provide a list of files created and modified.
6. Explain any assumptions or unfinished items.
```

