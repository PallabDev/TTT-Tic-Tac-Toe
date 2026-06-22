"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, type Room } from "@/lib/api";

const ROOM_KEY = "ttt_room_id";
const POLL_INTERVAL = 1000;

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<string>("");

  const fetchRoom = useCallback(async () => {
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
  }, [roomId]);

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

  const makeMove = async (cellIndex: number) => {
    if (!room || !myPlayer || isMoving) return;
    if (room.status !== "playing" || room.turn !== myPlayer.symbol || room.board[cellIndex]) return;

    setIsMoving(true);
    setError("");
    try {
      const res = await api.rooms.move(roomId, cellIndex);
      setRoom(res.data.room);
      lastUpdateRef.current = res.data.room.updatedAt;
    } catch (err) {
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
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-2xl backdrop-blur-xl fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Room {roomId}</h2>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-transparent hover:bg-surface-hover transition-colors"
            onClick={leaveToLobby}
          >
            Back
          </button>
        </div>

        {error && <p className="text-error text-sm mb-3">{error}</p>}

        {!room ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-sm text-muted">Fetching room...</p>
            <button
              type="button"
              onClick={joinRoom}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors"
            >
              Join Room
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
                <span className="text-[11px] text-muted uppercase block">Game</span>
                <strong className="text-xs mt-1 block capitalize">{room.status}</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
                <span className="text-[11px] text-muted uppercase block">You</span>
                <strong className="text-xs mt-1 block capitalize">{myPlayer?.symbol || "Spectator"}</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
                <span className="text-[11px] text-muted uppercase block">Sync</span>
                <strong className="text-xs mt-1 block text-success">live</strong>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-[42px] rounded-lg bg-gradient-to-r from-primary/15 to-accent/10 border border-border font-bold text-sm mb-4">
              {room.status === "finished"
                ? room.winner === "DRAW"
                  ? "Draw game"
                  : `${room.winner} wins`
                : room.turn === myPlayer?.symbol
                ? "Your move"
                : `${room.turn}'s turn`}
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {room.board.map((cell, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => makeMove(index)}
                  disabled={
                    !myPlayer ||
                    isMoving ||
                    room.status !== "playing" ||
                    room.turn !== myPlayer.symbol ||
                    !!cell
                  }
                  className={`aspect-square flex items-center justify-center rounded-lg border border-border text-3xl font-black transition-all
                    ${cell === "X" ? "text-primary bg-primary/10 cell-animate" : ""}
                    ${cell === "O" ? "text-accent bg-accent/10 cell-animate" : ""}
                    ${!cell && myPlayer && room.status === "playing" && room.turn === myPlayer.symbol
                      ? "bg-background hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
                      : "bg-background/50 cursor-not-allowed"
                    }
                    ${cell ? "cursor-not-allowed" : ""}
                  `}
                  aria-label={`Cell ${index + 1}`}
                >
                  {cell}
                </button>
              ))}
            </div>

            {room.players.length < 2 && (
              <button
                type="button"
                onClick={joinRoom}
                className="w-full py-2.5 rounded-lg border border-border bg-surface font-semibold text-sm hover:bg-surface-hover transition-colors mb-2"
              >
                Join as Player O
              </button>
            )}

            {room.status === "finished" && myPlayer && (
              <button
                type="button"
                onClick={restartGame}
                disabled={isRestarting}
                className="w-full py-2.5 rounded-lg bg-primary text-background font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
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
