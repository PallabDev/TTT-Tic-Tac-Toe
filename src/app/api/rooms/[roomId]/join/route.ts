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

    const alreadyPlayer = room.players.some((p) => p.userId === user.userId);
    if (alreadyPlayer) {
      return successResponse({ room }, "Already in room");
    }

    if (room.players.length >= 2) {
      return errorResponse("Room is full", 409);
    }

    await prisma.roomPlayer.create({
      data: { userId: user.userId, roomId: room.id, symbol: "O" },
    });

    await prisma.room.update({
      where: { id: room.id },
      data: { status: "playing" },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { roomId },
      include: {
        players: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    return successResponse({ room: updatedRoom }, "Joined room");
  } catch (error) {
    console.error("Join room error:", error);
    return errorResponse("Internal server error", 500);
  }
}
