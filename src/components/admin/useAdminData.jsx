"use client";

import { useEffect, useMemo, useState } from "react";
import { buildAdminAnalytics } from "@/lib/admin-analytics";
import {
  appendBookingInternalNote,
  getBookingInternalNotes,
  getStoredBookings,
  updateStoredBooking,
} from "@/lib/storage";

export function useAdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setBookings(getStoredBookings());
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  function refreshBookings() {
    setBookings(getStoredBookings());
  }

  function updateBooking(id, updater) {
    const booking = updateStoredBooking(id, updater);
    refreshBookings();
    return booking;
  }

  function addInternalNote(bookingId, note) {
    const notes = appendBookingInternalNote(bookingId, note);
    refreshBookings();
    return notes;
  }

  function getNotes(bookingId) {
    return getBookingInternalNotes(bookingId);
  }

  const analytics = useMemo(() => buildAdminAnalytics(bookings), [bookings]);

  return {
    bookings,
    isLoaded,
    refreshBookings,
    updateBooking,
    addInternalNote,
    getNotes,
    analytics,
  };
}
