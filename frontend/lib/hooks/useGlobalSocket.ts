"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store/auth";
import { useChatStore } from "@/lib/store/chat";
import { usePathname } from "next/navigation";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

/**
 * Global socket hook that listens for new messages app-wide
 * and updates the unread count in the sidebar
 */
export const useGlobalSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { incrementUnreadCount, fetchUnreadCount } = useChatStore();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Keep pathnameRef in sync without re-creating the socket
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!user) return;

    // Fetch initial unread count once on mount
    fetchUnreadCount();

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[GlobalSocket] Connected, registering user:", user.id);
      socket.emit("register_user", { userId: user.id });
    });

    socket.on("disconnect", () => {
      console.log("[GlobalSocket] Disconnected");
    });

    // Listen for new messages globally to update unread count
    socket.on("new_message", (message: { receiverId: string; bookingId: string }) => {
      if (message.receiverId === user.id) {
        // Read current pathname via ref — no need to re-create the socket on navigation
        if (pathnameRef.current !== '/chat') {
          incrementUnreadCount(1);
        }
      }
    });

    // Listen for booking cancellation/rejection to refresh unread count
    socket.on("booking_cancelled", (data: { bookingId: string }) => {
      console.log("[GlobalSocket] Booking cancelled:", data.bookingId);
      fetchUnreadCount();
    });

    return () => {
      console.log("[GlobalSocket] Cleaning up socket");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, incrementUnreadCount, fetchUnreadCount]);
};