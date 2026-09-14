import { z } from "zod";

export const JOB_APPLICATION_FIELD_LIMITS = {
  companyName: 150,
  roleTitle: 150,
  platform: 50,
  url: 2048,
} as const;

const requiredTextSchema = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} is required` })
    .max(maxLength, {
      message: `${label} cannot exceed ${maxLength} characters`,
    });

export const companyNameSchema = requiredTextSchema(
  "Company name",
  JOB_APPLICATION_FIELD_LIMITS.companyName,
);

export const roleTitleSchema = requiredTextSchema(
  "Role title",
  JOB_APPLICATION_FIELD_LIMITS.roleTitle,
);

export const platformSchema = requiredTextSchema(
  "Platform",
  JOB_APPLICATION_FIELD_LIMITS.platform,
);

export const optionalJobApplicationUrlSchema = z
  .string()
  .trim()
  .max(JOB_APPLICATION_FIELD_LIMITS.url, {
    message: `URL cannot exceed ${JOB_APPLICATION_FIELD_LIMITS.url} characters`,
  })
  .refine((value) => {
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

export const applicationDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid application date");

export const createJobApplicationSchema = z.object({
  companyName: companyNameSchema,
  roleTitle: roleTitleSchema,
  platform: platformSchema,
  jobLink: optionalJobApplicationUrlSchema,
  portfolioLink: optionalJobApplicationUrlSchema,
  gitHubLink: optionalJobApplicationUrlSchema,
});

export type CreateJobApplicationFormValues = z.infer<
  typeof createJobApplicationSchema
>;

const createValidator = (schema: z.ZodType<string>) => {
  return (value: string) => {
    const result = schema.safeParse(value);
    return result.success
      ? null
      : (result.error.issues[0]?.message ?? "Enter a valid value");
  };
};

export const validateCompanyName = createValidator(companyNameSchema);
export const validateRoleTitle = createValidator(roleTitleSchema);
export const validatePlatform = createValidator(platformSchema);
export const validateApplicationDate = createValidator(applicationDateSchema);
export const validateOptionalJobApplicationUrl = createValidator(
  optionalJobApplicationUrlSchema,
);
