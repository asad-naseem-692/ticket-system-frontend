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
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Admin</span>;
      case "agent":
        return <span className="bg-teal-50 text-[#0D9488] border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Support Agent</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Customer</span>;
    }
  };

  return (
    <Card className="border border-slate-200 shadow-card overflow-hidden">
      {/* Header */}
      <CardHeader className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0D9488] border border-teal-100">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Conversation & Replies</h2>
          <span className="text-xs bg-slate-200 text-gray-800 font-bold px-2 py-0.5 rounded-lg">
            {comments.length}
          </span>
        </div>
      </CardHeader>

      {/* Messages Thread */}
      <CardBody className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-medium text-xs">
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
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-slate-50 border-slate-200 text-gray-900"
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
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
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
                    <span className="text-[11px] text-gray-500 font-medium">
                      {new Date(comment.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed pl-9">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 space-y-3">
          {error && (
            <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isStaff && visibility === "internal"
                  ? "Write an internal staff note (visible ONLY to support agents & admins)..."
                  : "Type a reply to the customer..."
              }
              rows={3}
              className={`w-full p-3.5 text-sm text-gray-900 bg-white border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                isStaff && visibility === "internal"
                  ? "border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 bg-amber-50/20"
                  : "border-slate-300 focus:border-[#0D9488] focus:ring-[#0D9488]/20"
              }`}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              {isStaff ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      visibility === "public"
                        ? "bg-teal-50 text-[#0D9488] border-teal-200"
                        : "bg-white text-gray-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Public Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("internal")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 ${
                      visibility === "internal"
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-white text-gray-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Internal Staff Note</span>
                  </button>
                </div>
              ) : (
                <div></div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
                disabled={!content.trim()}
                rightIcon={<Send className="w-3.5 h-3.5" />}
                className={visibility === "internal" ? "bg-amber-700 hover:bg-amber-800" : ""}
              >
                <span>{visibility === "internal" ? "Post Internal Note" : "Send Reply"}</span>
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
