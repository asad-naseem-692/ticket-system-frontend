"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

export default function ReportsPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports & SLA Analytics</h1>
            <p className="text-sm text-slate-500">
              System health, SLA performance metrics, and agent resolution velocity (Slice 14).
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
