import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns the singleton Socket.io client instance.
 * Initializes it on the first call (browser-only).
 */
export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;

  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
