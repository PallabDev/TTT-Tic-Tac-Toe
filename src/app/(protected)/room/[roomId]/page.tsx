"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, type Room } from "@/lib/api";

const ROOM_KEY = "ttt_room_id";
const POLL_INTERVAL = 1000;

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<string>("");

  const fetchRoom = useCallback(async () => {
    if (isMoving) return;
    try {
      const res = await api.rooms.get(roomId);
      const newRoom = res.data.room;
      if (newRoom.updatedAt !== lastUpdateRef.current) {
        lastUpdateRef.current = newRoom.updatedAt;
        setRoom(newRoom);
        setError("");
        localStorage.setItem(ROOM_KEY, roomId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch room");
    }
  }, [roomId, isMoving]);

  useEffect(() => {
    fetchRoom();
    pollRef.current = setInterval(fetchRoom, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchRoom]);

  const myPlayer = useMemo(
    () => room?.players.find((p) => p.userId === user?.id),
    [room, user]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-neutral-primary-soft">
        <p className="text-sm text-body-subtle">Checking authentication...</p>
      </div>
    );
  }

  if (!user) return null;

  const makeMove = async (cellIndex: number) => {
    if (!room || !myPlayer || isMoving) return;
    if (room.status !== "playing" || room.turn !== myPlayer.symbol || room.board[cellIndex]) return;

    const previousRoom = room;
    // Apply optimistic updates immediately to the UI
    const optimisticBoard = [...room.board];
    optimisticBoard[cellIndex] = myPlayer.symbol;
    const nextTurn = room.turn === "X" ? "O" : "X";
    
    // Check if there is an optimistic winner to show immediate status changes
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    let optimisticWinner = null;
    let optimisticStatus = room.status;
    for (const [a, b, c] of lines) {
      if (optimisticBoard[a] && optimisticBoard[a] === optimisticBoard[b] && optimisticBoard[a] === optimisticBoard[c]) {
        optimisticWinner = optimisticBoard[a];
        optimisticStatus = "finished";
        break;
      }
    }
    if (optimisticStatus !== "finished" && optimisticBoard.every((cell) => cell !== "")) {
      optimisticStatus = "finished";
      optimisticWinner = "DRAW";
    }

    const optimisticRoom = {
      ...room,
      board: optimisticBoard,
      turn: nextTurn,
      status: optimisticStatus,
      winner: optimisticWinner,
    };

    setRoom(optimisticRoom);
    setIsMoving(true);
    setError("");
    try {
      const res = await api.rooms.move(roomId, cellIndex);
      setRoom(res.data.room);
      lastUpdateRef.current = res.data.room.updatedAt;
    } catch (err) {
      // Revert to previous room state on network error
      setRoom(previousRoom);
      setError(err instanceof Error ? err.message : "Move failed");
    } finally {
      setIsMoving(false);
    }
  };

  const joinRoom = async () => {
    try {
      const res = await api.rooms.join(roomId);
      setRoom(res.data.room);
      lastUpdateRef.current = res.data.room.updatedAt;
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    }
  };

  const restartGame = async () => {
    setIsRestarting(true);
    setError("");
    try {
      const res = await api.rooms.restart(roomId);
      setRoom(res.data.room);
      lastUpdateRef.current = res.data.room.updatedAt;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restart failed");
    } finally {
      setIsRestarting(false);
    }
  };

  const leaveToLobby = () => {
    localStorage.removeItem(ROOM_KEY);
    router.push("/lobby");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-neutral-primary-soft">
      <div className="w-full max-w-[420px] sketch-card bg-neutral-primary-medium fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-hand font-normal text-heading">Room {roomId}</h2>
          <button
            type="button"
            className="sketch-button sketch-button-secondary text-xs px-4 py-1.5"
            onClick={leaveToLobby}
          >
            Back
          </button>
        </div>

        {error && <p className="text-danger text-sm font-medium mb-3 text-center">{error}</p>}

        {!room ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-body-subtle">Fetching room...</p>
            <button
              type="button"
              onClick={joinRoom}
              className="sketch-button sketch-button-secondary text-sm py-2 px-6"
            >
              Join Room
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-2 rounded-xl border-2 border-dashed border-default bg-neutral-primary-soft text-center">
                <span className="text-[10px] text-body-subtle font-bold uppercase block">Game</span>
                <strong className="text-xs mt-0.5 block capitalize text-heading">{room.status}</strong>
              </div>
              <div className="p-2 rounded-xl border-2 border-dashed border-default bg-neutral-primary-soft text-center">
                <span className="text-[10px] text-body-subtle font-bold uppercase block">You</span>
                <strong className="text-xs mt-0.5 block capitalize text-heading">{myPlayer?.symbol || "Spectator"}</strong>
              </div>
              <div className="p-2 rounded-xl border-2 border-dashed border-default bg-neutral-primary-soft text-center">
                <span className="text-[10px] text-body-subtle font-bold uppercase block">Sync</span>
                <strong className="text-xs mt-0.5 block text-brand font-bold uppercase">live</strong>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-[42px] rounded-xl border-2 border-dashed border-brand bg-brand-softer text-fg-brand-strong font-bold text-sm mb-4">
              {room.status === "finished"
                ? room.winner === "DRAW"
                  ? "Draw game"
                  : `${room.winner} wins`
                : room.turn === myPlayer?.symbol
                ? "Your move"
                : `${room.turn}'s turn`}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {room.board.map((cell, index) => {
                const isMyTurn = myPlayer && room.status === "playing" && room.turn === myPlayer.symbol;
                const canMakeMove = isMyTurn && !cell && !isMoving;
                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => makeMove(index)}
                    disabled={!canMakeMove}
                    className={`aspect-square flex items-center justify-center rounded-xl border-2 border-dashed text-4xl font-black transition-all shadow-xs
                      ${cell === "X" ? "text-brand bg-brand-softer border-brand cell-animate" : ""}
                      ${cell === "O" ? "text-fg-purple bg-purple-soft border-purple cell-animate" : ""}
                      ${!cell && canMakeMove
                        ? "bg-neutral-primary-soft border-brand hover:bg-brand-softer hover:border-brand-strong hover:scale-105 cursor-pointer"
                        : ""
                      }
                      ${!cell && !canMakeMove
                        ? "bg-neutral-primary-soft border-border-default cursor-not-allowed"
                        : ""
                      }
                    `}
                    aria-label={`Cell ${index + 1}`}
                  >
                    {cell}
                  </button>
                );
              })}
            </div>

            {room.players.length < 2 && (
              <button
                type="button"
                onClick={joinRoom}
                className="sketch-button sketch-button-secondary w-full py-3 mb-2"
              >
                Join as Player O
              </button>
            )}

            {room.status === "finished" && myPlayer && (
              <button
                type="button"
                onClick={restartGame}
                disabled={isRestarting}
                className="sketch-button w-full py-3 pulse-glow"
              >
                {isRestarting ? "Restarting..." : "Replay"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
