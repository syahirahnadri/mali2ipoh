# Mali2Ipoh Pricing Variables

## Purpose

This document defines the pricing factors for Mali2Ipoh trip packages. It is a pricing reference only. It does not change the existing booking journey, tier structure, or project architecture.

## Current Pricing Formula

The current estimate is calculated as:

```text
Estimated total = entrance fees + guide service + operations support
                + multilingual support + party-bus service
                + small-group supplement + hotel cost
                + arrival transfer + taxes and service charges

Estimated price per traveller = estimated total / total travellers
```

| Pricing variable | Pricing approach | Formula or rule | Current status |
| --- | --- | --- | --- |
| Duration and group size | More tour days increase guide and operations costs. More travellers spread shared trip costs across the group. | `Price per pax = (fixed daily cost x duration / group size) + variable cost per pax` | Current calculation already uses tour days, traveller count, daily costs, and a Smart Comfort small-group supplement. |
| Guide service | Covers guide staffing for the selected package tier. | `Guide day rate x required guides x tour days` | Current. |
| Trip planning and operations | Covers trip planning and daily operations support. | `Operations day rate x tour days` | Current. |
| Small-group supplement | Protects pricing where a small private group cannot spread shared daily costs widely. | `Small-group supplement per day x tour days` | Current for Smart Comfort when the group is within its small-group limit. |
| Hotel | Hotel star rating, nightly rate, room capacity, and total nights determine accommodation cost. | `Nightly rate x rooms required x nights` | Current for tiers that include hotels. |
| Activity and entrance fees | Selected attractions or food stops may have an entry fee or per-person cost. Children can use a separate fee multiplier. | `Sum of each selected location fee for adults and children` | Current for destination entrance fees. |
| Arrival transport | Arrival transfer cost depends on the selected pickup point and traveller-count band. | `Configured KLIA or ETS transfer rate by group size` | Current. |
| Multilingual guide support | English guidance is included where applicable. Other language support can be charged as a specialist daily service. | `Multilingual support day rate x tour days` | Current as a tier-based daily charge. |
| Party-bus service | Premium transport service for the Signature tier. | `Party-bus day rate x tour days` | Current for Signature. |
| Taxes and service charges | Applied to chargeable service items. | `Taxable subtotal x tax/service rate` | Current. |

## Package Positioning Guide

The package tier should remain selected through the current eligibility and recommendation rules. The following is a commercial guide for reviewing whether the pricing matches the package position.

| Trip profile | Expected package position | Reason |
| --- | --- | --- |
| Short trip, 1-2 days, and larger group, 6+ travellers | Explore / economy-style value | Shared fixed costs are divided across more travellers, reducing the per-person cost. |
| Long trip, 5+ days, and a small group, 1-2 travellers | Signature / luxury-style value | A small group carries more of the shared cost and normally requires more hotel nights and support time. |
| Long trip with a larger group, or short trip with a small group | Smart Comfort / premium-style value | This is a mixed case. Keep it as the default until booking data confirms better tier boundaries. |

## Proposed Pricing Variables

These variables are valid future additions. They should be added only when the business offers the related option to customers.

| Variable | Example | Proposed formula |
| --- | --- | --- |
| Season | Off-peak demand can justify a discount. School holidays, CNY, Raya, and year-end can require a surcharge because hotels, guides, and transport have limited capacity. | `Season-adjusted price = base price x season multiplier` |
| Season multiplier bands | Off-peak: `0.90`; regular: `1.00`; peak or school holiday: `1.20`; super-peak such as CNY, Raya, or year-end: `1.35`. | Apply the multiplier consistently to the agreed base subtotal. |
| Transport mode | Shared/public transport is lower cost but has less flexibility. Private car rental offers flexibility and is priced per day. Flight or inter-city tickets are priced per traveller. | Public/shared: `fare per pax x transfers`; private car: `daily rate x rental days`, plus fuel or driver where needed; flight/inter-city: `ticket price x pax`. |
| Activity type costs | Sightseeing and walking routes can be free or low cost. Adventure activities and specialist workshops can require equipment or specialist staff. | `Activity cost = entrance fee + equipment fee + specialist guide fee + allocated guide-time cost` |
| Online queue service | The value depends on attraction demand and travel date. It can be waived when no meaningful queue exists. | `Queue service rate by attraction and date` |
| Photographer | Offer half-day or full-day coverage with the selected deliverables. | `Photographer rate x booked duration` |
| Specialist language support | Mandarin, Japanese, Korean, Arabic, and other limited-availability languages can carry a premium. | `Base guide rate x language premium multiplier` |

## Pricing Principles

1. Show every charge as a separate line item in the customer estimate.
2. Keep English guidance included when the selected tier includes it.
3. Apply seasonal adjustments consistently and display the multiplier used.
4. Keep optional services separate from the base package total.
5. Review tier thresholds, multipliers, and daily rates using actual booking data before changing package recommendations.


