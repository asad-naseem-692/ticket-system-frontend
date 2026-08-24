"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface RequestResetResponse {
  detail: string;
  reset_token?: string | null;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDevResetToken(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient<RequestResetResponse>("/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      setSuccessMsg(response.detail);
      if (response.reset_token) {
        setDevResetToken(response.reset_token);
      }
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Card className="max-w-md w-full animate-fadeIn shadow-card">
        <CardBody className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] font-bold text-lg mb-1 shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#1F2933] tracking-tight">Forgot password?</h1>
            <p className="text-sm text-[#52606D]">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {error && (
            <div className="p-3.5 text-xs text-red-800 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </div>

              {devResetToken && (
                <div className="pt-3 border-t border-emerald-200/60 space-y-2">
                  <p className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                    Development Mode: Reset Token Ready
                  </p>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                    className="inline-flex items-center justify-center w-full py-2 px-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium text-xs rounded-lg transition shadow-sm gap-1.5"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              {loading ? "Sending reset link..." : "Request Password Reset"}
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-[#52606D] border-t border-[#E4E7EB]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
