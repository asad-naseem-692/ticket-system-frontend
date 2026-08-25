import React from "react";
import { TicketStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = (status || "open").toLowerCase();

  let colorClasses = "bg-slate-100 text-slate-700 border border-slate-300 font-bold";
  let label = "Open";

  if (s === "open") {
    colorClasses = "bg-blue-50 text-blue-700 border border-blue-200 font-bold";
    label = "Open";
  } else if (s === "in_progress") {
    colorClasses = "bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold";
    label = "In Progress";
  } else if (s === "resolved") {
    colorClasses = "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold";
    label = "Resolved";
  } else if (s === "closed") {
    colorClasses = "bg-slate-100 text-slate-700 border border-slate-300 font-bold";
    label = "Closed";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs uppercase tracking-wider transition-colors duration-150 ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
