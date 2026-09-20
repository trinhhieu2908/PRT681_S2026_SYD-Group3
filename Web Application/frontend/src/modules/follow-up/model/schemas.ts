import { z } from "zod";

export const FOLLOW_UP_FIELD_LIMITS = {
  title: 150,
  notes: 4000,
} as const;

export const getTodayUtcDate = () => new Date().toISOString().slice(0, 10);

export const followUpFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Follow-up title is required")
    .max(
      FOLLOW_UP_FIELD_LIMITS.title,
      `Follow-up title cannot exceed ${FOLLOW_UP_FIELD_LIMITS.title} characters`,
    ),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine(
      (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Enter a valid due date",
    ),
  notes: z
    .string()
    .trim()
    .max(
      FOLLOW_UP_FIELD_LIMITS.notes,
      `Notes cannot exceed ${FOLLOW_UP_FIELD_LIMITS.notes} characters`,
    ),
});

export type FollowUpFormValues = z.infer<typeof followUpFormSchema>;
