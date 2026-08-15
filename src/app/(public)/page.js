import { destinationsById, featuredCategories } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { TIERS, TIER_IDS } from "@/data/tiers";
import Button from "@/components/shared/Button";
import BrandLogo from "@/components/shared/BrandLogo";
import Container from "@/components/shared/Container";
import Footer from "@/components/shared/Footer";

const navItems = [
  { href: "#discover", label: "Discover" },
  { href: "#journey", label: "Journey" },
  { href: "#stays", label: "Stays" },
  { href: "#offers", label: "Offers" },
];

const partnerLogos = ["airbnb", "Booking.com", "trivago", "Expedia"];

const quickStats = [
  { value: "4.9", label: "traveller rating" },
  { value: "2-8", label: "guests supported" },
  { value: "KLIA + ETS", label: "smooth arrival options" },
];

const destinationCards = featuredCategories.slice(0, 3).map((category, index) => {
  const featuredDestination = destinationsById[category.featuredDestinationIds[0]];

  return {
    id: category.id,
    title: featuredDestination.name,
    label: category.headline,
    description: featuredDestination.description,
    meta: `${category.featuredDestinationIds.length} curated stops`,
    choiceLabel: category.featuredDestinationIds
      .map((destinationId) => destinationsById[destinationId]?.name)
      .filter(Boolean)
      .join(" • "),
    tint: [
      "from-[#2f7ec8] via-[#58a9df] to-[#d3efff]",
      "from-[#f8b7ae] via-[#fdd9d2] to-[#c2edff]",
      "from-[#36a7d6] via-[#7fd7e8] to-[#ecf8d6]",
    ][index],
  };
});

const journeySteps = [
  {
    title: "Find Your Destination",
    description: "Browse the short list of Ipoh experiences built for first-timers.",
  },
  {
    title: "Book A Ticket",
    description: "Start with Smart Comfort and we shape the pace, stay, and route around you.",
    featured: true,
  },
  {
    title: "Pay & Start Journey",
    description: "Receive a practical itinerary with hotel and arrival support already aligned.",
  },
];

const promoNotes = [
  "Arrival pickup can be added from KLIA or Ipoh ETS.",
  "Hotel choices stay focused so the booking flow feels easy.",
  "One guide supports the trip throughout the journey.",
];

function getPreferredTierHref(tierId) {
  return `/trip-builder?preferredTier=${tierId}`;
}

