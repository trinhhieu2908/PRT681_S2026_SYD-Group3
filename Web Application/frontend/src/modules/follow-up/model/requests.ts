export interface CreateFollowUpRequest {
  title: string;
  dueDate: string;
  notes: string | null;
}

export interface UpdateFollowUpRequest {
  title?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateFollowUpCompletionRequest {
  isCompleted: boolean;
}
