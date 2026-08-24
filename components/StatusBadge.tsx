import React from "react";
import { TicketStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = (status || "open").toLowerCase();

  let colorClasses = "bg-slate-100 text-[#52606D] border border-slate-200";
  let label = "Open";

  if (s === "open") {
    colorClasses = "bg-blue-50 text-[#2563EB] border border-blue-200/80 font-medium";
    label = "Open";
  } else if (s === "in_progress") {
    colorClasses = "bg-teal-50 text-[#0D9488] border border-teal-200/80 font-medium";
    label = "In Progress";
  } else if (s === "resolved") {
    colorClasses = "bg-emerald-50 text-[#059669] border border-emerald-200/80 font-medium";
    label = "Resolved";
  } else if (s === "closed") {
    colorClasses = "bg-slate-100 text-[#52606D] border border-slate-200 font-medium";
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
