import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/modules/auth/services/api.service";
import { useAuth } from "@/modules/auth/contexts/auth.context";
import { routes } from "@/routes/routes";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const {
    mutate: login,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      // Use auth context to handle login
      authLogin(response.accessToken, response.refreshToken);
      navigate(routes.homePath);
    },
  });

  return { login, isLoading, error };
};
