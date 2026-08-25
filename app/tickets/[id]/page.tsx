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
  Clock,
  User,
  AlertTriangle,
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
import { Ticket, TicketStatus, TicketPriority, User as UserType, AuditLog } from "@/lib/types";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const currentUser = getStoredUser();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [agents, setAgents] = useState<UserType[]>([]);
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
      const data = await apiClient<UserType[]>("/users/agents");
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
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Created</span>;
      case "assigned":
      case "reassigned":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{action}</span>;
      case "priority_override":
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Priority Override</span>;
      case "closed":
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Closed</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Status Update</span>;
    }
  };

  return (
    <AuthGuard allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
          {/* Top Breadcrumb & Actions */}
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
              leftIcon={<RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin text-[#0D9488]" : ""}`} />}
            >
              <span>Refresh</span>
            </Button>
          </div>

          {error && (
            <div className="p-4 text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-red-900">Error: </span>
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-emerald-900">Success: </span>
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            </div>
          )}

          {loading && !ticket ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 space-y-4 border border-slate-200">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-24 w-full" />
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="p-6 space-y-3 border border-slate-200">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              </div>
            </div>
          ) : ticket ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column (Primary Content: 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Ticket Overview Card */}
                <Card className="border border-slate-200 shadow-card">
                  <CardBody className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-gray-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            #{ticket.id}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <Tag className="w-3 h-3 text-gray-500" />
                            {ticket.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={ticket.priority} />
                          <StatusBadge status={ticket.status} />
                        </div>
                      </div>

                      <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        {ticket.title}
                      </h1>
                    </div>

                    {/* Full Description Section */}
                    <div className="space-y-2 pt-4 border-t border-slate-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Complaint / Issue Description
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-gray-900 text-sm whitespace-pre-wrap leading-relaxed">
                        {ticket.description}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 2. Attachments Section */}
                <AttachmentUploader
                  ticketId={ticket.id}
                  attachments={ticket.attachments || []}
                  onAttachmentUploaded={fetchTicket}
                />

                {/* 3. Conversation & Replies Thread */}
                <CommentBox
                  ticketId={ticket.id}
                  comments={ticket.comments || []}
                  onCommentAdded={fetchTicket}
                />

                {/* 4. Activity & Audit Trail */}
                <Card className="border border-slate-200 shadow-card">
                  <CardHeader className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-200 text-gray-700">
                        <History className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-bold text-gray-900">Activity & Audit Trail</h2>
                      <span className="text-xs bg-slate-200 text-gray-800 font-bold px-2 py-0.5 rounded-lg">
                        {auditLogs.length} events logged
                      </span>
                    </div>
                  </CardHeader>

                  <CardBody className="p-6">
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {auditLogs.length === 0 ? (
                        <div className="text-xs text-gray-500 font-medium py-2">No audit events recorded yet.</div>
                      ) : (
                        auditLogs.map((log) => (
                          <div key={log.id} className="relative text-xs space-y-1">
                            <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-[#0D9488] border-2 border-white ring-2 ring-teal-100"></div>
                            <div className="flex flex-wrap items-center gap-2">
                              {getActionBadge(log.action)}
                              <span className="font-bold text-gray-900">
                                {log.actor?.name || "System"}
                              </span>
                              <span className="text-gray-500 font-mono">
                                {new Date(log.timestamp).toLocaleString("en-US", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-gray-700 pl-1 leading-relaxed">{log.details}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Right Column (Sidebar: 1 col) */}
              <div className="space-y-6">
                {/* 1. SLA Countdown Card */}
                <Card className="border border-slate-200 shadow-card">
                  <CardHeader className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0D9488]" />
                      <h2 className="text-sm font-bold text-gray-900">Resolution SLA</h2>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5 space-y-4">
                    <div>
                      <SLACountdown
                        deadlineAt={ticket.deadline_at}
                        status={ticket.status}
                        slaBreached={ticket.sla_breached}
                      />
                    </div>

                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="font-medium">Deadline</span>
                        <span className="font-bold text-gray-900">
                          {new Date(ticket.deadline_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="font-medium">Created</span>
                        <span className="font-bold text-gray-900">
                          {new Date(ticket.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 2. Participants Card */}
                <Card className="border border-slate-200 shadow-card">
                  <CardHeader className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold text-gray-900">Participants</h2>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5 space-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Customer</span>
                      <p className="text-sm font-bold text-gray-900">{ticket.customer?.name || "Customer"}</p>
                      <p className="text-gray-500 font-mono">{ticket.customer?.email || "Unknown"}</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-100 pt-3">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Assigned Agent</span>
                      {ticket.assigned_agent ? (
                        <>
                          <p className="text-sm font-bold text-gray-900">{ticket.assigned_agent.name}</p>
                          <p className="text-gray-500 font-mono">{ticket.assigned_agent.email}</p>
                        </>
                      ) : (
                        <p className="text-xs italic text-gray-400 font-medium">Unassigned (Pending triage)</p>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* 3. Status Progression Card */}
                {canUpdateStatus && (
                  <Card className="border border-slate-200 shadow-card">
                    <CardHeader className="p-4 border-b border-slate-200 bg-slate-50">
                      <h2 className="text-sm font-bold text-gray-900">Status Workflow</h2>
                    </CardHeader>
                    <CardBody className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-medium">Current Status:</span>
                        <StatusBadge status={ticket.status} />
                      </div>

                      <div className="pt-2">
                        {ticket.status === "open" && (
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleStatusChange("in_progress")}
                            loading={updatingStatus}
                            leftIcon={<PlayCircle className="w-4 h-4" />}
                            className="w-full font-bold"
                          >
                            Start Working
                          </Button>
                        )}

                        {ticket.status === "in_progress" && (
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleStatusChange("resolved")}
                            loading={updatingStatus}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
                          >
                            Mark as Resolved
                          </Button>
                        )}

                        {ticket.status === "resolved" && (
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => handleStatusChange("closed")}
                            loading={updatingStatus}
                            leftIcon={<Archive className="w-4 h-4 text-gray-600" />}
                            className="w-full font-bold"
                          >
                            Close Ticket
                          </Button>
                        )}

                        {ticket.status === "closed" && (
                          <div className="text-center py-2 px-3 text-xs font-bold text-gray-600 bg-slate-100 rounded-xl border border-slate-200">
                            Ticket is Closed
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* 4. Admin Management Controls */}
                {isAdmin && (
                  <Card className="border border-purple-200 bg-purple-50/20 shadow-card">
                    <CardHeader className="p-4 border-b border-purple-100 bg-purple-50/50">
                      <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                        <Shield className="w-4 h-4 text-purple-700" />
                        <h2>Admin Management</h2>
                      </div>
                    </CardHeader>
                    <CardBody className="p-5 space-y-5">
                      {/* Priority Override Form */}
                      <form onSubmit={handlePriorityOverride} className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                          Override Priority
                        </label>
                        <div className="space-y-2">
                          <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value as TicketPriority)}
                            className="w-full h-10 px-3 text-xs font-semibold text-gray-800 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
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
                            className="w-full bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-bold"
                          >
                            Update Priority
                          </Button>
                        </div>
                      </form>

                      {/* Agent Assignment Form */}
                      <form onSubmit={handleAssignAgent} className="space-y-2 border-t border-purple-100 pt-4">
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                          {ticket.assigned_agent_id ? "Reassign Agent" : "Assign Agent"}
                        </label>
                        <div className="space-y-2">
                          <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="w-full h-10 px-3 text-xs font-semibold text-gray-800 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                          >
                            <option value="">-- Select Agent --</option>
                            {agents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>

                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={updatingAgent || !selectedAgentId || selectedAgentId === ticket.assigned_agent_id}
                            loading={updatingAgent}
                            className="w-full bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-bold"
                          >
                            {ticket.assigned_agent_id ? "Reassign Agent" : "Assign Agent"}
                          </Button>
                        </div>
                      </form>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
