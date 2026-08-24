"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { TicketPriority } from "@/lib/types";

interface TicketSummary {
  total_tickets: number;
  by_status: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  by_priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  total_sla_breached: number;
  breach_rate_percent: number;
}

interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  agent_email: string;
  assigned_count: number;
  open_count: number;
  resolved_count: number;
  avg_resolution_time_hours: number | null;
}

interface SLABreach {
  ticket_id: string;
  title: string;
  priority: TicketPriority;
  category: string;
  status: string;
  deadline_at: string;
  created_at: string;
  hours_overdue: number;
  assigned_agent_name?: string;
}

export default function ReportsDashboardPage() {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, agentData, breachData] = await Promise.all([
        apiClient<TicketSummary>("/reports/summary"),
        apiClient<AgentPerformance[]>("/reports/agent-performance"),
        apiClient<SLABreach[]>("/reports/sla-breaches"),
      ]);

      setSummary(summaryData);
      setAgents(agentData);
      setBreaches(breachData);
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load reports and analytics.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Executive Analytics & SLA Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Reporting & Performance Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time volume metrics, agent resolution efficiency, and SLA compliance tracking.
              </p>
            </div>

            <button
              onClick={fetchReportsData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
              <span>Refresh Metrics</span>
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

          {loading && !summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          ) : summary ? (
            <div className="space-y-8">
              {/* 1. Ticket Count Summary Cards (FEAT-24) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{summary.total_tickets}</div>
                  <div className="text-[11px] text-slate-400">All-time complaints logged</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-blue-600">
                    <span className="text-xs font-semibold uppercase tracking-wider">Open Workload</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-extrabold text-blue-600">
                    {summary.by_status.open + summary.by_status.in_progress}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {summary.by_status.open} open • {summary.by_status.in_progress} in progress
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-xs font-semibold uppercase tracking-wider">Resolved / Closed</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600">
                    {summary.by_status.resolved + summary.by_status.closed}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {summary.by_status.resolved} resolved • {summary.by_status.closed} closed
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-red-600">
                    <span className="text-xs font-semibold uppercase tracking-wider">SLA Breached</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-extrabold text-red-600">{summary.total_sla_breached}</div>
                  <div className="text-[11px] text-slate-400">Tickets missed deadline</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-purple-600">
                    <span className="text-xs font-semibold uppercase tracking-wider">Breach Rate</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-extrabold text-purple-600">{summary.breach_rate_percent}%</div>
                  <div className="text-[11px] text-slate-400">Target compliance: &lt; 5%</div>
                </div>
              </div>

              {/* Priority Breakdown Bar */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Volume Distribution by Priority
                  </h2>
                  <span className="text-xs text-slate-400">Auto-scored & Overridden</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-1">
                    <span className="text-xs font-semibold text-red-800 uppercase">Critical (2h SLA)</span>
                    <div className="text-2xl font-bold text-red-900">{summary.by_priority.critical}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-xs font-semibold text-amber-800 uppercase">High (8h SLA)</span>
                    <div className="text-2xl font-bold text-amber-900">{summary.by_priority.high}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <span className="text-xs font-semibold text-blue-800 uppercase">Medium (24h SLA)</span>
                    <div className="text-2xl font-bold text-blue-900">{summary.by_priority.medium}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-semibold text-slate-700 uppercase">Low (72h SLA)</span>
                    <div className="text-2xl font-bold text-slate-900">{summary.by_priority.low}</div>
                  </div>
                </div>
              </div>

              {/* 2. Agent Performance Report Table (FEAT-25) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">Agent Performance Leaderboard</h2>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {agents.length} active agents
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Support Agent</th>
                        <th className="py-3 px-4">Assigned Workload</th>
                        <th className="py-3 px-4">Open Tickets</th>
                        <th className="py-3 px-4">Resolved Tickets</th>
                        <th className="py-3 px-4">Avg Resolution Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            No agent records found.
                          </td>
                        </tr>
                      ) : (
                        agents.map((agent) => (
                          <tr key={agent.agent_id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <div>{agent.agent_name}</div>
                              <div className="text-xs font-mono text-slate-400">{agent.agent_email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {agent.assigned_count}
                            </td>
                            <td className="py-3.5 px-4 text-blue-600 font-semibold">
                              {agent.open_count}
                            </td>
                            <td className="py-3.5 px-4 text-emerald-600 font-semibold">
                              {agent.resolved_count}
                            </td>
                            <td className="py-3.5 px-4">
                              {agent.avg_resolution_time_hours !== null ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  ~{agent.avg_resolution_time_hours} hrs
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No resolutions yet</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. SLA Breach Report Table (FEAT-26) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h2 className="text-base font-bold text-slate-900">SLA Breach Audit Log</h2>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                    {breaches.length} breached
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Assigned Agent</th>
                        <th className="py-3 px-4">Deadline</th>
                        <th className="py-3 px-4">Overdue Duration</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {breaches.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                            🎉 Excellent! Zero SLA breaches recorded across the system.
                          </td>
                        </tr>
                      ) : (
                        breaches.map((b) => (
                          <tr key={b.ticket_id} className="hover:bg-red-50/30 transition">
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <div className="font-semibold text-slate-900">{b.title}</div>
                              <div className="text-xs text-slate-400 font-mono">#{b.ticket_id.slice(0, 8)} • {b.category}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <PriorityBadge priority={b.priority} />
                            </td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={b.status as any} />
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                              {b.assigned_agent_name || "Unassigned"}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500">
                              {new Date(b.deadline_at).toLocaleString("en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">
                                +{b.hours_overdue} hrs overdue
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/tickets/${b.ticket_id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
