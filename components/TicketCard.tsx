import React from "react";
import Link from "next/link";
import { ChevronRight, Tag, Clock } from "lucide-react";
import { Ticket } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import SLACountdown from "./SLACountdown";
import { Card, CardBody } from "./ui/Card";

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
    <Card hoverable className="group border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-150">
      <CardBody className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-gray-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                #{ticket.id.slice(0, 8)}
              </span>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <Tag className="w-3 h-3 text-gray-500" />
                {ticket.category}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 font-medium">{formattedCreated}</span>
            </div>

            <Link href={targetHref} className="block group-hover:text-[#0D9488] transition-colors">
              <h3 className="text-base font-bold text-gray-900 line-clamp-1 leading-snug">
                {ticket.title}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-normal">
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
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
