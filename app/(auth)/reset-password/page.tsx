"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a password reset from the forgot password page.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token. Please request a new password reset link.");
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiClient("/auth/confirm-reset", {
        method: "POST",
        body: JSON.stringify({
          token: token,
          new_password: password,
        }),
      });

      // Redirect to login with success indicator
      router.push("/login?reset=true");
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may be invalid or expired.");
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
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Set new password</h1>
          <p className="text-sm text-gray-600 font-medium">
            Enter your new password below to update your account credentials.
          </p>
        </div>

        {error && (
          <div className="p-3.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                required
                disabled={!token}
                autoComplete="new-password"
                className="w-full h-10 pl-3.5 pr-10 text-sm text-gray-900 bg-white border border-slate-300 rounded-xl placeholder-gray-400 transition-all duration-150 ease-out focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed hover:border-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!token}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none disabled:opacity-50"
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                required
                disabled={!token}
                autoComplete="new-password"
                className="w-full h-10 pl-3.5 pr-10 text-sm text-gray-900 bg-white border border-slate-300 rounded-xl placeholder-gray-400 transition-all duration-150 ease-out focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed hover:border-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!token}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
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
            disabled={!token}
            className="w-full mt-2 font-bold"
          >
            {loading ? "Updating password..." : "Update Password"}
          </Button>
        </form>

        <div className="pt-3 text-center text-xs text-gray-600 border-t border-slate-200 font-medium">
          <Link
            href="/login"
            className="font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Suspense fallback={<div className="text-gray-600 text-sm font-medium">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
