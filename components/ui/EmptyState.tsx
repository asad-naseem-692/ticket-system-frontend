import React from "react";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl border border-dashed border-slate-300 bg-white/80 flex flex-col items-center justify-center space-y-3.5 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D9488] border border-teal-100 flex items-center justify-center mb-1">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-600 font-medium leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
