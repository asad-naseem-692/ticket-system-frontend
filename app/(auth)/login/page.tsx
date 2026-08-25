"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { saveAuthSession, getRedirectPathForRole } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setNotice("Account created successfully! Please sign in with your credentials.");
    } else if (searchParams.get("reset") === "true") {
      setNotice("Password has been reset successfully! Please sign in with your new password.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { email, password } = formData;
    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      // Save token and user details to localStorage
      saveAuthSession(response);

      // Check if there was an intended redirect destination
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.replace(redirectUrl);
      } else {
        router.replace(getRedirectPathForRole(response.user.role));
      }
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full animate-fadeIn border border-slate-200 shadow-card">
      <CardBody className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] font-bold text-lg mb-1 shadow-sm border border-teal-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-600 font-medium">
            Sign in to access your tickets and dashboard.
          </p>
        </div>

        {notice && (
          <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{notice}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-10 pl-3.5 pr-10 text-sm text-gray-900 bg-white border border-slate-300 rounded-xl placeholder-gray-400 transition-all duration-150 ease-out focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 hover:border-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-2 font-bold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="pt-3 text-center text-xs text-gray-600 border-t border-slate-200 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline"
          >
            Create account
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Suspense fallback={<div className="text-gray-600 text-sm font-medium">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
