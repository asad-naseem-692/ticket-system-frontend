"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser, clearAuthSession } from "@/lib/auth";
import { apiClient } from "@/lib/api";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getStoredUser();

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // Non-blocking logout call
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "agent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "customer":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 font-bold text-slate-900 text-lg">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm">
              CS
            </span>
            <span>SupportOps</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              {user.role === "customer" && (
                <>
                  <Link
                    href="/my-tickets"
                    className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${
                      pathname === "/my-tickets"
                        ? "bg-slate-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    My Tickets
                  </Link>
                  <Link
                    href="/create-ticket"
                    className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${
                      pathname === "/create-ticket"
                        ? "bg-slate-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    New Ticket
                  </Link>
                </>
              )}

              {user.role === "agent" && (
                <Link
                  href="/assigned-tickets"
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${
                    pathname === "/assigned-tickets"
                      ? "bg-slate-100 text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Assigned Tickets
                </Link>
              )}

              {user.role === "admin" && (
                <>
                  <Link
                    href="/all-tickets"
                    className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${
                      pathname === "/all-tickets"
                        ? "bg-slate-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All Tickets
                  </Link>
                  <Link
                    href="/reports"
                    className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${
                      pathname === "/reports"
                        ? "bg-slate-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Reports & SLA
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-800">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded border ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition duration-150"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
