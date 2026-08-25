"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, RefreshCw, AlertCircle, Inbox, Clock, CheckCircle2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import TicketCard from "@/components/TicketCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { Ticket } from "@/lib/types";

export default function AssignedTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const fetchAssignedTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient<Ticket[]>("/tickets/assigned");
      setTickets(data);
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load assigned tickets.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedTickets();
  }, [fetchAssignedTickets]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <AuthGuard allowedRoles={["agent", "admin"]}>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Assigned Tickets Queue</h1>
              <p className="text-sm text-gray-600 font-medium">
                Manage, diagnose, and resolve customer support tickets assigned to you.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchAssignedTickets}
              disabled={loading}
              leftIcon={<RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin text-[#0D9488]" : ""}`} />}
              className="self-start sm:self-auto"
            >
              <span>Refresh Queue</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-slate-200 shadow-card">
              <CardBody className="p-4 space-y-1">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Assigned</span>
                  <Inbox className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900">{tickets.length}</div>
              </CardBody>
            </Card>

            <Card className="border border-slate-200 shadow-card">
              <CardBody className="p-4 space-y-1">
                <div className="flex items-center justify-between text-blue-700">
                  <span className="text-xs font-bold uppercase tracking-wider">Open</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-blue-700">{openCount}</div>
              </CardBody>
            </Card>

            <Card className="border border-slate-200 shadow-card">
              <CardBody className="p-4 space-y-1">
                <div className="flex items-center justify-between text-indigo-700">
                  <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-700">{inProgressCount}</div>
              </CardBody>
            </Card>

            <Card className="border border-slate-200 shadow-card">
              <CardBody className="p-4 space-y-1">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-700">{resolvedCount}</div>
              </CardBody>
            </Card>
          </div>

          <Card className="border border-slate-200 shadow-card">
            <CardBody className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search assigned tickets..."
                  className="w-full h-10 pl-10 pr-4 text-sm text-gray-900 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 bg-white placeholder-gray-400 hover:border-slate-400 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-bold">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 text-xs font-semibold text-gray-800 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 hover:border-slate-400 transition cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-10 px-3 text-xs font-semibold text-gray-800 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 hover:border-slate-400 transition cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {error && (
            <div className="p-4 text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 border border-slate-200">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <EmptyState
              title="Queue is clear"
              description={
                searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No assigned tickets match the active filters."
                  : "You have no tickets currently in your assigned workload queue."
              }
            />
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-600">
                Showing {filteredTickets.length} of {tickets.length} assigned tickets
              </div>
              {filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
