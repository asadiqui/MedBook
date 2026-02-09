"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";
import { useNotificationsStore } from "@/lib/store/notifications";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const useNotificationsSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  const { fetchUnreadCount, incrementUnread, prependItem } = useNotificationsStore();


  useEffect(() => {
    if (!user) return;

    // Load unread count when user logs in
    fetchUnreadCount();

    const socket = io(`${SOCKET_URL}/notifications`, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ notifications socket connected:", socket.id);

      socket.emit("register_user", { userId: user.id }, (ack: any) => {
        console.log("🔧 notifications register ack:", ack);
      });
    });

    socket.on("notification", (payload: any) => {
      console.log(
        "🔔 LIVE notification:",
        payload?.title,
        "-",
        payload?.body,
        payload
      );

      toast.success(`${payload.title}: ${payload.body}`, {
        duration: 5000,
      });

	  prependItem(payload);

      // Update unread badge instantly
      incrementUnread(1);

      // Keep it synced with DB (optional but safer)
      fetchUnreadCount();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ notifications connect_error:", err?.message || err);
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchUnreadCount, incrementUnread]);
};
