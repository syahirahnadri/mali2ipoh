"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminPageFrame from "@/components/admin/AdminPageFrame";
import { useAdminBookings } from "@/components/admin/useAdminData";
import { guidesById } from "@/data/guides";
import { hotelsById } from "@/data/hotels";
import { formatBookingStatus, formatArrivalOption } from "@/lib/formatters";

export default function AdminBookingsPage() {
  const { bookings, isLoaded } = useAdminBookings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [arrivalFilter, setArrivalFilter] = useState("ALL");
  const [guideFilter, setGuideFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        !search ||
        booking.reference.toLowerCase().includes(search.toLowerCase()) ||
        booking.traveller.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
      const matchesArrival = arrivalFilter === "ALL" || booking.arrivalOption === arrivalFilter;
      const matchesGuide =
        guideFilter === "ALL" ||
        (guideFilter === "ASSIGNED" && !!booking.assignedGuideId) ||
        (guideFilter === "UNASSIGNED" && !booking.assignedGuideId);
      const matchesDate = !dateFilter || booking.arrivalDate === dateFilter;

      return matchesSearch && matchesStatus && matchesArrival && matchesGuide && matchesDate;
    });
  }, [arrivalFilter, bookings, dateFilter, guideFilter, search, statusFilter]);

  return (
    <AdminPageFrame
      eyebrow="Bookings"
      title="All customer trip requests"
      description="Filter by booking reference, traveller, status, arrival option, guide assignment, and travel date."
    >
      <section className="admin-card rounded-[2rem] p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference or traveller"
            className="admin-input rounded-2xl px-4 py-3 text-sm text-ink"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="admin-input rounded-2xl px-4 py-3 text-sm text-ink"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="GUIDE_ASSIGNED">Guide Assigned</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={arrivalFilter}
            onChange={(event) => setArrivalFilter(event.target.value)}
            className="admin-input rounded-2xl px-4 py-3 text-sm text-ink"
          >
            <option value="ALL">All arrivals</option>
            <option value="KLIA">KLIA</option>
            <option value="ETS">ETS</option>
            <option value="SELF_ARRIVAL">Self Arrival</option>
          </select>
          <select
            value={guideFilter}
            onChange={(event) => setGuideFilter(event.target.value)}
            className="admin-input rounded-2xl px-4 py-3 text-sm text-ink"
          >
            <option value="ALL">All guide states</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="admin-input rounded-2xl px-4 py-3 text-sm text-ink"
          />
        </div>
      </section>

      {!isLoaded ? (
        <section className="admin-card rounded-[2rem] p-6 text-sm text-muted">Loading bookings...</section>
      ) : null}

      {isLoaded && !filteredBookings.length ? (
        <section className="admin-card rounded-[2rem] p-6 text-sm text-muted">
          No bookings match current filters.
        </section>
      ) : null}

      {filteredBookings.length ? (
        <>
          <section className="admin-table hidden overflow-hidden rounded-[2rem] xl:block">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  {["Booking Reference", "Traveller", "Nationality", "Travel Dates", "Group Size", "Hotel", "Arrival", "Status", "Assigned Guide", "View"].map((label) => (
                    <th key={label} className="px-4 py-3 font-semibold">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-line">
                    <td className="px-4 py-3 text-ink">{booking.reference}</td>
                    <td className="px-4 py-3 text-ink">{booking.traveller.fullName}</td>
                    <td className="px-4 py-3 text-muted">{booking.traveller.nationality}</td>
                    <td className="px-4 py-3 text-muted">{booking.arrivalDate} to {booking.departureDate}</td>
                    <td className="px-4 py-3 text-muted">{booking.adults + booking.children}</td>
                    <td className="px-4 py-3 text-muted">{hotelsById[booking.hotelId]?.name || "TBD"}</td>
                    <td className="px-4 py-3 text-muted">{formatArrivalOption(booking.arrivalOption)}</td>
                    <td className="px-4 py-3 text-muted">{formatBookingStatus(booking.status)}</td>
                    <td className="px-4 py-3 text-muted">{guidesById[booking.assignedGuideId]?.name || "Unassigned"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${booking.id}`} className="font-semibold text-brand-deep">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-4 xl:hidden">
            {filteredBookings.map((booking) => (
              <article key={booking.id} className="admin-card rounded-[1.75rem] p-5">
                <p className="font-semibold text-ink">{booking.reference}</p>
                <p className="mt-2 text-sm text-muted">{booking.traveller.fullName} • {booking.traveller.nationality}</p>
                <p className="mt-1 text-sm text-muted">{booking.arrivalDate} to {booking.departureDate}</p>
                <p className="mt-1 text-sm text-muted">Arrival: {formatArrivalOption(booking.arrivalOption)}</p>
                <p className="mt-1 text-sm text-muted">Status: {formatBookingStatus(booking.status)}</p>
                <p className="mt-1 text-sm text-muted">Guide: {guidesById[booking.assignedGuideId]?.name || "Unassigned"}</p>
                <Link href={`/admin/bookings/${booking.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-deep">View Booking</Link>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </AdminPageFrame>
  );
}
