import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/session";
import { successResponse, errorResponse, generateRoomId } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    let roomId = generateRoomId();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.room.findUnique({ where: { roomId } });
      if (!existing) break;
      roomId = generateRoomId();
      attempts++;
    }

    const room = await prisma.room.create({
      data: {
        roomId,
        players: {
          create: { userId: user.userId, symbol: "X" },
        },
      },
      include: { players: { include: { user: { select: { id: true, email: true } } } } },
    });

    return successResponse({ room }, "Room created", 201);
  } catch (error) {
    console.error("Create room error:", error);
    return errorResponse("Internal server error", 500);
  }
}
