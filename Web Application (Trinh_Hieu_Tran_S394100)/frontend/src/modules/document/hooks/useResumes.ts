import { useQuery } from "@tanstack/react-query";
import { documentApi } from "@/modules/document/services/api.service";

export const RESUME_QUERY_KEY = ["resumes"] as const;

export const useResumes = () => {
  return useQuery({
    queryKey: RESUME_QUERY_KEY,
    queryFn: documentApi.getResumes,
  });
};
