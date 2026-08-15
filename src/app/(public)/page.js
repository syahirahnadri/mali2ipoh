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
      "from-[#156ea8] via-[#64a9d2] to-[#e3f1f9]",
      "from-[#ff9f5d] via-[#ffd3b4] to-[#d9edf8]",
      "from-[#0f5f92] via-[#6eb3d8] to-[#fff1de]",
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
      <main className="pb-16 pt-4 md:pb-20 md:pt-6">
        <Container className="max-w-[100rem] px-3 sm:px-4 lg:px-5">
          <div className="mx-auto max-w-[96rem] rounded-[24px] bg-white/90 p-2 shadow-[0_28px_80px_rgba(21,83,122,0.12)] ring-1 ring-white/70 backdrop-blur sm:rounded-[32px] sm:p-3 md:rounded-[40px] md:p-4">
            <section className="rounded-[22px] bg-white p-4 sm:rounded-[28px] md:rounded-[34px] md:p-5">
              <div className="flex flex-col gap-4 border-b border-[#edf2f7] pb-3 md:grid md:grid-cols-[88px_1fr_auto] md:items-center md:gap-6 lg:grid-cols-[96px_1fr_auto]">
                <BrandLogo
                  href="/"
                  className="block"
                  imageClassName="max-w-[66px] sm:max-w-[72px] md:max-w-[88px] lg:max-w-[96px]"
                  priority
                />

                <nav className="hidden items-center justify-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted md:flex lg:gap-7">
                  {navItems.map((item) => (
                    <a key={item.label} href={item.href} className="transition hover:text-ink">
                      {item.label}
                    </a>
                  ))}
                </nav>

                <Button
                  href={getPreferredTierHref(TIER_IDS.SMART_COMFORT)}
                  className="w-full justify-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] text-white sm:w-auto md:min-w-[148px]"
                >
                  Book Trip
                </Button>
              </div>

              <div className="mt-2 grid gap-4 xl:grid-cols-[0.98fr_1.02fr] xl:items-stretch">
                <div className="flex flex-col justify-between rounded-[28px] px-1 py-4 md:px-3 md:py-5">
                  <div className="space-y-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#567892]">
                      Smart Comfort trips
                    </p>
                    <div className="space-y-3">
                      <h1 className="max-w-[11ch] font-display text-4xl font-semibold leading-[0.92] tracking-[-0.065em] text-ink sm:text-5xl md:text-[4.55rem]">
                        Experience The Magic Of Flight!
                      </h1>
                      <p className="max-w-xl text-sm leading-7 text-muted md:text-base">
                        Plan a smoother Ipoh getaway with hotel options, guide support,
                        and arrival help arranged in one guided booking flow.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button href={getPreferredTierHref(TIER_IDS.SMART_COMFORT)} className="w-full justify-center text-white sm:w-auto">
                        Book A Trip Now
                      </Button>
                      <a
                        href="#discover"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d5e4ef] bg-white text-lg text-brand transition hover:-translate-y-0.5"
                        aria-label="Discover more"
                      >
                        →
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {quickStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[22px] border border-[#e2ebf1] bg-[#f8fbfd] px-4 py-3.5"
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

                <div className="sky-hero relative overflow-hidden rounded-[30px] p-4 md:p-5 xl:min-h-[520px]">
                  <div className="floating-plane" aria-hidden="true">
                    ✈
                  </div>

                  <div className="flex h-full flex-col justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <span className="cloud-pill">Overseas-friendly planning</span>
                        <span className="cloud-pill">Hotel + guide + pickup</span>
                      </div>
                      <div className="max-w-full rounded-[22px] bg-white/72 px-4 py-3 text-left shadow-[0_18px_40px_rgba(42,100,143,0.12)] backdrop-blur sm:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5a7891]">
                          Recommended tier
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {smartComfort.name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 max-w-[220px] self-end rounded-[26px] bg-white/84 p-4 shadow-[0_20px_45px_rgba(42,100,143,0.16)] backdrop-blur md:mt-0 md:p-5">
                      <p className="text-sm font-semibold text-ink">Trip snapshot</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {smartComfort.minPax}-{smartComfort.maxPax} travellers,
                        multilingual guide, and curated 3-4 star stays.
                      </p>
                      <div className="mt-4 flex -space-x-3">
                        {["A", "M", "I"].map((avatar) => (
                          <span
                            key={avatar}
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(145deg,#156ea8,#ff9a56)] text-xs font-semibold text-white"
                          >
                            {avatar}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="logo-cloud mt-4 rounded-[24px] px-4 py-3 md:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-brand">
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

            <section id="discover" className="px-1 pb-2 pt-6 sm:px-2 md:px-2.5 md:pt-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <SectionTitle
                  title="Popular Destination"
                  description="Choose the kind of Ipoh experience that fits your group best."
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
                      className={`destination-art h-40 sm:h-44 bg-gradient-to-br ${card.tint}`}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">{card.title}</h3>
                          <p className="mt-1 text-xs text-muted">{card.meta}</p>
                        </div>
                        <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                          4.9
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">{card.label}</p>
                      <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
                      <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[#5a7891]">
                        Featured stops: {card.choiceLabel}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="journey" className="px-1 pb-2 pt-8 sm:px-2 md:px-2.5 md:pt-10">
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5f7f99]">
                  Journey To The Skies Made Simple!
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-ink md:text-4xl">
                  Booking that feels guided, not overwhelming.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                  Move from inspiration to confirmed plans with a simple flow built for
                  overseas travellers and small private groups.
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {journeySteps.map((step) => (
                  <article
                    key={step.title}
                    className={`rounded-[28px] p-5 ${
                      step.featured
                        ? "bg-[linear-gradient(180deg,#156ea8_0%,#0f5f92_100%)] text-white shadow-[0_28px_60px_rgba(21,110,168,0.24)]"
                        : "bg-[#f7f9fc] text-ink ring-1 ring-[#eef2f7]"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        step.featured ? "bg-white/18" : "bg-white text-brand shadow-sm"
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
                        step.featured ? "text-white" : "text-brand"
                      }`}
                    >
                      Learn More
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section id="stays" className="grid gap-5 px-1 pb-2 pt-8 sm:px-2 md:px-2.5 md:pt-10 lg:grid-cols-[0.84fr_1.16fr]">
              <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_22px_50px_rgba(65,94,130,0.08)] ring-1 ring-[#edf2f7]">
                <div className="destination-art h-56 sm:h-72 bg-[linear-gradient(180deg,#93c6e3_0%,#d9edf8_48%,#ffd8bc_100%)]" />
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-xl font-semibold tracking-[-0.04em] text-brand">
                      20% OFF
                    </p>
                    <p className="mt-1 text-sm text-muted">for early comfort planners</p>
                  </div>
                  <span className="rounded-full bg-[#edf7fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    limited
                  </span>
                </div>
              </article>

              <article id="offers" className="flex flex-col justify-between rounded-[30px] bg-white p-5 shadow-[0_22px_50px_rgba(65,94,130,0.08)] ring-1 ring-[#edf2f7] sm:p-6 md:p-7">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5f7f99]">
                    Smart Comfort offer
                  </p>
                  <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-ink sm:text-5xl md:text-6xl">
                    Unleash Wanderlust With Skywings
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
                    Enjoy a more comfortable way to plan Ipoh, with curated stays,
                    guided support, and arrival coordination designed around your trip.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {promoNotes.map((note) => (
                    <div
                      key={note}
                      className="rounded-[22px] bg-[#f8fbfd] px-4 py-4 text-sm leading-6 text-muted ring-1 ring-[#e1ebf1]"
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
                    className="w-full justify-center rounded-[18px] bg-[linear-gradient(180deg,#ff9a56_0%,#ff852f_100%)] shadow-[0_16px_32px_rgba(255,133,47,0.28)] sm:min-w-[220px] sm:w-auto"
                  >
                    <span className="text-white">Book A Flight Now</span>
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
