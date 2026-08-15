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

export function formatTierId(tierId) {
  if (!tierId) {
    return "Not selected";
  }

  return tierId
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatPunctualityStatus(status) {
  if (!status) {
    return "Not recorded";
  }

  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatCheckpointType(type) {
  if (!type) {
    return "General meetup";
  }

  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatCheckInMethod(method) {
  if (!method) {
    return "Not set";
  }

  return method
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
