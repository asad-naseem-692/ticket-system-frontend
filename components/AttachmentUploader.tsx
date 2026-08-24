"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Upload, Download, FileText, FileImage, File, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Attachment } from "@/lib/types";
import { getStoredToken } from "@/lib/auth";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Button } from "./ui/Button";

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
      return <FileImage className="w-4 h-4 text-[#0D9488] shrink-0" />;
    }
    if (["pdf", "txt", "docx", "xlsx", "csv"].includes(ext || "")) {
      return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    return <File className="w-4 h-4 text-[#9AA5B1] shrink-0" />;
  };

  return (
    <Card className="shadow-card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0D9488]">
            <Paperclip className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-[#1F2933]">Attachments & Documents</h2>
          <span className="text-xs bg-slate-100 text-[#52606D] font-bold px-2 py-0.5 rounded-lg">
            {attachments.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200/80 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Attachment List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-center py-4 text-[#9AA5B1] text-xs">
            No files attached to this ticket.
          </div>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#E4E7EB] text-xs hover:bg-slate-100/80 transition"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {getFileIcon(att.filename)}
                <div className="overflow-hidden">
                  <p className="font-medium text-[#1F2933] truncate" title={att.filename}>
                    {att.filename}
                  </p>
                  <p className="text-[11px] text-[#9AA5B1]">
                    {formatFileSize(att.size_bytes)} • Uploaded by {att.uploader?.name || "User"} on{" "}
                    {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(att)}
                disabled={downloadingId === att.id}
                leftIcon={downloadingId === att.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#0D9488]" />}
                className="shrink-0"
              >
                <span>{downloadingId === att.id ? "Downloading..." : "Download"}</span>
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Upload Zone */}
      <form onSubmit={handleUpload} className="pt-3 border-t border-[#E4E7EB] space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-xs text-[#52606D] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0D9488] hover:file:bg-teal-100 cursor-pointer"
          />

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={uploading}
            disabled={!selectedFile}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto shrink-0"
          >
            {uploading ? "Uploading..." : "Attach File"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
