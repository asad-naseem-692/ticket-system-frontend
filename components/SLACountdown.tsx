"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { TicketStatus } from "@/lib/types";

interface SLACountdownProps {
  deadlineAt: string;
  status: TicketStatus;
  slaBreached?: boolean;
  compact?: boolean;
}

export default function SLACountdown({
  deadlineAt,
  status,
  slaBreached = false,
  compact = false,
}: SLACountdownProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    const deadline = new Date(deadlineAt).getTime();
    return deadline - Date.now();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = new Date(deadlineAt).getTime();
      setTimeLeftMs(deadline - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineAt]);

  const isResolvedOrClosed = status === "resolved" || status === "closed";
  const isOverdue = slaBreached || timeLeftMs <= 0;
  const isAtRisk = !isOverdue && timeLeftMs > 0 && timeLeftMs <= 15 * 60 * 1000; // Under 15 mins

  const formatDuration = (ms: number) => {
    const absMs = Math.abs(ms);
    const totalSeconds = Math.floor(absMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  if (isResolvedOrClosed) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg ${
          slaBreached
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        } ${compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{slaBreached ? "Resolved (Breached SLA)" : "Resolved within SLA"}</span>
      </div>
    );
  }

  if (isOverdue) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 ${
          compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
        <span>SLA Breached (+{formatDuration(timeLeftMs)} overdue)</span>
      </div>
    );
  }

  if (isAtRisk) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 ${
          compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
        }`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>{formatDuration(timeLeftMs)} left (At Risk)</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 ${
        compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
      }`}
    >
      <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
      <span>{formatDuration(timeLeftMs)} remaining</span>
    </div>
  );
}
