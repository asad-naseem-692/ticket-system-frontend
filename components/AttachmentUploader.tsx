"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Upload, Download, FileText, FileImage, File, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Attachment } from "@/lib/types";
import { getStoredToken } from "@/lib/auth";

interface AttachmentUploaderProps {
  ticketId: string;
  attachments: Attachment[];
  onAttachmentUploaded: () => void;
}

export default function AttachmentUploader({
  ticketId,
  attachments,
  onAttachmentUploaded,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size cannot exceed 10MB.");
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const token = getStoredToken();
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to upload attachment");
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccess("File uploaded successfully.");
      onAttachmentUploaded();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload file.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    setDownloadingId(attachment.id);
    const token = getStoredToken();

    try {
      const res = await fetch(`${API_BASE_URL}/attachments/${attachment.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to download attachment");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
      return <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    if (["pdf", "txt", "docx", "xlsx", "csv"].includes(ext || "")) {
      return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Attachments & Documents</h2>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            {attachments.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Attachment List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-xs">
            No files attached to this ticket.
          </div>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100/80 transition"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {getFileIcon(att.filename)}
                <div className="overflow-hidden">
                  <p className="font-medium text-slate-800 truncate" title={att.filename}>
                    {att.filename}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(att.size_bytes)} • Uploaded by {att.uploader?.name || "User"} on{" "}
                    {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownload(att)}
                disabled={downloadingId === att.id}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-slate-300 shadow-sm shrink-0 transition"
              >
                {downloadingId === att.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{downloadingId === att.id ? "Downloading..." : "Download"}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Upload Zone */}
      <form onSubmit={handleUpload} className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-xs rounded-lg shadow-sm transition shrink-0"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{uploading ? "Uploading..." : "Attach File"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
