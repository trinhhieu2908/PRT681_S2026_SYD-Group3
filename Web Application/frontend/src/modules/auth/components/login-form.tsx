import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useLogin } from "@/modules/auth/hooks/useLogin";
import { LoginRequest } from "@/modules/auth/model/requests";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";

// Zod schema for form validation
const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .refine(
      (username) => {
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(username);
      },
      {
        message: "Username can only contain letters, numbers, and underscores",
      },
    ),
  password: z.string().min(1, { message: "Password is required" }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error: loginError } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-semibold text-slate-700"
        >
          Username
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="username"
            type="text"
            {...register("username")}
            className={`h-12 pl-11 ${
              errors.username
                ? "border-red-500"
                : "border-slate-200 bg-slate-50/80 focus-visible:bg-white"
            }`}
            placeholder="Enter username"
            disabled={isLoading}
          />
        </div>
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`h-12 pl-11 pr-11 ${
              errors.password
                ? "border-red-500"
                : "border-slate-200 bg-slate-50/80 focus-visible:bg-white"
            }`}
            placeholder="Enter password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {loginError && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">{loginError.message}</p>
        </div>
      )}

      <Button
        type="submit"
        className="h-12 w-full bg-primary-600 text-base shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 hover:shadow-primary-600/30"
        disabled={isLoading}
      >
        {isLoading ? (
          "Signing in..."
        ) : (
          <>
            Sign in
            <ArrowRight size={18} />
          </>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
