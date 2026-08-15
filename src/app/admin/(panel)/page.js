"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { destinationsById } from "@/data/destinations";
import { getAdminSession } from "@/lib/admin-session";
import { formatArrivalOption, formatBookingStatus } from "@/lib/formatters";

const TODAY = "2026-08-15";
const DISPLAY_DATE = "Saturday, 15 August 2026";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAdminName() {
  if (typeof window === "undefined") {
    return "Admin";
  }

  const session = getAdminSession();
  const emailName = session?.email?.split("@")[0] || "admin";
  const formattedName = emailName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formattedName || "Admin";
}

function buildSummaryCards(bookings) {
  const totalBookings = bookings.length;
  const pendingReview = bookings.filter((booking) => booking.status === "PENDING_CONFIRMATION").length;
  const confirmedTrips = bookings.filter((booking) =>
    ["CONFIRMED", "GUIDE_ASSIGNED", "READY", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
  ).length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalMYR || 0), 0);
  const kliaPickups = bookings.filter((booking) => booking.arrivalOption === "KLIA").length;
  const etsPickups = bookings.filter((booking) => booking.arrivalOption === "ETS").length;

  return [
    {
      title: "Trip registrations",
      value: totalBookings.toLocaleString("en"),
      badge: "All statuses",
      highlight: `${pendingReview} waiting for review`,
      description:
        "Includes pending confirmations, active operations, and completed Smart Comfort trip requests.",
      link: { href: "/admin/bookings", label: "View bookings" },
      tone: "text-[#5d54b9]",
      badgeClass: "border-[#ead48a] bg-[#fff4cc] text-[#9a7a10]",
    },
    {
      title: "Confirmed trips",
      value: confirmedTrips.toLocaleString("en"),
      badge: "Operations",
      highlight: `${bookings.filter((booking) => booking.arrivalDate >= TODAY).length} upcoming arrivals`,
      description:
        "Trips already moving through hotel planning, guide matching, and pickup coordination.",
      link: { href: "/admin/bookings", label: "View operations" },
      tone: "text-[#0d7867]",
      badgeClass: "border-[#c8e5df] bg-[#edf9f5] text-[#0d7867]",
    },
    {
      title: "Revenue tracked",
      value: formatCurrency(totalRevenue),
      badge: "Payments",
      highlight: `${formatCurrency(totalRevenue / Math.max(totalBookings, 1))} average booking value`,
      description:
        "Total booking value captured from the current browser-stored booking flow and itinerary pricing.",
      link: { href: "/admin/analytics", label: "View analytics" },
      tone: "text-[#232744]",
      badgeClass: "border-[#d7d3f7] bg-[#f6f3ff] text-[#5d54b9]",
    },
    {
      title: "Arrival support",
      value: kliaPickups.toLocaleString("en"),
      badge: "Airport",
      highlight: `${etsPickups} ETS pickups`,
      description:
        "Tracks how travellers enter the journey so arrival support can be prepared ahead of time.",
      link: { href: "/admin/bookings", label: "View arrivals" },
      tone: "text-[#5d54b9]",
      badgeClass: "border-[#d7d3f7] bg-[#f6f3ff] text-[#5d54b9]",
    },
  ];
}

function buildActionRows(bookings) {
  return bookings
    .filter(
      (booking) =>
        booking.status === "PENDING_CONFIRMATION" ||
        (booking.arrivalDate >= TODAY && !booking.assignedGuideId),
    )
    .sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate))
    .slice(0, 5);
}

