"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

export default function CreateTicketPlaceholder() {
  return (
    <AuthGuard allowedRoles={["customer"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Create Support Ticket</h1>
          <p className="text-sm text-slate-500">
            Submit a new support ticket (Full form implementation in Slice 4).
          </p>
        </main>
      </div>
    </AuthGuard>
  );
}