function SectionTitle({ title, description }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-ink md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-muted md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const smartComfort = TIERS[TIER_IDS.SMART_COMFORT];

  return (
    <div className="page-shell">
      <main className="pb-20 pt-6 md:pb-24 md:pt-8">
        <Container>
          <div className="mx-auto max-w-6xl rounded-[36px] bg-white/90 p-3 shadow-[0_28px_80px_rgba(31,72,119,0.12)] ring-1 ring-white/70 backdrop-blur md:rounded-[44px] md:p-5">
            <section className="rounded-[30px] bg-white p-4 md:rounded-[38px] md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf2f7] pb-4">
                <BrandLogo
                  href="/"
                  className="block"
                  imageClassName="max-w-[126px] md:max-w-[142px]"
                  priority
                />

                <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted md:flex">
                  {navItems.map((item) => (
                    <a key={item.label} href={item.href} className="transition hover:text-ink">
                      {item.label}
                    </a>
                  ))}
                </nav>

                <Button
                  href={getPreferredTierHref(TIER_IDS.SMART_COMFORT)}
                  className="rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em]"
                >
                  Book Trip
                </Button>
              </div>

              <div className="mt-4 grid gap-5 lg:grid-cols-[1.02fr_1.18fr]">
                <div className="flex flex-col justify-between rounded-[30px] px-3 py-5 md:px-5 md:py-7">
                  <div className="space-y-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6f8aa3]">
                      Mali2Ipoh travel design
                    </p>
                    <div className="space-y-4">
                      <h1 className="max-w-md font-display text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-ink md:text-6xl">
                        Experience The Magic Of Flight!
                      </h1>
                      <p className="max-w-md text-sm leading-7 text-muted md:text-base">
                        A softer, more premium landing page for Smart Comfort trips,
                        shaped like a modern travel brand instead of a booking form.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button href={getPreferredTierHref(TIER_IDS.SMART_COMFORT)}>
                        Book A Trip Now
                      </Button>
                      <a
                        href="#discover"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e6f2] bg-white text-lg text-[#4f7bb0] transition hover:-translate-y-0.5"
                        aria-label="Discover more"
                      >
                        →
                      </a>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {quickStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[22px] border border-[#e9f0f5] bg-[#f8fbfe] px-4 py-4"
                      >
                        <p className="text-xl font-semibold tracking-[-0.04em] text-ink">
                          {item.value}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sky-hero relative overflow-hidden rounded-[34px] p-5 md:p-7">
                  <div className="floating-plane" aria-hidden="true">
                    ✈
                  </div>

                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <span className="cloud-pill">Overseas-friendly planning</span>
                        <span className="cloud-pill">Hotel + guide + pickup</span>
                      </div>
                      <div className="rounded-[22px] bg-white/72 px-4 py-3 text-right shadow-[0_18px_40px_rgba(72,117,161,0.12)] backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6983a0]">
                          Recommended tier
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {smartComfort.name}
                        </p>
                      </div>
                    </div>

                    <div className="ml-auto max-w-[220px] rounded-[28px] bg-white/84 p-4 shadow-[0_20px_45px_rgba(80,122,166,0.16)] backdrop-blur md:p-5">
                      <p className="text-sm font-semibold text-ink">Know More</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {smartComfort.minPax}-{smartComfort.maxPax} travellers,
                        multilingual guide, and curated 3-4 star stays.
                      </p>
                      <div className="mt-4 flex -space-x-3">
                        {["A", "M", "I"].map((avatar) => (
                          <span
                            key={avatar}
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(145deg,#55a6de,#a8def8)] text-xs font-semibold text-white"
                          >
                            {avatar}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="logo-cloud mt-5 rounded-[26px] px-4 py-4 md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-[#5b87b7]">
                      1600+
                    </span>
                    <span>trusted by travellers who want a calmer Ipoh plan</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#9aa8b4]">
                    {partnerLogos.map((logo) => (
                      <span key={logo}>{logo}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="discover" className="px-2 pb-2 pt-8 md:px-3 md:pt-10">
              <div className="flex items-end justify-between gap-4">
                <SectionTitle
                  title="Popular Destination"
                  description="Start with the travel style that feels most like your trip."
                />
                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0f1720] text-white md:flex">
                  ›
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {destinationCards.map((card) => (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-[24px] bg-white shadow-[0_18px_44px_rgba(65,94,130,0.08)] ring-1 ring-[#edf2f7]"
                  >
                    <div
                      className={`destination-art h-44 bg-gradient-to-br ${card.tint}`}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">{card.title}</h3>
                          <p className="mt-1 text-xs text-muted">{card.meta}</p>
                        </div>
                        <span className="rounded-full bg-[#2f7df6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                          4.9
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">{card.label}</p>
                      <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
                      <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[#5f7d98]">
                        User can choose: {card.choiceLabel}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="journey" className="px-2 pb-2 pt-10 md:px-3 md:pt-14">
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a96b2]">
                  Journey To The Skies Made Simple!
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-ink md:text-4xl">
                  Booking that feels guided, not overwhelming.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                  The screenshot you shared has a strong travel-magazine rhythm, so this
                  section mirrors that with three clean steps and a featured center card.
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {journeySteps.map((step) => (
                  <article
                    key={step.title}
                    className={`rounded-[28px] p-6 ${
                      step.featured
                        ? "bg-[linear-gradient(180deg,#2482f7_0%,#1b6ce1_100%)] text-white shadow-[0_28px_60px_rgba(36,130,247,0.28)]"
                        : "bg-[#f7f9fc] text-ink ring-1 ring-[#eef2f7]"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        step.featured ? "bg-white/18" : "bg-white text-[#2f7df6] shadow-sm"
                      }`}
                    >
                      {step.featured ? "✈" : "•"}
                    </div>
                    <h3 className="mt-12 max-w-[12rem] text-xl font-semibold tracking-[-0.03em]">
                      {step.title}
                    </h3>
                    <p
                      className={`mt-4 text-sm leading-7 ${
                        step.featured ? "text-white/82" : "text-muted"
                      }`}
                    >
                      {step.description}
                    </p>
                    <a
                      href={getPreferredTierHref(TIER_IDS.SMART_COMFORT)}
                      className={`mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.18em] ${
                        step.featured ? "text-white" : "text-[#2f7df6]"
                      }`}
                    >
                      Learn More
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section id="stays" className="grid gap-6 px-2 pb-2 pt-10 lg:grid-cols-[0.82fr_1.18fr] md:px-3 md:pt-14">
              <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_22px_50px_rgba(65,94,130,0.08)] ring-1 ring-[#edf2f7]">
                <div className="destination-art h-72 bg-[linear-gradient(180deg,#8ed3f9_0%,#bce7ff_48%,#f7d699_100%)]" />
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-xl font-semibold tracking-[-0.04em] text-[#2f7df6]">
                      20% OFF
                    </p>
                    <p className="mt-1 text-sm text-muted">for early comfort planners</p>
                  </div>
                  <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f7df6]">
                    limited
                  </span>
                </div>
              </article>

              <article id="offers" className="flex flex-col justify-between rounded-[30px] bg-white p-6 shadow-[0_22px_50px_rgba(65,94,130,0.08)] ring-1 ring-[#edf2f7] md:p-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a96b2]">
                    Smart Comfort offer
                  </p>
                  <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-ink md:text-6xl">
                    Unleash Wanderlust With Skywings
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
                    This adapts the bold closing banner from your reference while keeping it
                    grounded in the Mali2Ipoh product: guided planning, compact hotel choices,
                    and better arrival handling for overseas travellers.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {promoNotes.map((note) => (
                    <div
                      key={note}
                      className="rounded-[22px] bg-[#f7fbff] px-4 py-4 text-sm leading-6 text-muted ring-1 ring-[#e7eef6]"
                    >
                      {note}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-muted">
                    3 curated stays, from MYR {hotels[0].pricePerNightMYR} per night.
                  </div>
                  <Button
                    href={getPreferredTierHref(TIER_IDS.SMART_COMFORT)}
                    className="min-w-[220px] justify-center rounded-[18px] bg-[linear-gradient(180deg,#f3fbff_0%,#d8efff_100%)] shadow-none"
                  >
                    <span className="text-brand-deep">Book A Flight Now</span>
                  </Button>
                </div>
              </article>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
