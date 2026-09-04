import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useRegister } from "@/modules/auth/hooks/useRegister";
import { RegisterRequest } from "@/modules/auth/model/requests";

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" })
    .max(254, { message: "Email cannot exceed 254 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password cannot exceed 128 characters" })
    .regex(/\p{Lu}/u, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\p{Ll}/u, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/\p{Nd}/u, {
      message: "Password must contain at least one number",
    })
    .regex(/[\p{P}\p{S}]/u, {
      message: "Password must contain at least one special character",
    }),
});

interface RegisterFormProps {
  onRegistered: () => void;
}

const RegisterForm = ({ onRegistered }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register: registerUser,
    isLoading,
    error,
  } = useRegister({
    onSuccess: onRegistered,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((credentials) => registerUser(credentials))}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="block text-sm font-semibold text-slate-700"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="register-email"
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
          htmlFor="register-password"
          className="block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`h-12 pl-11 pr-11 ${
              errors.password
                ? "border-red-500"
                : "border-slate-200 bg-slate-50/80 focus-visible:bg-white"
            }`}
            placeholder="Create a password"
            disabled={isLoading}
            autoComplete="new-password"
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
        <p className="text-xs leading-5 text-slate-500">
          Use 8–128 characters with uppercase, lowercase, a number, and a
          special character.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Unable to create your account. Please try again."}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="h-12 w-full bg-primary-600 text-base shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 hover:shadow-primary-600/30"
        disabled={isLoading}
      >
        {isLoading ? (
          "Creating account..."
        ) : (
          <>
            Create account
            <ArrowRight size={18} />
          </>
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
