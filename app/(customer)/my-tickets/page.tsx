"use client";

import React from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { getStoredUser } from "@/lib/auth";

export default function MyTicketsPage() {
  const user = getStoredUser();

  return (
    <AuthGuard allowedRoles={["customer"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Support Tickets</h1>
              <p className="text-sm text-slate-500">
                Track all complaints and questions you have submitted.
              </p>
            </div>
            <Link
              href="/create-ticket"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              + Create New Ticket
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 text-xl font-bold">
              🎫
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Welcome, {user?.name || "Customer"}!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your customer portal is ready. Full ticket listing will populate in Slice 5.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
