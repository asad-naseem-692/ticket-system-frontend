"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { getStoredUser } from "@/lib/auth";

export default function AllTicketsPage() {
  const user = getStoredUser();

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Ticket Overview</h1>
            <p className="text-sm text-slate-500">
              View, assign, and manage all support tickets across all queues.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-purple-600 text-xl font-bold">
              👑
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Administrator Console: {user?.name || "Admin"}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You have full administrative privileges. The comprehensive ticket table and assignment controls will populate in Slice 7.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
