import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CoverLetterResponse } from "@/modules/document/model/responses";
import { documentApi } from "@/modules/document/services/api.service";
import { uploadSingleDocument } from "@/modules/document/services/upload.service";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { JobApplicationDetailResponse } from "@/modules/job-application/model/responses";

export const useUploadCoverLetter = (
  jobApplicationId: string,
  isReplacement: boolean,
) => {
  const queryClient = useQueryClient();
  const detailQueryKey = [
    ...JOB_APPLICATION_QUERY_KEY,
    "detail",
    jobApplicationId,
  ] as const;

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const upload = await uploadSingleDocument(file, "cover-letter");

      return documentApi.saveCoverLetter(jobApplicationId, {
        fileName: upload.fileName,
        objectKey: upload.objectKey,
        contentType: upload.contentType,
      });
    },
    retry: false,
    onSuccess: (coverLetter: CoverLetterResponse) => {
      queryClient.setQueryData<JobApplicationDetailResponse>(
        detailQueryKey,
        (current) => (current ? { ...current, coverLetter } : undefined),
      );
      void queryClient.invalidateQueries({ queryKey: detailQueryKey });
      toast.success(
        isReplacement ? "Cover letter changed." : "Cover letter uploaded.",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    uploadCoverLetter: mutation.mutate,
    isUploading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
