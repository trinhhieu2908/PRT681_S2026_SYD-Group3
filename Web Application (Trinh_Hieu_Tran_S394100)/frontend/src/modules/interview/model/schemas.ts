import { z } from "zod";

export const INTERVIEW_FIELD_LIMITS = {
  title: 150,
  interviewType: 100,
  location: 250,
  meetingLink: 2048,
  contactName: 150,
  contactEmail: 320,
  contactPhone: 50,
  notes: 4000,
} as const;

const optionalText = (maximumLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maximumLength, {
      message: `${label} cannot exceed ${maximumLength} characters`,
    });

const optionalUrl = optionalText(
  INTERVIEW_FIELD_LIMITS.meetingLink,
  "Meeting link",
).refine((value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Enter a valid HTTP or HTTPS URL");

const optionalEmail = optionalText(
  INTERVIEW_FIELD_LIMITS.contactEmail,
  "Contact email",
).refine(
  (value) => !value || z.email().safeParse(value).success,
  "Enter a valid email address",
);

export const interviewFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Interview title is required")
    .max(
      INTERVIEW_FIELD_LIMITS.title,
      `Interview title cannot exceed ${INTERVIEW_FIELD_LIMITS.title} characters`,
    ),
  interviewType: z
    .string()
    .trim()
    .min(1, "Interview type is required")
    .max(
      INTERVIEW_FIELD_LIMITS.interviewType,
      `Interview type cannot exceed ${INTERVIEW_FIELD_LIMITS.interviewType} characters`,
    ),
  scheduledAtLocal: z
    .string()
    .min(1, "Scheduled date and time are required")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Enter a valid date and time",
    ),
  location: optionalText(INTERVIEW_FIELD_LIMITS.location, "Location"),
  meetingLink: optionalUrl,
  contactName: optionalText(INTERVIEW_FIELD_LIMITS.contactName, "Contact name"),
  contactEmail: optionalEmail,
  contactPhone: optionalText(
    INTERVIEW_FIELD_LIMITS.contactPhone,
    "Contact phone",
  ),
  notes: optionalText(INTERVIEW_FIELD_LIMITS.notes, "Notes"),
});

export type InterviewFormValues = z.infer<typeof interviewFormSchema>;
