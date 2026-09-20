export const followUpQueryKeys = {
  all: ["follow-ups"] as const,
  byApplication: (jobApplicationId: string) =>
    ["follow-ups", "application", jobApplicationId] as const,
  pending: ["follow-ups", "pending"] as const,
};
