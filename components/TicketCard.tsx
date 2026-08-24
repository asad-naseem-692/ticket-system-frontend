import React from "react";
import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
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
    <Card hoverable className="group">
      <CardBody className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9AA5B1]">
              <span className="font-mono font-semibold text-[#52606D]">
                #{ticket.id.slice(0, 8)}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-[#52606D] bg-slate-100 px-2 py-0.5 rounded-md">
                <Tag className="w-3 h-3 text-[#9AA5B1]" />
                {ticket.category}
              </span>
              <span>•</span>
              <span>Created {formattedCreated}</span>
            </div>

            <h3 className="text-base font-semibold text-[#1F2933] truncate group-hover:text-[#0D9488] transition-colors">
              {ticket.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-sm text-[#52606D] line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>

        <div className="pt-3 border-t border-[#E4E7EB] flex flex-wrap items-center justify-between gap-3 text-xs">
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
