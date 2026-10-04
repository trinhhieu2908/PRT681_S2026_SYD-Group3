import { randomUUID } from "node:crypto";

/** Every test registers its own user, so tests never share data and can run in parallel. */
export const uniqueEmail = (prefix = "qa") =>
  `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@jobtrack-test.com`;

export const VALID_PASSWORD = "Str0ng!Pass";

export const uniqueSuffix = () => randomUUID().slice(0, 6);

export const newApplication = (overrides: Partial<CreateApplication> = {}): CreateApplication => ({
  companyName: `Acme ${uniqueSuffix()}`,
  roleTitle: "Software Developer",
  platform: "LinkedIn",
  jobLink: "https://example.com/jobs/123",
  portfolioLink: null,
  gitHubLink: null,
  ...overrides,
});

export interface CreateApplication {
  companyName: string;
  roleTitle: string;
  platform: string;
  jobLink?: string | null;
  portfolioLink?: string | null;
  gitHubLink?: string | null;
}

/** yyyy-mm-dd in UTC, offset by N days (API compares due dates against the UTC date). */
export const utcDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

export const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn", "Archived"] as const;
export type Status = (typeof STATUSES)[number];
