import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RESUME_QUERY_KEY } from "@/modules/document/hooks/useResumes";
import { ResumeResponse } from "@/modules/document/model/responses";
import { documentApi } from "@/modules/document/services/api.service";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { JobApplicationDetailResponse } from "@/modules/job-application/model/responses";

export const useAttachResume = (jobApplicationId: string) => {
  const queryClient = useQueryClient();
  const detailQueryKey = [
    ...JOB_APPLICATION_QUERY_KEY,
    "detail",
    jobApplicationId,
  ] as const;

  const mutation = useMutation({
    mutationFn: (resumeId: string) =>
      documentApi.attachResume(jobApplicationId, { resumeId }),
    retry: false,
    onSuccess: (resume: ResumeResponse) => {
      queryClient.setQueryData<JobApplicationDetailResponse>(
        detailQueryKey,
        (current) => (current ? { ...current, resume } : undefined),
      );
      void queryClient.invalidateQueries({ queryKey: detailQueryKey });
      void queryClient.invalidateQueries({ queryKey: RESUME_QUERY_KEY });
      toast.success(`${resume.fileName} selected for this application.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    attachResume: mutation.mutate,
    isAttaching: mutation.isPending,
    pendingResumeId: mutation.variables,
    error: mutation.error,
    reset: mutation.reset,
  };
};
