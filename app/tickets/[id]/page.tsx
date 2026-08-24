"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  CheckCircle2,
  PlayCircle,
  Archive,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  Zap,
  History,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import CommentBox from "@/components/CommentBox";
import AttachmentUploader from "@/components/AttachmentUploader";
import SLACountdown from "@/components/SLACountdown";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { getStoredUser, getRedirectPathForRole } from "@/lib/auth";
import { Ticket, TicketStatus, TicketPriority, User, AuditLog } from "@/lib/types";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const currentUser = getStoredUser();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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
      const [ticketData, logsData] = await Promise.all([
        apiClient<Ticket>(`/tickets/${ticketId}`),
        apiClient<AuditLog[]>(`/tickets/${ticketId}/audit-log`).catch(() => []),
      ]);

      setTicket(ticketData);
      setAuditLogs(logsData);
      setSelectedPriority(ticketData.priority);
      if (ticketData.assigned_agent_id) {
        setSelectedAgentId(ticketData.assigned_agent_id);
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
      fetchTicket();
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
      fetchTicket();
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
      await apiClient<Ticket>(endpoint, {
        method,
        body: JSON.stringify({ agent_id: selectedAgentId }),
      });

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

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return <span className="bg-blue-50 text-[#2563EB] border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Created</span>;
      case "assigned":
      case "reassigned":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{action}</span>;
      case "priority_override":
        return <span className="bg-amber-50 text-[#D97706] border border-amber-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Priority Override</span>;
      case "closed":
        return <span className="bg-slate-100 text-[#52606D] border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Closed</span>;
      default:
        return <span className="bg-emerald-50 text-[#059669] border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Status Update</span>;
    }
  };

  return (
    <AuthGuard allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link href={backUrl}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                <span>Back to Dashboard</span>
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchTicket}
              disabled={loading}
              title="Refresh Ticket"
              leftIcon={<RefreshCw className={`w-4 h-4 text-[#52606D] ${loading ? "animate-spin text-[#0D9488]" : ""}`} />}
            >
              <span>Refresh</span>
            </Button>
          </div>

          {error && (
            <div className="p-4 text-xs text-red-800 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-red-900">Error: </span>
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-emerald-900">Success: </span>
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            </div>
          )}

          {loading && !ticket ? (
            <Card className="p-8 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ) : ticket ? (
            <div className="space-y-6">
              {/* Ticket Overview Card */}
              <Card className="shadow-card">
                <CardBody className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#9AA5B1]">
                        <span className="font-mono font-bold text-[#52606D] bg-slate-100 px-2 py-0.5 rounded-md">
                          #{ticket.id}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-medium text-[#52606D] bg-slate-100 px-2 py-0.5 rounded-md">
                          <Tag className="w-3 h-3 text-[#9AA5B1]" />
                          {ticket.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>

                    <h1 className="text-2xl font-bold text-[#1F2933] leading-tight tracking-tight">
                      {ticket.title}
                    </h1>
                  </div>

                  {/* SLA Resolution Box */}
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isOverdue
                        ? "bg-red-50/60 border-red-200/80"
                        : "bg-teal-50/40 border-teal-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SLACountdown
                        deadlineAt={ticket.deadline_at}
                        status={ticket.status}
                        slaBreached={ticket.sla_breached}
                      />
                      <span className="text-xs text-[#52606D] hidden sm:inline">
                        Deadline:{" "}
                        {new Date(ticket.deadline_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-[#52606D] bg-white/90 px-3 py-1.5 rounded-lg border border-[#E4E7EB] shrink-0 font-medium">
                      Created:{" "}
                      {new Date(ticket.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>

                  {/* Participants Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E4E7EB] text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E7EB] space-y-1">
                      <p className="font-semibold text-[#9AA5B1] uppercase tracking-wider">Customer / Requester</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {ticket.customer?.name || "Customer"}
                      </p>
                      <p className="text-[#52606D] font-mono">{ticket.customer?.email || "Unknown"}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E7EB] space-y-1">
                      <p className="font-semibold text-[#9AA5B1] uppercase tracking-wider">Assigned Support Agent</p>
                      {ticket.assigned_agent ? (
                        <>
                          <p className="text-sm font-semibold text-[#1F2933]">
                            {ticket.assigned_agent.name}
                          </p>
                          <p className="text-[#52606D] font-mono">{ticket.assigned_agent.email}</p>
                        </>
                      ) : (
                        <p className="text-sm italic text-[#9AA5B1]">Unassigned (Pending triage)</p>
                      )}
                    </div>
                  </div>

                  {/* Full Description Section */}
                  <div className="space-y-2 pt-4 border-t border-[#E4E7EB]">
                    <h3 className="text-xs font-semibold text-[#9AA5B1] uppercase tracking-wider">
                      Complaint / Issue Description
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-xl border border-[#E4E7EB] text-[#1F2933] text-sm whitespace-pre-wrap leading-relaxed">
                      {ticket.description}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Status Lifecycle Control Panel (FEAT-11) */}
              {canUpdateStatus && (
                <Card className="shadow-card">
                  <CardBody className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-[#1F2933]">
                          Status Lifecycle Transition
                        </h2>
                        <p className="text-xs text-[#52606D]">
                          Enforces forward-only lifecycle progression (Open → In Progress → Resolved → Closed).
                        </p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {ticket.status === "open" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange("in_progress")}
                          loading={updatingStatus}
                          leftIcon={<PlayCircle className="w-4 h-4" />}
                        >
                          Start Progress (Move to In Progress)
                        </Button>
                      )}

                      {ticket.status === "in_progress" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange("resolved")}
                          loading={updatingStatus}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          className="bg-[#059669] hover:bg-[#047857]"
                        >
                          Mark as Resolved
                        </Button>
                      )}

                      {ticket.status === "resolved" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange("closed")}
                          loading={updatingStatus}
                          leftIcon={<Archive className="w-4 h-4 text-[#52606D]" />}
                        >
                          Close Ticket
                        </Button>
                      )}

                      {ticket.status === "closed" && (
                        <div className="text-xs font-semibold text-[#52606D] bg-slate-100 px-3 py-2 rounded-lg border border-[#E4E7EB]">
                          This ticket is closed and has completed its lifecycle.
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Admin Management Panel (FEAT-14, FEAT-15, FEAT-16, FEAT-17) */}
              {isAdmin && (
                <Card className="bg-purple-50/30 border-purple-200/80 shadow-card">
                  <CardBody className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-purple-900 font-semibold text-base">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <h2>Administrator Controls & Assignment</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Priority Override Form (FEAT-14) */}
                      <form onSubmit={handlePriorityOverride} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2933] uppercase tracking-wider">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>Manual Priority Override</span>
                        </div>
                        <p className="text-xs text-[#52606D]">
                          Correct auto-scored priority. Recalculates SLA deadline immediately.
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value as TicketPriority)}
                            className="flex-1 h-9 px-3 text-xs text-[#1F2933] border border-[#E4E7EB] rounded-xl bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          >
                            <option value="critical">Critical (2h SLA)</option>
                            <option value="high">High (8h SLA)</option>
                            <option value="medium">Medium (24h SLA)</option>
                            <option value="low">Low (72h SLA)</option>
                          </select>

                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={updatingPriority || selectedPriority === ticket.priority}
                            loading={updatingPriority}
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          >
                            Update Priority
                          </Button>
                        </div>
                      </form>

                      {/* Agent Assignment Form (FEAT-15, FEAT-16) */}
                      <form onSubmit={handleAssignAgent} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2933] uppercase tracking-wider">
                          <UserCheck className="w-4 h-4 text-blue-500" />
                          <span>{ticket.assigned_agent_id ? "Reassign Support Agent" : "Assign to Support Agent"}</span>
                        </div>
                        <p className="text-xs text-[#52606D]">
                          Assign this ticket to an agent queue. Only agents can be selected.
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="flex-1 h-9 px-3 text-xs text-[#1F2933] border border-[#E4E7EB] rounded-xl bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          >
                            <option value="">-- Select Support Agent --</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name} ({agent.email})
                              </option>
                            ))}
                          </select>

                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={updatingAgent || !selectedAgentId || selectedAgentId === ticket.assigned_agent_id}
                            loading={updatingAgent}
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shrink-0"
                          >
                            {ticket.assigned_agent_id ? "Reassign" : "Assign"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Attachments Section (FEAT-20, FEAT-21) */}
              <AttachmentUploader
                ticketId={ticket.id}
                attachments={ticket.attachments || []}
                onAttachmentUploaded={fetchTicket}
              />

              {/* Conversation & Replies Thread (FEAT-18, FEAT-19) */}
              <CommentBox
                ticketId={ticket.id}
                comments={ticket.comments || []}
                onCommentAdded={fetchTicket}
              />

              {/* 4. Tamper-Evident Closure & Activity Audit Trail (FEAT-27) */}
              <Card className="shadow-card">
                <CardHeader className="p-4 sm:px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-[#52606D]">
                      <History className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-semibold text-[#1F2933]">Activity & Audit Trail</h2>
                    <span className="text-xs bg-slate-100 text-[#52606D] font-bold px-2 py-0.5 rounded-lg">
                      {auditLogs.length} events logged
                    </span>
                  </div>
                </CardHeader>

                <CardBody className="p-6">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E7EB]">
                    {auditLogs.length === 0 ? (
                      <div className="text-xs text-[#9AA5B1] py-2">No audit events recorded yet.</div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="relative text-xs space-y-1">
                          <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-[#0D9488] border-2 border-white ring-2 ring-teal-100"></div>
                          <div className="flex flex-wrap items-center gap-2">
                            {getActionBadge(log.action)}
                            <span className="font-semibold text-[#1F2933]">
                              {log.actor?.name || "System"}
                            </span>
                            <span className="text-[#9AA5B1] font-mono">
                              {new Date(log.timestamp).toLocaleString("en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-[#52606D] pl-1 leading-relaxed">{log.details}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
