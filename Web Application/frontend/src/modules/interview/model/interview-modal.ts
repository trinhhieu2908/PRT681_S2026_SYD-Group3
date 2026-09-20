import type { InterviewResponse } from "@/modules/interview/model/responses";

export interface InterviewModalPayload {
  jobApplicationId: string;
  interview?: InterviewResponse;
}

export const isInterviewModalPayload = (
  value: unknown,
): value is InterviewModalPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<InterviewModalPayload>;
  return typeof payload.jobApplicationId === "string";
};
