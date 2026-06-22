"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const ROOM_KEY = "ttt_room_id";

export default function LobbyPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen flex items-center justify-center p-5 bg-neutral-primary-soft">
      <div className="w-full max-w-[420px] sketch-card bg-neutral-primary-medium fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-hand font-normal text-heading">Lobby</h2>
          <button
            type="button"
            className="sketch-button sketch-button-secondary text-xs px-4 py-1.5"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        <p className="text-sm text-body-subtle mb-6">
          Logged in as <strong className="text-body font-semibold">{user?.email}</strong>
        </p>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={createRoom}
            disabled={loading}
            className="sketch-button w-full py-3"
          >
            Create Room
          </button>

          <div className="flex flex-col">
            <label htmlFor="joinCode" className="sketch-label">Join Existing Game</label>
            <input
              id="joinCode"
              className="sketch-input"
              placeholder="Enter 6-digit room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>

          <button
            type="button"
            onClick={joinRoom}
            disabled={loading || joinCode.length !== 6}
            className="sketch-button sketch-button-secondary w-full py-2.5"
          >
            Join Room
          </button>

          <button
            type="button"
            onClick={continueRoom}
            className="sketch-button sketch-button-ghost w-full py-2 text-sm text-body-subtle hover:text-heading"
          >
            Continue Previous Room
          </button>

          {error && (
            <p className="text-danger text-sm text-center font-medium">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
