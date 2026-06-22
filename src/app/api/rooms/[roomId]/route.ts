import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/errors";

export async function GET(
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

    return successResponse({ room });
  } catch (error) {
    console.error("Get room error:", error);
    return errorResponse("Internal server error", 500);
  }
}
