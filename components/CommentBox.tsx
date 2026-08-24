"use client";

import React, { useState } from "react";
import { MessageSquare, Lock, Send, AlertCircle, ShieldAlert, CheckCircle2, User as UserIcon } from "lucide-react";
import { Comment, CommentVisibility } from "@/lib/types";
import { apiClient, ApiErrorResponse } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

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
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">Admin</span>;
      case "agent":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">Support Agent</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">Customer</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Conversation & Replies</h2>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
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
                    ? "bg-amber-50/70 border-amber-200 text-amber-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isInternal ? "bg-amber-200 text-amber-900" : "bg-blue-100 text-blue-700"
                    }`}>
                      {comment.author?.name ? comment.author.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {comment.author?.name || "User"}
                      </span>
                      <span className="ml-2">{getRoleBadge(comment.author?.role)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInternal && (
                      <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        Internal Staff Note
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(comment.created_at).toLocaleString("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-slate-800 leading-relaxed whitespace-pre-wrap pl-9">
                  {comment.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Submission Box */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {error && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
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
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
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
            className="w-full p-3 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className={`inline-flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg shadow-sm text-white transition disabled:opacity-50 ${
              visibility === "internal"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Sending..." : visibility === "internal" ? "Post Internal Note" : "Send Public Reply"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
