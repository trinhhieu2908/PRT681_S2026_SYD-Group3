/**
 * Date utility functions for handling API date formats
 * API returns dates in format: "2025-08-03T12:54:55.252Z"
 */

export type DateFormat =
  | "short"
  | "long"
  | "time"
  | "datetime"
  | "relative"
  | "iso"
  | "datetime-short"
  | "datetime-compact";

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
}

/**
 * Parse API date string to Date object
 * Handles the format: "2025-08-03T12:54:55.252Z"
 */
export const parseApiDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }

  if (!dateString) {
    throw new Error("Date string is required");
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  return date;
};

/**
 * Format relative time (e.g., "1 min ago", "2 hours ago", "1 day ago")
 * Falls back to formatted date for times older than 2 months
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Minutes (1-59 minutes)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  // Hours (1-23 hours)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  // Days (1-6 days)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  // Weeks (1-3 weeks)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  // Months (1-2 months)
  if (diffInMonths < 2) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  // Fall back to formatted date for older times
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Australia/Sydney",
  });
};

/**
 * Format date based on predefined formats
 */
export const formatDate = (
  dateInput: string | Date,
  format: DateFormat = "short",
  options: DateFormatOptions = {},
): string => {
  try {
    const date = parseApiDate(dateInput);
    const { locale = "en-AU", timeZone = "Australia/Sydney" } = options;

    switch (format) {
      case "short":
        return date.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone,
        });

      case "long":
        return date.toLocaleDateString(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone,
        });

      case "time":
        return date.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          timeZone,
        });

      case "datetime":
        return date.toLocaleString(locale, {
          day: "numeric",
          month: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone,
        });

      case "datetime-compact":
        const time = date.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          timeZone,
        });
        const dateStr = date.toLocaleDateString(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone,
        });
        return `${time}, ${dateStr}`;

      case "relative":
        return formatRelativeTime(date);

      case "iso":
        return date.toISOString();

      default:
        return date.toLocaleDateString(locale, { timeZone });
    }
  } catch (error) {
    return "Unknown Date";
  }
};

/**
 * Get current date in API format
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};
