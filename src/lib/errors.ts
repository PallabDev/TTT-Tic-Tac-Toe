import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function successResponse<T>(data: T, message = "Success", statusCode = 200) {
  return NextResponse.json({ success: true, statusCode, data, message }, { status: statusCode });
}

export function errorResponse(message: string, statusCode = 500) {
  return NextResponse.json(
    { success: false, statusCode, data: null, message },
    { status: statusCode }
  );
}

export const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getWinner(board: string[]): string | null {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return null;
}

export function generateRoomId(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}
