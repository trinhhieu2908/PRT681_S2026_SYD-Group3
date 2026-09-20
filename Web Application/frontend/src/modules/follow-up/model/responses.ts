export interface FollowUpResponse {
  id: string;
  jobApplicationId: string;
  title: string;
  dueDate: string;
  notes: string | null;
  isCompleted: boolean;
  completedAtUtc: string | null;
  isOverdue: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface PendingFollowUpResponse {
  id: string;
  jobApplicationId: string;
  companyName: string;
  roleTitle: string;
  title: string;
  dueDate: string;
  notes: string | null;
  isOverdue: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export type FollowUpCardData = FollowUpResponse | PendingFollowUpResponse;
