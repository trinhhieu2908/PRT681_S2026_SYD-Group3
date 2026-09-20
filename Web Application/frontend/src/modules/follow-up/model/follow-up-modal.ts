import type { FollowUpResponse } from "@/modules/follow-up/model/responses";

export interface FollowUpModalPayload {
  jobApplicationId: string;
  followUp?: FollowUpResponse;
}

export const isFollowUpModalPayload = (
  value: unknown,
): value is FollowUpModalPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<FollowUpModalPayload>;
  return typeof payload.jobApplicationId === "string";
};
