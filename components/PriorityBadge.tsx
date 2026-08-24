import React from "react";
import { TicketPriority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: TicketPriority | string;
  className?: string;
}

export default function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const p = (priority || "medium").toLowerCase();

  let colorClasses = "bg-slate-50 text-[#64748B] border border-slate-200";
  let label = "Low";

  if (p === "critical") {
    colorClasses = "bg-red-50 text-[#DC2626] border border-red-200/80 font-semibold";
    label = "Critical";
  } else if (p === "high") {
    colorClasses = "bg-orange-50 text-[#F97316] border border-orange-200/80 font-medium";
    label = "High";
  } else if (p === "medium") {
    colorClasses = "bg-amber-50 text-[#D97706] border border-amber-200/80 font-medium";
    label = "Medium";
  } else {
    colorClasses = "bg-slate-50 text-[#64748B] border border-slate-200 font-medium";
    label = "Low";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs uppercase tracking-wider transition-colors duration-150 ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
