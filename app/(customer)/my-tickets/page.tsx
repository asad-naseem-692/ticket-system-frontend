"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import TicketCard from "@/components/TicketCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { Ticket } from "@/lib/types";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient<Ticket[]>("/tickets/mine");
      setTickets(data);
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load tickets. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filtered tickets
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

  // Metrics
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <AuthGuard allowedRoles={["customer", "admin"]}>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933] tracking-tight">My Support Tickets</h1>
              <p className="text-sm text-[#52606D]">
                Track status, priority scoring, and automated SLA resolution deadlines.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchTickets}
                disabled={loading}
                aria-label="Refresh ticket list"
                leftIcon={<RefreshCw className={`w-4 h-4 text-[#52606D] ${loading ? "animate-spin text-[#0D9488]" : ""}`} />}
              >
                <span>Refresh</span>
              </Button>

              <Link href="/create-ticket">
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  <span>Create Ticket</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardBody className="p-4">
                <p className="text-xs font-semibold text-[#9AA5B1] uppercase tracking-wider">Total Tickets</p>
                <p className="text-2xl font-bold text-[#1F2933] mt-1">{tickets.length}</p>
              </CardBody>
            </Card>
            <Card className="shadow-card">
              <CardBody className="p-4">
                <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">Open</p>
                <p className="text-2xl font-bold text-[#2563EB] mt-1">{openCount}</p>
              </CardBody>
            </Card>
            <Card className="shadow-card">
              <CardBody className="p-4">
                <p className="text-xs font-semibold text-[#0D9488] uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-[#0D9488] mt-1">{inProgressCount}</p>
              </CardBody>
            </Card>
            <Card className="shadow-card">
              <CardBody className="p-4">
                <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-bold text-[#059669] mt-1">{resolvedCount}</p>
              </CardBody>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <Card className="shadow-card">
            <CardBody className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA5B1]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, category, or ID..."
                  className="w-full h-10 pl-10 pr-4 text-sm text-[#1F2933] border border-[#E4E7EB] rounded-xl focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 bg-white placeholder-[#9AA5B1] transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-[#52606D]">
                  <Filter className="w-3.5 h-3.5 text-[#9AA5B1]" />
                  <span className="font-medium">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 text-xs text-[#1F2933] border border-[#E4E7EB] rounded-xl bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
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
                  className="h-9 px-3 text-xs text-[#1F2933] border border-[#E4E7EB] rounded-xl bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
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

          {/* Ticket Listing Content */}
          {error ? (
            <Card className="p-8 text-center space-y-3 bg-red-50/50 border-red-200">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm font-medium text-red-800">{error}</p>
              <Button variant="danger" size="sm" onClick={fetchTickets}>
                Retry
              </Button>
            </Card>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <EmptyState
              title={
                searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No tickets match your filters"
                  : "No tickets yet"
              }
              description={
                searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your search or filter options to find what you're looking for."
                  : "You haven't submitted any support requests yet. Create your first ticket to get started."
              }
              action={
                !searchTerm && statusFilter === "all" && priorityFilter === "all" ? (
                  <Link href="/create-ticket">
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Create Your First Ticket
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
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
