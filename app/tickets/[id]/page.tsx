"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Tag,
  CheckCircle2,
  PlayCircle,
  Archive,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  Zap,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { getStoredUser, getRedirectPathForRole } from "@/lib/auth";
import { Ticket, TicketStatus, TicketPriority, User } from "@/lib/types";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const currentUser = getStoredUser();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [updatingPriority, setUpdatingPriority] = useState<boolean>(false);
  const [updatingAgent, setUpdatingAgent] = useState<boolean>(false);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>("medium");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient<Ticket>(`/tickets/${ticketId}`);
      setTicket(data);
      setSelectedPriority(data.priority);
      if (data.assigned_agent_id) {
        setSelectedAgentId(data.assigned_agent_id);
      }
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load ticket details.");
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const fetchAgents = useCallback(async () => {
    if (currentUser?.role !== "admin") return;
    try {
      const data = await apiClient<User[]>("/users/agents");
      setAgents(data);
    } catch {
      // Non-blocking
    }
  }, [currentUser?.role]);

  useEffect(() => {
    fetchTicket();
    fetchAgents();
  }, [fetchTicket, fetchAgents]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await apiClient<Ticket>(`/tickets/${ticket.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      setTicket((prev) => (prev ? { ...prev, ...updated } : null));
      setSuccessMsg(`Ticket status updated to "${newStatus.replace("_", " ").toUpperCase()}" successfully.`);
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update ticket status.");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setUpdatingPriority(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await apiClient<Ticket>(`/tickets/${ticket.id}/priority`, {
        method: "PATCH",
        body: JSON.stringify({ priority: selectedPriority }),
      });

      setTicket((prev) => (prev ? { ...prev, ...updated } : null));
      setSuccessMsg(`Priority manually overridden to "${selectedPriority.toUpperCase()}". SLA deadline recalculated.`);
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to override priority.");
      }
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleAssignAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !selectedAgentId) return;
    setUpdatingAgent(true);
    setError(null);
    setSuccessMsg(null);

    const isReassign = !!ticket.assigned_agent_id;
    const endpoint = isReassign ? `/tickets/${ticket.id}/reassign` : `/tickets/${ticket.id}/assign`;
    const method = isReassign ? "PATCH" : "POST";

    try {
      const updated = await apiClient<Ticket>(endpoint, {
        method,
        body: JSON.stringify({ agent_id: selectedAgentId }),
      });

      // Refetch full detail to populate new assigned_agent object
      await fetchTicket();
      setSuccessMsg(isReassign ? "Ticket successfully reassigned to new agent." : "Ticket successfully assigned to agent.");
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to assign agent.");
      }
    } finally {
      setUpdatingAgent(false);
    }
  };

  const backUrl = currentUser ? getRedirectPathForRole(currentUser.role) : "/login";

  const isAssignedAgent = currentUser?.role === "agent" && ticket?.assigned_agent_id === currentUser.id;
  const isAdmin = currentUser?.role === "admin";
  const canUpdateStatus = isAssignedAgent || isAdmin;

  const deadlineDate = ticket ? new Date(ticket.deadline_at) : null;
  const now = new Date();
  const isOverdue =
    ticket &&
    (ticket.sla_breached ||
      (deadlineDate && deadlineDate < now && ticket.status !== "resolved" && ticket.status !== "closed"));

  return (
    <AuthGuard allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <button
              onClick={fetchTicket}
              disabled={loading}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
              title="Refresh Ticket"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-red-800">Error: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-emerald-900">Success: </span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {loading && !ticket ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-24 bg-slate-200 rounded w-full"></div>
            </div>
          ) : ticket ? (
            <div className="space-y-6">
              {/* Ticket Overview Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        #{ticket.id}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {ticket.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {ticket.title}
                  </h1>
                </div>

                {/* SLA Resolution Box */}
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isOverdue
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isOverdue ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {isOverdue ? "SLA Breached" : "SLA Resolution Deadline"}
                      </p>
                      <p className="text-xs opacity-90">
                        Must be resolved by:{" "}
                        {new Date(ticket.deadline_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                    Created:{" "}
                    {new Date(ticket.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                {/* Participants Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider">Customer / Requester</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {ticket.customer?.name || "Customer"}
                    </p>
                    <p className="text-slate-500 font-mono">{ticket.customer?.email || "Unknown"}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider">Assigned Support Agent</p>
                    {ticket.assigned_agent ? (
                      <>
                        <p className="text-sm font-semibold text-slate-900">
                          {ticket.assigned_agent.name}
                        </p>
                        <p className="text-slate-500 font-mono">{ticket.assigned_agent.email}</p>
                      </>
                    ) : (
                      <p className="text-sm italic text-slate-400">Unassigned (Pending triage)</p>
                    )}
                  </div>
                </div>

                {/* Full Description Section */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Complaint / Issue Description
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </div>
                </div>
              </div>

              {/* Status Lifecycle Control Panel (FEAT-11) */}
              {canUpdateStatus && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Status Lifecycle Transition
                      </h2>
                      <p className="text-xs text-slate-500">
                        Enforces forward-only lifecycle progression (Open → In Progress → Resolved → Closed).
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {ticket.status === "open" && (
                      <button
                        onClick={() => handleStatusChange("in_progress")}
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg shadow-sm transition"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Start Progress (Move to In Progress)</span>
                      </button>
                    )}

                    {ticket.status === "in_progress" && (
                      <button
                        onClick={() => handleStatusChange("resolved")}
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-sm rounded-lg shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Resolved</span>
                      </button>
                    )}

                    {ticket.status === "resolved" && (
                      <button
                        onClick={() => handleStatusChange("closed")}
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium text-sm rounded-lg shadow-sm transition"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Close Ticket</span>
                      </button>
                    )}

                    {ticket.status === "closed" && (
                      <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                        This ticket is closed and has completed its lifecycle.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Management Panel (FEAT-14, FEAT-15, FEAT-16, FEAT-17) */}
              {isAdmin && (
                <div className="bg-purple-50/50 rounded-xl border border-purple-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center gap-2 text-purple-900 font-semibold text-base">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h2>Administrator Controls & Assignment</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Priority Override Form (FEAT-14) */}
                    <form onSubmit={handlePriorityOverride} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Manual Priority Override</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Correct auto-scored priority. Recalculates SLA deadline immediately.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value as TicketPriority)}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="critical">Critical (2h SLA)</option>
                          <option value="high">High (8h SLA)</option>
                          <option value="medium">Medium (24h SLA)</option>
                          <option value="low">Low (72h SLA)</option>
                        </select>

                        <button
                          type="submit"
                          disabled={updatingPriority || selectedPriority === ticket.priority}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium text-xs rounded-lg shadow-sm transition"
                        >
                          {updatingPriority ? "Updating..." : "Update Priority"}
                        </button>
                      </div>
                    </form>

                    {/* Agent Assignment Form (FEAT-15, FEAT-16) */}
                    <form onSubmit={handleAssignAgent} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        <span>{ticket.assigned_agent_id ? "Reassign Support Agent" : "Assign to Support Agent"}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Assign this ticket to an agent queue. Only agents can be selected.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <select
                          value={selectedAgentId}
                          onChange={(e) => setSelectedAgentId(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">-- Select Support Agent --</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} ({agent.email})
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          disabled={updatingAgent || !selectedAgentId || selectedAgentId === ticket.assigned_agent_id}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium text-xs rounded-lg shadow-sm transition shrink-0"
                        >
                          {updatingAgent ? "Assigning..." : ticket.assigned_agent_id ? "Reassign" : "Assign"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
