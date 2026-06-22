"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const ROOM_KEY = "ttt_room_id";

export default function LobbyPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.rooms.create();
      localStorage.setItem(ROOM_KEY, res.data.room.roomId);
      router.push(`/room/${res.data.room.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const code = joinCode.trim();
      await api.rooms.join(code);
      localStorage.setItem(ROOM_KEY, code);
      router.push(`/room/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const continueRoom = () => {
    const stored = localStorage.getItem(ROOM_KEY);
    if (stored) router.push(`/room/${stored}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-2xl backdrop-blur-xl fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Lobby</h2>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-transparent hover:bg-surface-hover transition-colors"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        <p className="text-sm text-muted mb-5">Logged in as {user?.email}</p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={createRoom}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-background font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Room
          </button>

          <input
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            placeholder="Enter 6-digit room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />

          <button
            type="button"
            onClick={joinRoom}
            disabled={loading || joinCode.length !== 6}
            className="w-full py-2.5 rounded-lg border border-border bg-surface font-semibold text-sm hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Room
          </button>

          <button
            type="button"
            onClick={continueRoom}
            className="w-full py-2 rounded-lg border border-transparent bg-transparent text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            Continue Previous Room
          </button>

          {error && (
            <p className="text-error text-sm text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
