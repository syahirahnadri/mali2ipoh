const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDate(dateString) {
  if (!dateString) {
    return null;
  }

  const match = DATE_PATTERN.exec(dateString);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatLocalDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addLocalDays(dateString, offset) {
  const date = parseLocalDate(dateString);

  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + offset);
  return formatLocalDateValue(date);
}

export function diffLocalCalendarDays(startDateString, endDateString) {
  const start = parseLocalDate(startDateString);
  const end = parseLocalDate(endDateString);

  if (!start || !end) {
    return 0;
  }

  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.round((endUtc - startUtc) / 86400000);
}

export function formatTravellerDate(dateString, locale = "en-MY") {
  const date = parseLocalDate(dateString);

  if (!date) {
    return dateString || "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
