"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, getStoredUser, getRedirectPathForRole } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      router.replace(getRedirectPathForRole(user.role));
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl">
          CS
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Customer Support & SLA Automation
        </h1>
        <p className="text-sm text-slate-600">
          Fast, reliable ticket resolution with strict SLA tracking and role-based management.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/login"
            className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition shadow-sm"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition border border-slate-300"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
