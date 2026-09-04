import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/services/api.service";

interface UseRegisterOptions {
  onSuccess?: () => void;
}

export const useRegister = ({ onSuccess }: UseRegisterOptions = {}) => {
  const {
    mutate: register,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created. Please sign in.");
      onSuccess?.();
    },
  });

  return { register, isLoading, error };
};
