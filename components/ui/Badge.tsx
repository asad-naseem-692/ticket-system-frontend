import React from "react";
import { TicketPriority, TicketStatus } from "@/lib/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "priority" | "status" | "custom";
  priority?: TicketPriority;
  status?: TicketStatus;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "custom",
  priority,
  status,
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-semibold rounded-md",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg",
  };

  const getPriorityClasses = (p?: TicketPriority) => {
    switch (p) {
      case "critical":
        return "bg-red-50 text-[#DC2626] border border-red-200/80";
      case "high":
        return "bg-orange-50 text-[#F97316] border border-orange-200/80";
      case "medium":
        return "bg-amber-50 text-[#D97706] border border-amber-200/80";
      case "low":
      default:
        return "bg-slate-50 text-[#64748B] border border-slate-200";
    }
  };

  const getStatusClasses = (s?: TicketStatus) => {
    switch (s) {
      case "open":
        return "bg-blue-50 text-[#2563EB] border border-blue-200/80";
      case "in_progress":
        return "bg-teal-50 text-[#0D9488] border border-teal-200/80";
      case "resolved":
        return "bg-emerald-50 text-[#059669] border border-emerald-200/80";
      case "closed":
      default:
        return "bg-slate-100 text-[#52606D] border border-slate-200";
    }
  };

  let colorClasses = "bg-slate-50 text-[#52606D] border border-[#E4E7EB]";
  if (variant === "priority" && priority) {
    colorClasses = getPriorityClasses(priority);
  } else if (variant === "status" && status) {
    colorClasses = getStatusClasses(status);
  }

  const formatLabel = () => {
    if (children) return children;
    if (variant === "priority" && priority) {
      return priority.toUpperCase();
    }
    if (variant === "status" && status) {
      return status.replace("_", " ").toUpperCase();
    }
    return "";
  };

  return (
    <span
      className={`inline-flex items-center tracking-wide uppercase transition-colors duration-150 ${sizeClasses[size]} ${colorClasses} ${className}`}
      {...props}
    >
      {formatLabel()}
    </span>
  );
}