function buildTopDestinations(bookings) {
  const counts = {};

  for (const booking of bookings) {
    for (const destinationId of booking.selectedDestinationIds) {
      const destination = destinationsById[destinationId];
      if (!destination) continue;
      counts[destination.name] = (counts[destination.name] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function buildRecentRows(bookings) {
  return [...bookings]
    .sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))
    .slice(0, 6);
}

function SummaryCard({ card }) {
  return (
    <article className="rounded-[24px] border border-[#e5e9f5] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[15px] font-medium text-[#6f7591]">{card.title}</p>
        <span className={`rounded-full border px-3 py-1 text-sm font-medium ${card.badgeClass}`}>
          {card.badge}
        </span>
      </div>
      <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-[#202440]">{card.value}</p>
      <p className={`mt-6 text-sm font-medium ${card.tone}`}>{card.highlight}</p>
      <p className="mt-3 text-sm leading-8 text-[#6f7591]">{card.description}</p>
      <Link href={card.link.href} className="mt-4 inline-flex text-sm font-medium text-brand">
        {card.link.label} →
      </Link>
    </article>
  );
}

export default function AdminDashboardPage() {
  const { bookings, isLoaded } = useAdminBookings();
  const [adminName] = useState(getAdminName);

  const summaryCards = useMemo(() => buildSummaryCards(bookings), [bookings]);
  const actionRows = useMemo(() => buildActionRows(bookings), [bookings]);
  const topDestinations = useMemo(() => buildTopDestinations(bookings), [bookings]);
  const recentRows = useMemo(() => buildRecentRows(bookings), [bookings]);

  if (!isLoaded) {
    return (
      <section className="rounded-[24px] border border-[#e5e9f5] bg-white p-6 text-sm text-[#6f7591]">
        Loading dashboard...
      </section>
    );
  }

  if (!bookings.length) {
    return (
      <section className="rounded-[24px] border border-[#e5e9f5] bg-white p-8 text-sm text-[#6f7591]">
        No bookings yet. Create a booking from the public trip builder and it will appear here.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[#dfe4f2] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-5 border-b border-[#edf1f8] px-6 py-5">
          <span className="text-xl text-[#2e3156]">◫</span>
          <span className="h-8 w-px bg-[#e7ebf5]" />
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#202440]">Dashboard</h1>
        </div>

        <div className="bg-[#f8f8fc] p-6">
          <div className="rounded-[28px] border border-[#e8ecf6] bg-white px-8 py-8 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#6f7591]">
                  {DISPLAY_DATE}
                </p>
                <h2 className="mt-3 text-6xl font-semibold tracking-[-0.06em] text-[#1f2340]">
                  Good afternoon
                </h2>
                <p className="mt-4 text-[15px] leading-8 text-[#6f7591]">
                  Booking operations across approvals, itinerary readiness, guide assignment,
                  and arrival coordination for {adminName}.
                </p>
              </div>

              <div className="rounded-full border border-dashed border-[#e2cf82] bg-[#fff0b8] px-5 py-4 text-sm font-medium text-[#5f57a8]">
                Tip: pending booking count updates when approvals change.
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-[15px] font-semibold text-[#202440]">At a glance</h3>
            <p className="mt-1 text-[15px] text-[#6f7591]">
              Each card explains what is counted and where to go next to manage that area.
            </p>
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            {summaryCards.slice(0, 3).map((card) => (
              <SummaryCard key={card.title} card={card} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <SummaryCard card={summaryCards[3]} />

            <article className="rounded-[24px] border border-[#e5e9f5] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium text-[#6f7591]">Operational focus</p>
                  <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-[#202440]">
                    {actionRows.length}
                  </p>
                </div>
                <span className="rounded-full border border-[#d7d3f7] bg-[#f6f3ff] px-3 py-1 text-sm font-medium text-[#5d54b9]">
                  Live result
                </span>
              </div>

              <p className="mt-6 text-sm font-medium text-[#0d7867]">
                {bookings.filter((booking) => booking.arrivalDate >= TODAY).length} upcoming arrivals
              </p>
              <p className="mt-3 text-sm leading-8 text-[#6f7591]">
                This queue highlights bookings that still need approval or guide coverage before the trip is ready.
              </p>

              <div className="mt-6 space-y-3">
                {actionRows.length ? (
                  actionRows.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      className="flex items-center justify-between gap-4 rounded-[18px] bg-[#f7f8fd] px-4 py-4 transition hover:bg-[#f1f4fb]"
                    >
                      <div>
                        <p className="font-medium text-[#202440]">{booking.reference}</p>
                        <p className="mt-1 text-sm text-[#6f7591]">
                          {booking.traveller.fullName} • {formatArrivalOption(booking.arrivalOption)}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#fff0b8] px-3 py-1 text-xs font-semibold text-[#6a5e20]">
                        Review
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[#6f7591]">No bookings need action right now.</p>
                )}
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[24px] border border-[#e5e9f5] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium text-[#6f7591]">Recent bookings</p>
                  <p className="mt-1 text-sm text-[#6f7591]">
                    Newest traveller requests from the current booking flow.
                  </p>
                </div>
                <span className="rounded-full border border-[#d7d3f7] bg-[#f6f3ff] px-3 py-1 text-sm font-medium text-[#5d54b9]">
                  Bookings
                </span>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-[#6f7591]">
                    <tr className="border-b border-[#eef2f8]">
                      {["Reference", "Traveller", "Places", "Arrival", "Status", "Total"].map((label) => (
                        <th key={label} className="px-2 py-3 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRows.map((booking) => (
                      <tr key={booking.id} className="border-b border-[#f3f5fa] last:border-b-0">
                        <td className="px-2 py-4">
                          <Link href={`/admin/bookings/${booking.id}`} className="font-medium text-[#202440]">
                            {booking.reference}
                          </Link>
                        </td>
                        <td className="px-2 py-4 text-[#6f7591]">{booking.traveller.fullName}</td>
                        <td className="px-2 py-4 text-[#6f7591]">
                          {booking.selectedDestinationIds
                            .slice(0, 2)
                            .map((id) => destinationsById[id]?.name)
                            .filter(Boolean)
                            .join(", ")}
                        </td>
                        <td className="px-2 py-4 text-[#6f7591]">{booking.arrivalDate}</td>
                        <td className="px-2 py-4">
                          <span className="rounded-full bg-[#f6f3ff] px-3 py-1 text-xs font-semibold text-[#5d54b9]">
                            {formatBookingStatus(booking.status)}
                          </span>
                        </td>
                        <td className="px-2 py-4 font-medium text-[#202440]">
                          {formatCurrency(booking.totalMYR || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#e5e9f5] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium text-[#6f7591]">Popular selections</p>
                  <p className="mt-1 text-sm text-[#6f7591]">
                    The Ipoh places travellers are choosing most often.
                  </p>
                </div>
                <span className="rounded-full border border-[#d7d3f7] bg-[#f6f3ff] px-3 py-1 text-sm font-medium text-[#5d54b9]">
                  Insights
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {topDestinations.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[18px] bg-[#f7f8fd] px-4 py-4"
                  >
                    <span className="text-sm text-[#202440]">{item.label}</span>
                    <span className="rounded-full bg-[#fff0b8] px-3 py-1 text-xs font-semibold text-[#6a5e20]">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </section>
    </div>
  );
}
