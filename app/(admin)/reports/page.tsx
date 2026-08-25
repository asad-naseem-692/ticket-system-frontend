"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
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
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
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
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Executive Analytics & SLA Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                Reporting & Performance Dashboard
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Real-time volume metrics, agent resolution efficiency, and SLA compliance tracking.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchReportsData}
              disabled={loading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : "text-gray-600"}`} />}
            >
              <span>Refresh Metrics</span>
            </Button>
          </div>

          {error && (
            <div className="p-4 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-red-900">Error: </span>
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            </div>
          )}

          {loading && !summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-5 space-y-3 border border-slate-200">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </Card>
              ))}
            </div>
          ) : summary ? (
            <div className="space-y-8">
              {/* 1. Ticket Count Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border border-slate-200 shadow-card">
                  <CardBody className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Tickets</span>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">{summary.total_tickets}</div>
                    <div className="text-[11px] text-gray-500 font-medium">All-time complaints logged</div>
                  </CardBody>
                </Card>

                <Card className="border border-slate-200 shadow-card">
                  <CardBody className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-blue-700">
                      <span className="text-xs font-bold uppercase tracking-wider">Open Workload</span>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-extrabold text-blue-700">
                      {summary.by_status.open + summary.by_status.in_progress}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      {summary.by_status.open} open • {summary.by_status.in_progress} in progress
                    </div>
                  </CardBody>
                </Card>

                <Card className="border border-slate-200 shadow-card">
                  <CardBody className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-emerald-700">
                      <span className="text-xs font-bold uppercase tracking-wider">Resolved / Closed</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-700">
                      {summary.by_status.resolved + summary.by_status.closed}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      {summary.by_status.resolved} resolved • {summary.by_status.closed} closed
                    </div>
                  </CardBody>
                </Card>

                <Card className="border border-slate-200 shadow-card">
                  <CardBody className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-red-700">
                      <span className="text-xs font-bold uppercase tracking-wider">SLA Breached</span>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-extrabold text-red-700">{summary.total_sla_breached}</div>
                    <div className="text-[11px] text-gray-500 font-medium">Tickets missed deadline</div>
                  </CardBody>
                </Card>

                <Card className="border border-slate-200 shadow-card">
                  <CardBody className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-purple-700">
                      <span className="text-xs font-bold uppercase tracking-wider">Breach Rate</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-extrabold text-purple-700">{summary.breach_rate_percent}%</div>
                    <div className="text-[11px] text-gray-500 font-medium">Target compliance: &lt; 5%</div>
                  </CardBody>
                </Card>
              </div>

              {/* Priority Breakdown Bar */}
              <Card className="border border-slate-200 shadow-card">
                <CardBody className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Volume Distribution by Priority
                    </h2>
                    <span className="text-xs text-gray-500 font-medium">Auto-scored & Overridden</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1">
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical (2h SLA)</span>
                      <div className="text-2xl font-extrabold text-red-900">{summary.by_priority.critical}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
                      <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">High (8h SLA)</span>
                      <div className="text-2xl font-extrabold text-orange-900">{summary.by_priority.high}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium (24h SLA)</span>
                      <div className="text-2xl font-extrabold text-amber-900">{summary.by_priority.medium}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Low (72h SLA)</span>
                      <div className="text-2xl font-extrabold text-gray-900">{summary.by_priority.low}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 2. Agent Performance Report Table */}
              <Card className="border border-slate-200 shadow-card overflow-hidden">
                <CardHeader className="p-5 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Support Agent Performance</h2>
                      <p className="text-xs text-gray-600 font-medium">Workload distribution and resolution turnaround time per agent</p>
                    </div>
                  </div>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-gray-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Support Agent</th>
                        <th className="py-3 px-4">Assigned Workload</th>
                        <th className="py-3 px-4">Active Open</th>
                        <th className="py-3 px-4">Resolved Count</th>
                        <th className="py-3 px-4">Avg Resolution Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 text-xs font-medium">
                            No agent records found.
                          </td>
                        </tr>
                      ) : (
                        agents.map((agent) => (
                          <tr key={agent.agent_id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              <div>{agent.agent_name}</div>
                              <div className="text-xs font-mono text-gray-500 font-normal">{agent.agent_email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">
                              {agent.assigned_count}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-blue-700">
                              {agent.open_count}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">
                              {agent.resolved_count}
                            </td>
                            <td className="py-3.5 px-4">
                              {agent.avg_resolution_time_hours !== null ? (
                                <span className="inline-flex items-center gap-1 font-bold text-gray-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  ~{agent.avg_resolution_time_hours} hrs
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No resolutions yet</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 3. SLA Breach Report Table */}
              <Card className="border border-slate-200 shadow-card overflow-hidden">
                <CardHeader className="p-5 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">SLA Breach Audit Log</h2>
                      <p className="text-xs text-gray-600 font-medium">Tickets that exceeded guaranteed resolution deadlines</p>
                    </div>
                  </div>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-gray-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Assigned Agent</th>
                        <th className="py-3 px-4">Deadline</th>
                        <th className="py-3 px-4">Overdue By</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {breaches.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-emerald-700 font-bold text-xs bg-emerald-50/40">
                            🎉 Excellent! Zero SLA breaches recorded across the system.
                          </td>
                        </tr>
                      ) : (
                        breaches.map((b) => (
                          <tr key={b.ticket_id} className="hover:bg-red-50/30 transition">
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              <div className="font-bold text-gray-900">{b.title}</div>
                              <div className="text-xs text-gray-500 font-mono">#{b.ticket_id.slice(0, 8)} • {b.category}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <PriorityBadge priority={b.priority} />
                            </td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={b.status} />
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold text-gray-700">
                              {b.assigned_agent_name || "Unassigned"}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                              {new Date(b.deadline_at).toLocaleString("en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md text-xs border border-red-200">
                                +{b.hours_overdue} hrs
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/tickets/${b.ticket_id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline"
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
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
