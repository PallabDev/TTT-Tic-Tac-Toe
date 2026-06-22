"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace("/lobby");
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.push("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-neutral-primary-soft">
      <div className="w-full max-w-[420px] sketch-card bg-neutral-primary-medium fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-hand font-normal text-heading">
            {mode === "login" ? "Welcome back" : "Join the Arena"}
          </h2>
          <Link
            href="/"
            className="sketch-button sketch-button-secondary text-xs px-4 py-1.5"
          >
            Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="sketch-label">Email Address</label>
            <input
              id="email"
              className="sketch-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="sketch-label">Password</label>
            <input
              id="password"
              className="sketch-input"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sketch-button w-full mt-2 py-3"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>

          <button
            type="button"
            className="sketch-button sketch-button-secondary w-full py-2.5"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create new account" : "Have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
