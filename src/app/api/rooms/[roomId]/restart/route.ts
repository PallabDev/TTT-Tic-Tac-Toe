import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/errors";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { roomId } = await context.params;
    const room = await prisma.room.findUnique({
      where: { roomId },
      include: {
        players: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    if (!room) {
      return errorResponse("Room not found", 404);
    }

    const isPlayer = room.players.some((p) => p.userId === user.userId);
    if (!isPlayer) {
      return errorResponse("You are not part of this room", 403);
    }

    if (room.players.length < 2) {
      return errorResponse("Need two players to replay", 400);
    }

    const requestingPlayer = room.players.find((p) => p.userId === user.userId);

    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        board: ["", "", "", "", "", "", "", "", ""],
        turn: requestingPlayer?.symbol || "X",
        status: "playing",
        winner: null,
      },
      include: {
        players: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    // Trigger Pusher event to reset state for both players in real-time
    try {
      const { pusherServer } = await import("@/lib/pusher-server");
      await pusherServer.trigger(`room-${roomId}`, "room-updated", { room: updatedRoom });
    } catch (err) {
      console.error("Pusher restart trigger error:", err);
    }

    return successResponse({ room: updatedRoom }, "Game restarted");
  } catch (error) {
    console.error("Restart game error:", error);
    return errorResponse("Internal server error", 500);
  }
}
