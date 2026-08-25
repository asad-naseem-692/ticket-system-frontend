"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, ShieldCheck, Zap } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { Ticket } from "@/lib/types";

const CATEGORIES = [
  "Technical Issue",
  "Billing",
  "Emergency",
  "General Inquiry",
  "Feedback",
];

export default function CreateTicketPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    category: "Technical Issue",
    description: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const getSlaHint = (category: string) => {
    switch (category) {
      case "Emergency":
        return {
          badge: "Critical (2h SLA)",
          color: "bg-red-50 text-red-700 border-red-200",
          text: "System outages, security breaches, and emergency blockers are routed with highest priority.",
        };
      case "Billing":
        return {
          badge: "High (8h SLA)",
          color: "bg-orange-50 text-orange-700 border-orange-200",
          text: "Payment failures, invoices, and subscription issues are resolved within 8 business hours.",
        };
      case "Technical Issue":
        return {
          badge: "Medium (24h SLA)",
          color: "bg-amber-50 text-amber-800 border-amber-200",
          text: "Application errors and functional bugs are investigated within 24 hours.",
        };
      default:
        return {
          badge: "Low (72h SLA)",
          color: "bg-slate-100 text-slate-700 border-slate-300",
          text: "General inquiries and feedback are reviewed within 72 hours.",
        };
    }
  };

  const currentSlaHint = getSlaHint(formData.category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { title, category, description } = formData;
    if (!title.trim()) {
      setError("Please provide a ticket title.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a detailed description of the issue.");
      return;
    }
    if (description.trim().length < 5) {
      setError("Description must be at least 5 characters long.");
      return;
    }

    setLoading(true);

    try {
      await apiClient<Ticket>("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          category: category,
          description: description.trim(),
        }),
      });

      setSuccess("Support ticket created successfully! Redirecting to your tickets...");
      setTimeout(() => {
        router.push("/my-tickets");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create ticket. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["customer", "admin"]}>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <Link
              href="/my-tickets"
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-gray-900 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm"
              aria-label="Back to tickets"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Support Ticket</h1>
              <p className="text-sm text-gray-600 font-medium">
                Submit a new complaint or issue. Our automated system will score its priority and calculate SLA deadlines.
              </p>
            </div>
          </div>

          <Card className="border border-slate-200 shadow-card">
            <CardBody className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="p-3.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Subject / Title *"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Cannot access billing statements or invoices"
                  required
                />

                <div className="space-y-2">
                  <Select
                    label="Category *"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>

                  {/* Dynamic SLA Expectation Hint */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border shrink-0 ${currentSlaHint.color}`}>
                      {currentSlaHint.badge}
                    </span>
                    <span className="text-gray-600 font-medium leading-relaxed">
                      {currentSlaHint.text}
                    </span>
                  </div>
                </div>

                <Textarea
                  label="Detailed Description *"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail, including error messages, steps to reproduce, and impacted systems..."
                  required
                />

                <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200">
                  <Link href="/my-tickets">
                    <Button variant="secondary" size="md" type="button">
                      Cancel
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                    className="font-bold"
                  >
                    {loading ? "Submitting ticket..." : "Submit Ticket"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
