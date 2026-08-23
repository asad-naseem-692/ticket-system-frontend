"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient, ApiErrorResponse } from "@/lib/api";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-2">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Forgot Password</h1>
          <p className="text-sm text-slate-500">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <span className="font-semibold text-red-800">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-emerald-900">Success:</span>
              <span>{successMsg}</span>
            </div>

            {devResetToken && (
              <div className="pt-2 border-t border-emerald-200">
                <p className="text-xs text-emerald-700 font-medium mb-2">
                  Development Mode: Reset token generated.
                </p>
                <Link
                  href={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                  className="inline-flex items-center justify-center w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition shadow-sm"
                >
                  Click Here to Set New Password →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-lg transition duration-150 shadow-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Sending reset link...</span>
              </>
            ) : (
              <span>Request Password Reset</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
