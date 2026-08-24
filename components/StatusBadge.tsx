import React from "react";
import { TicketStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = (status || "open").toLowerCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let label = "Open";

  if (s === "open") {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium";
    label = "Open";
  } else if (s === "in_progress") {
    colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium";
    label = "In Progress";
  } else if (s === "resolved") {
    colorClasses = "bg-blue-50 text-blue-700 border-blue-200 font-medium";
    label = "Resolved";
  } else if (s === "closed") {
    colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
    label = "Closed";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border uppercase tracking-wider ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
