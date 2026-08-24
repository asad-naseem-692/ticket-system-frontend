"use client";

import React, { useState } from "react";
import { MessageSquare, Lock, Send, AlertCircle, User as UserIcon } from "lucide-react";
import { Comment, CommentVisibility } from "@/lib/types";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Button } from "./ui/Button";

interface CommentBoxProps {
  ticketId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export default function CommentBox({ ticketId, comments, onCommentAdded }: CommentBoxProps) {
  const currentUser = getStoredUser();
  const isStaff = currentUser?.role === "agent" || currentUser?.role === "admin";

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<CommentVisibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiClient(`/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content: content.trim(),
          visibility: isStaff ? visibility : "public",
        }),
      });

      setContent("");
      onCommentAdded();
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post message.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase">Admin</span>;
      case "agent":
        return <span className="bg-teal-50 text-[#0D9488] border border-teal-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase">Support Agent</span>;
      default:
        return <span className="bg-slate-50 text-[#52606D] border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase">Customer</span>;
    }
  };

  return (
    <Card className="shadow-card overflow-hidden">
      {/* Header */}
      <CardHeader className="p-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0D9488]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-[#1F2933]">Conversation & Replies</h2>
          <span className="text-xs bg-slate-100 text-[#52606D] font-bold px-2 py-0.5 rounded-lg">
            {comments.length}
          </span>
        </div>
      </CardHeader>

      {/* Messages Thread */}
      <CardBody className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[#9AA5B1] text-xs">
            No replies yet. Start the conversation below.
          </div>
        ) : (
          comments.map((comment) => {
            const isInternal = comment.visibility === "internal";
            return (
              <div
                key={comment.id}
                className={`rounded-xl p-4 transition text-sm space-y-2 border ${
                  isInternal
                    ? "bg-amber-50/60 border-amber-200/80 text-amber-950"
                    : "bg-slate-50 border-[#E4E7EB] text-[#1F2933]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isInternal ? "bg-amber-200 text-amber-900" : "bg-teal-100 text-[#0D9488]"
                    }`}>
                      {comment.author?.name ? comment.author.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1F2933] text-xs sm:text-sm">
                        {comment.author?.name || "User"}
                      </span>
                      <span className="ml-2">{getRoleBadge(comment.author?.role)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInternal && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3" />
                        Internal Staff Note
                      </span>
                    )}
                    <span className="text-xs text-[#9AA5B1]">
                      {new Date(comment.created_at).toLocaleString("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-[#1F2933] leading-relaxed whitespace-pre-wrap pl-9">
                  {comment.content}
                </div>
              </div>
            );
          })
        )}
      </CardBody>

      {/* Reply Submission Box */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-t border-[#E4E7EB] bg-slate-50/50 space-y-3">
        {error && (
          <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200/80 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {isStaff && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                visibility === "public"
                  ? "bg-[#0D9488] text-white shadow-sm"
                  : "bg-white text-[#52606D] border border-[#E4E7EB] hover:bg-slate-50"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Public Reply (Visible to Customer)</span>
            </button>

            <button
              type="button"
              onClick={() => setVisibility("internal")}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                visibility === "internal"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white text-[#52606D] border border-[#E4E7EB] hover:bg-slate-50"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Internal Staff Note (Private)</span>
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder={
              visibility === "internal"
                ? "Write a private note for staff members..."
                : "Type your reply to the customer / agent..."
            }
            className="w-full p-3.5 text-sm text-[#1F2933] rounded-xl border border-[#E4E7EB] bg-white focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 transition resize-y placeholder-[#9AA5B1]"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant={visibility === "internal" ? "secondary" : "primary"}
            size="sm"
            loading={submitting}
            disabled={!content.trim()}
            rightIcon={<Send className="w-3.5 h-3.5" />}
            className={visibility === "internal" ? "bg-amber-600 hover:bg-amber-700 text-white border-none" : ""}
          >
            {submitting
              ? "Sending..."
              : visibility === "internal"
              ? "Post Internal Note"
              : "Send Public Reply"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
