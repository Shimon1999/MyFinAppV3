import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { register as registerUser } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: "onTouched" });

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      const msg =
        error.response?.data?.detail || error.message || "Registration failed.";
      setApiError(msg);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      // Requires 1 uppercase, 1 lowercase, 1 number, 1 special character
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        "Password must include uppercase, lowercase, number, and special character",
    },
  };

  return (
    <AuthLayout title="Create your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-200 text-red-700"
          >
            <AlertTriangle className="h-4 w-4 !text-red-600" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="name" className="text-[var(--text-secondary)]">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            {...formRegister("name", { required: "Name is required" })}
            className="mt-1 bg-white/80 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="email" className="text-[var(--text-secondary)]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            {...formRegister("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            className="mt-1 bg-white/80 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="text-[var(--text-secondary)]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...formRegister("password", passwordValidation)}
              className="mt-1 bg-white/80 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-[var(--text-secondary)]"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...formRegister("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="mt-1 bg-white/80 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full btn-gradient-primary h-11"
          disabled={isLoading || !isValid}
        >
          {isLoading ? "Registering..." : "Register"}
        </Button>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            to={createPageUrl("Login")}
            className="font-medium text-[var(--primary-end)] hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}