import React from "react";
import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
import { Ticket } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import SLACountdown from "./SLACountdown";

interface TicketCardProps {
  ticket: Ticket;
  href?: string;
}

export default function TicketCard({ ticket, href }: TicketCardProps) {
  const createdDate = new Date(ticket.created_at);
  const formattedCreated = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const targetHref = href || `/tickets/${ticket.id}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition shadow-sm hover:shadow-md p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-mono font-semibold text-slate-700">
              #{ticket.id.slice(0, 8)}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3 text-slate-400" />
              {ticket.category}
            </span>
            <span>•</span>
            <span>Created {formattedCreated}</span>
          </div>

          <h3 className="text-base font-semibold text-slate-900 truncate">
            {ticket.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
        {ticket.description}
      </p>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <SLACountdown
            deadlineAt={ticket.deadline_at}
            status={ticket.status}
            slaBreached={ticket.sla_breached}
            compact={true}
          />
        </div>

        <Link
          href={targetHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
