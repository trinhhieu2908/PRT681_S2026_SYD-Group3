import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import type {
  JobApplicationEditableField,
  JobApplicationEditableValue,
  UpdateJobApplicationRequest,
} from "@/modules/job-application/model/requests";
import type {
  JobApplicationDetailResponse,
  JobApplicationResponse,
} from "@/modules/job-application/model/responses";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const useUpdateJobApplication = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: UpdateJobApplicationRequest) =>
      jobApplicationApi.update(id, request),
    retry: false,
    onSuccess: (application: JobApplicationResponse) => {
      queryClient.setQueryData<JobApplicationDetailResponse>(
        [...JOB_APPLICATION_QUERY_KEY, "detail", id],
        (current) =>
          current
            ? {
                ...current,
                ...application,
              }
            : undefined,
      );
      void queryClient.invalidateQueries({
        queryKey: JOB_APPLICATION_QUERY_KEY,
        predicate: (query) => !query.queryKey.includes("detail"),
      });
      toast.success("Application detail updated.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateField = <Field extends JobApplicationEditableField>(
    field: Field,
    value: JobApplicationEditableValue<Field>,
  ) => {
    const requestValue = value === null ? "" : value;

    return mutation.mutateAsync({
      [field]: requestValue,
    } as UpdateJobApplicationRequest);
  };

  return {
    updateJobApplication: mutation.mutateAsync,
    updateField,
    isUpdating: mutation.isPending,
  };
};
