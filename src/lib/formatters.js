export function formatBookingStatus(status) {
  if (!status) {
    return "";
  }

  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatArrivalOption(arrivalOption) {
  if (arrivalOption === "KLIA") {
    return "KLIA Pickup";
  }

  if (arrivalOption === "ETS") {
    return "Ipoh ETS Pickup";
  }

  if (arrivalOption === "SELF_ARRIVAL") {
    return "Self Arrival";
  }

  return "Not Set";
}
