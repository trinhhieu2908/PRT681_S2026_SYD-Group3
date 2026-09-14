import { useQuery } from "@tanstack/react-query";
import type { DocumentPreviewKind } from "@/modules/document/model/document-preview";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

const DOCUMENT_PREVIEW_QUERY_KEY = [
  "job-application-document-preview",
] as const;

export const useDocumentPreview = (
  jobApplicationId?: string,
  documentKind?: DocumentPreviewKind,
) => {
  return useQuery({
    queryKey: [...DOCUMENT_PREVIEW_QUERY_KEY, jobApplicationId, documentKind],
    queryFn: async () => {
      const application = await jobApplicationApi.getById(jobApplicationId!);
      const document =
        documentKind === "resume"
          ? application.resume
          : application.coverLetter;

      if (!document) {
        throw new Error(
          documentKind === "resume"
            ? "This application does not have a resume to preview."
            : "This application does not have a cover letter to preview.",
        );
      }

      const presignUrl =
        document.presignUrl || document.presignedUrl || document.url;

      if (!presignUrl) {
        throw new Error(
          "The API did not return a presignUrl for this document.",
        );
      }

      return { ...document, presignUrl };
    },
    enabled: Boolean(jobApplicationId && documentKind),
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};
