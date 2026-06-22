import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/session";
import { successResponse, errorResponse, getWinner } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { roomId } = await context.params;
    const { cellIndex } = await request.json();

    if (cellIndex === undefined || !Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex > 8) {
      return errorResponse("Invalid board cell", 400);
    }

    const room = await prisma.room.findUnique({
      where: { roomId },
      include: {
        players: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    if (!room) {
      return errorResponse("Room not found", 404);
    }

    if (room.status !== "playing") {
      return errorResponse("Game is not active", 400);
    }

    if (room.board[cellIndex]) {
      return errorResponse("Cell already filled", 409);
    }

    const currentPlayer = room.players.find((p) => p.userId === user.userId);
    if (!currentPlayer) {
      return errorResponse("You are not part of this room", 403);
    }

    if (currentPlayer.symbol !== room.turn) {
      return errorResponse("Not your turn", 409);
    }

    const newBoard = [...room.board];
    newBoard[cellIndex] = currentPlayer.symbol;

    const winner = getWinner(newBoard);
    let newStatus = room.status;
    let newWinner = room.winner;

    if (winner) {
      newStatus = "finished";
      newWinner = winner;
    } else if (newBoard.every((cell) => cell !== "")) {
      newStatus = "finished";
      newWinner = "DRAW";
    }

    const newTurn = room.turn === "X" ? "O" : "X";

    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        board: newBoard,
        turn: newTurn,
        status: newStatus,
        winner: newWinner,
      },
      include: {
        players: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    // Trigger Pusher event to update the other player in real-time
    try {
      const { pusherServer } = await import("@/lib/pusher-server");
      await pusherServer.trigger(`room-${roomId}`, "room-updated", { room: updatedRoom });
    } catch (err) {
      console.error("Pusher move trigger error:", err);
    }

    return successResponse({ room: updatedRoom }, "Move updated");
  } catch (error) {
    console.error("Make move error:", error);
    return errorResponse("Internal server error", 500);
  }
}
