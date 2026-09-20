const INTERVIEW_TIME_ZONE = "Australia/Sydney";

const getDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-AU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: INTERVIEW_TIME_ZONE,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

export const getInterviewDateKey = (scheduledAtUtc: string) =>
  getDateKey(new Date(scheduledAtUtc));

export const formatInterviewDayHeading = (scheduledAtUtc: string) =>
  new Date(scheduledAtUtc).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: INTERVIEW_TIME_ZONE,
  });

export const formatInterviewTiming = (scheduledAtUtc: string) => {
  const interviewKey = getInterviewDateKey(scheduledAtUtc);
  const todayKey = getDateKey(new Date());
  const differenceInDays = Math.round(
    (Date.parse(`${interviewKey}T00:00:00Z`) -
      Date.parse(`${todayKey}T00:00:00Z`)) /
      86_400_000,
  );

  if (differenceInDays < 0) {
    return "Past";
  }

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Tomorrow";
  }

  return `In ${differenceInDays} days`;
};

export const toDateTimeLocalValue = (scheduledAtUtc: string) => {
  const date = new Date(scheduledAtUtc);
  const offsetInMilliseconds = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetInMilliseconds)
    .toISOString()
    .slice(0, 16);
};
