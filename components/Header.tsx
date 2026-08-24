"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, AlertTriangle, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { getStoredUser, clearAuthSession } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { Notification } from "@/lib/types";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getStoredUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiClient<Notification[]>("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // Non-blocking
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient("/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Non-blocking
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await apiClient(`/notifications/${notif.id}/read`, { method: "PATCH" });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Non-blocking
      }
    }
    setIsOpen(false);
    if (notif.ticket_id) {
      router.push(`/tickets/${notif.ticket_id}`);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // Non-blocking logout call
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "agent":
        return "bg-teal-50 text-[#0D9488] border-teal-200";
      case "customer":
      default:
        return "bg-slate-50 text-[#52606D] border-[#E4E7EB]";
    }
  };

  const getNotifIcon = (type: string) => {
    if (type === "sla_breach") {
      return <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />;
    }
    if (type === "sla_warning") {
      return <AlertCircle className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />;
    }
    return <Clock className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />;
  };

  return (
    <header className="bg-white border-b border-[#E4E7EB] sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 font-bold text-[#1F2933] text-lg tracking-tight">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0D9488] text-white text-sm font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>SupportOps</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {user.role === "customer" && (
                <>
                  <Link
                    href="/my-tickets"
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                      pathname === "/my-tickets"
                        ? "bg-teal-50 text-[#0D9488] font-semibold"
                        : "text-[#52606D] hover:text-[#1F2933] hover:bg-slate-50"
                    }`}
                  >
                    My Tickets
                  </Link>
                  <Link
                    href="/create-ticket"
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                      pathname === "/create-ticket"
                        ? "bg-teal-50 text-[#0D9488] font-semibold"
                        : "text-[#52606D] hover:text-[#1F2933] hover:bg-slate-50"
                    }`}
                  >
                    New Ticket
                  </Link>
                </>
              )}

              {user.role === "agent" && (
                <Link
                  href="/assigned-tickets"
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                    pathname === "/assigned-tickets"
                      ? "bg-teal-50 text-[#0D9488] font-semibold"
                      : "text-[#52606D] hover:text-[#1F2933] hover:bg-slate-50"
                  }`}
                >
                  Assigned Tickets
                </Link>
              )}

              {user.role === "admin" && (
                <>
                  <Link
                    href="/all-tickets"
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                      pathname === "/all-tickets"
                        ? "bg-teal-50 text-[#0D9488] font-semibold"
                        : "text-[#52606D] hover:text-[#1F2933] hover:bg-slate-50"
                    }`}
                  >
                    All Tickets
                  </Link>
                  <Link
                    href="/reports"
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                      pathname === "/reports"
                        ? "bg-teal-50 text-[#0D9488] font-semibold"
                        : "text-[#52606D] hover:text-[#1F2933] hover:bg-slate-50"
                    }`}
                  >
                    Reports & SLA
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {user ? (
          <div className="flex items-center space-x-3">
            {/* Notification Bell Dropdown (FEAT-23) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-[#52606D] hover:text-[#1F2933] hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4E7EB] rounded-xl shadow-dropdown z-50 overflow-hidden animate-fadeIn">
                  <div className="p-3.5 bg-slate-50/80 border-b border-[#E4E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1F2933]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-50 text-[#DC2626] border border-red-200/80 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#0D9488] hover:text-[#0F766E] font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E7EB]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#9AA5B1]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition text-xs ${
                            !notif.read ? "bg-teal-50/30" : ""
                          }`}
                        >
                          {getNotifIcon(notif.type)}
                          <div className="flex-1 space-y-1">
                            <p className={`text-[#1F2933] leading-snug ${!notif.read ? "font-semibold" : ""}`}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-[#9AA5B1]">
                              {new Date(notif.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-[#0D9488] shrink-0 mt-1.5"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-[#1F2933] leading-tight">{user.name}</div>
              <div className="text-xs text-[#9AA5B1] font-mono">{user.email}</div>
            </div>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-lg border ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 text-xs font-medium text-[#52606D] hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg border border-[#E4E7EB] transition duration-150"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#52606D] hover:text-[#1F2933] px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white px-3.5 py-1.5 rounded-lg shadow-sm transition active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
