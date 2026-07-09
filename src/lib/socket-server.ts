import { Server } from "socket.io";

/**
 * Triggers a real-time event via Socket.io to all clients in a specific room.
 * This helper uses the global Socket.io instance initialized in server.js.
 */
export const triggerSocketEvent = (roomId: string, eventName: string, data: any) => {
  const io = (global as any).io as Server | undefined;
  if (io) {
    io.to(`room-${roomId}`).emit(eventName, data);
    console.log(`[Socket] Broadcasted '${eventName}' to room-${roomId}`);
  } else {
    console.warn("[Socket] Socket.io server instance (global.io) is not initialized.");
  }
};
