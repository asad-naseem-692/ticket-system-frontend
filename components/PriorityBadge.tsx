import React from "react";
import { TicketPriority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: TicketPriority | string;
  className?: string;
}

export default function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const p = (priority || "medium").toLowerCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let label = "Low";

  if (p === "critical") {
    colorClasses = "bg-red-50 text-red-700 border-red-200 font-semibold";
    label = "Critical";
  } else if (p === "high") {
    colorClasses = "bg-orange-50 text-orange-700 border-orange-200 font-medium";
    label = "High";
  } else if (p === "medium") {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200 font-medium";
    label = "Medium";
  } else {
    colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
    label = "Low";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border uppercase tracking-wider ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
