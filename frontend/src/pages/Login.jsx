import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { login as loginUser } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthLayout from "../components/auth/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await loginUser({
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("token", res.data.token);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      const msg =
        error.response?.data?.detail || error.message || "Login failed.";
      setApiError(msg);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Log in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
            <AlertTriangle className="h-4 w-4 !text-red-600" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

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
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
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
              {...formRegister("password", { required: "Password is required" })}
              className="mt-1 bg-white/80 rounded-lg p-3 focus:ring-2 focus:ring-[var(--primary-end)] focus:border-[var(--primary-end)]"
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-gradient-primary h-11"
          disabled={isLoading || !isValid}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          Don’t have an account?{" "}
          <Link to={createPageUrl("Register")} className="font-medium text-[var(--primary-end)] hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}