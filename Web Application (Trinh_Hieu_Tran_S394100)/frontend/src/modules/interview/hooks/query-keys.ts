export const interviewQueryKeys = {
  all: ["interviews"] as const,
  byApplication: (jobApplicationId: string) =>
    ["interviews", "application", jobApplicationId] as const,
  upcoming: (days: number) => ["interviews", "upcoming", days] as const,
};
