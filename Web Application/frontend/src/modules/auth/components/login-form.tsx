import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useLogin } from "@/modules/auth/hooks/useLogin";
import { LoginRequest } from "@/modules/auth/model/requests";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";

// Zod schema for form validation
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" })
    .max(254, { message: "Email cannot exceed 254 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password cannot exceed 128 characters" }),
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
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            {...register("email")}
            className={`h-12 pl-11 ${
              errors.email
                ? "border-red-500"
                : "border-slate-200 bg-slate-50/80 focus-visible:bg-white"
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
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
            autoComplete="current-password"
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
          <p className="text-sm text-red-600">
            {loginError instanceof Error
              ? loginError.message
              : "Unable to sign in. Please try again."}
          </p>
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
