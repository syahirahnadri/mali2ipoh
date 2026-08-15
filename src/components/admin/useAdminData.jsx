"use client";

import { useEffect, useMemo, useState } from "react";
import { buildAdminAnalytics } from "@/lib/admin-analytics";
import {
  appendBookingInternalNote,
  clearPresentationDemoBookings,
  getBookingInternalNotes,
  getStoredBookings,
  importPresentationDemoBookings,
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

  function loadPresentationDemoBookings() {
    const result = importPresentationDemoBookings();
    refreshBookings();
    return result;
  }

  function clearPresentationBookings() {
    const result = clearPresentationDemoBookings();
    refreshBookings();
    return result;
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
    loadPresentationDemoBookings,
    clearPresentationBookings,
    analytics,
  };
}
