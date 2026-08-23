"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { getStoredUser } from "@/lib/auth";

export default function AssignedTicketsPage() {
  const user = getStoredUser();

  return (
    <AuthGuard allowedRoles={["agent", "admin"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assigned Tickets Queue</h1>
            <p className="text-sm text-slate-500">
              Manage and resolve support tickets assigned to you.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 text-xl font-bold">
              🛠️
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Agent Portal: {user?.name || "Support Agent"}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your queue is authenticated and role-restricted. Full assigned tickets list will populate in Slice 6.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
