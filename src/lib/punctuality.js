export const PUNCTUALITY_STATUSES = {
  PENDING: "PENDING",
  EARLY: "EARLY",
  ON_TIME: "ON_TIME",
  LATE: "LATE",
  CRITICAL_LATE: "CRITICAL_LATE",
  NO_SHOW: "NO_SHOW",
};

export const CHECKPOINT_TYPES = {
  KLIA_PICKUP: "KLIA_PICKUP",
  ETS_PICKUP: "ETS_PICKUP",
  DAY_1_MEETUP: "DAY_1_MEETUP",
  DAY_START_TRANSFER: "DAY_START_TRANSFER",
};

export const CHECK_IN_METHODS = {
  GUIDE_SELF_CHECKIN: "GUIDE_SELF_CHECKIN",
  ADMIN_MANUAL_UPDATE: "ADMIN_MANUAL_UPDATE",
  CUSTOMER_CONFIRMATION: "CUSTOMER_CONFIRMATION",
};

function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return (hours * 60) + minutes;
}

export function deriveCheckpointType(arrivalOption) {
  if (arrivalOption === "KLIA") {
    return CHECKPOINT_TYPES.KLIA_PICKUP;
  }

  if (arrivalOption === "ETS") {
    return CHECKPOINT_TYPES.ETS_PICKUP;
  }

  return CHECKPOINT_TYPES.DAY_1_MEETUP;
}

export function addMinutesToClock(time, minutesDelta) {
  const baseMinutes = parseTimeToMinutes(time);

  if (baseMinutes === null || Number.isNaN(Number(minutesDelta))) {
    return "";
  }

  const normalized = (((baseMinutes + Number(minutesDelta)) % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minutes = String(normalized % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function evaluatePunctuality(scheduledTime, actualTime) {
  const scheduledMinutes = parseTimeToMinutes(scheduledTime);
  const actualMinutes = parseTimeToMinutes(actualTime);

  if (scheduledMinutes === null) {
    return {
      status: PUNCTUALITY_STATUSES.PENDING,
      minutesEarlyLate: null,
    };
  }

  if (!actualTime) {
    return {
      status: PUNCTUALITY_STATUSES.PENDING,
      minutesEarlyLate: null,
    };
  }

  if (actualTime === PUNCTUALITY_STATUSES.NO_SHOW) {
    return {
      status: PUNCTUALITY_STATUSES.NO_SHOW,
      minutesEarlyLate: null,
    };
  }

  if (actualMinutes === null) {
    return {
      status: PUNCTUALITY_STATUSES.PENDING,
      minutesEarlyLate: null,
    };
  }

  const variance = actualMinutes - scheduledMinutes;

  if (variance < -5) {
    return {
      status: PUNCTUALITY_STATUSES.EARLY,
      minutesEarlyLate: variance,
    };
  }

  if (variance <= 10) {
    return {
      status: PUNCTUALITY_STATUSES.ON_TIME,
      minutesEarlyLate: variance,
    };
  }

  if (variance <= 20) {
    return {
      status: PUNCTUALITY_STATUSES.LATE,
      minutesEarlyLate: variance,
    };
  }

  return {
    status: PUNCTUALITY_STATUSES.CRITICAL_LATE,
    minutesEarlyLate: variance,
  };
}
