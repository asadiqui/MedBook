"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { resolveAvatarUrl } from "@/lib/utils/avatar";
import { useNotificationsStore } from "@/lib/store/notifications";

interface TopHeaderProps {
  title: string;
}

export function TopHeader({ title }: TopHeaderProps) {
  const { user } = useAuthStore();

  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const items = useNotificationsStore((s) => s.items);
  const fetchList = useNotificationsStore((s) => s.fetchList);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const profileHref =
    user?.role === "DOCTOR"
      ? "/profile/doctor"
      : user?.role === "PATIENT"
      ? "/profile/patient"
      : "/admin/dashboard";

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // When opening dropdown, load list + unread count
  useEffect(() => {
    if (!open) return;
    fetchList();
    fetchUnreadCount();
  }, [open, fetchList, fetchUnreadCount]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between fixed top-0 left-64 right-0 z-10">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications dropdown */}
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-96 rounded-xl border bg-white shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="font-semibold text-gray-900">Notifications</p>
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-96 overflow-auto">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-500">
                    No notifications yet.
                  </div>
                ) : (
                  items.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                        n.isRead ? "bg-white" : "bg-blue-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-600">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <Link
          href={profileHref}
          className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-gray-50"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>

          {resolveAvatarUrl(user?.avatar) ? (
            <img
              src={resolveAvatarUrl(user?.avatar)}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                console.error("Failed to load avatar:", user?.avatar);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
