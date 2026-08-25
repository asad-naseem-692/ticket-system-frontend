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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to download file.");
      }
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
    const lower = filename.toLowerCase();
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg")) {
      return <FileImage className="w-4 h-4 text-purple-600" />;
    }
    if (lower.endsWith(".pdf") || lower.endsWith(".txt") || lower.endsWith(".doc") || lower.endsWith(".docx")) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="border border-slate-200 shadow-card overflow-hidden">
      <CardHeader className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Paperclip className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Attachments & Documents</h2>
          <span className="text-xs bg-slate-200 text-gray-800 font-bold px-2 py-0.5 rounded-lg">
            {attachments.length}
          </span>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-6 space-y-4">
        {error && (
          <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* List of Attachments */}
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs font-medium">
            No files or screenshots attached to this ticket.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                    {getFileIcon(att.filename)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate" title={att.filename}>
                      {att.filename}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {formatFileSize(att.size_bytes)} • {new Date(att.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(att)}
                  disabled={downloadingId === att.id}
                  className="h-8 px-2.5 shrink-0"
                >
                  {downloadingId === att.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-gray-600" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-300 file:text-xs file:font-bold file:bg-white file:text-gray-700 hover:file:bg-slate-50 cursor-pointer"
          />

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={uploading}
            disabled={!selectedFile}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto shrink-0 font-bold"
          >
            <span>Upload</span>
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
