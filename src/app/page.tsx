"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-10 w-[min(1120px,calc(100%-2rem))] flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background/60 backdrop-blur-xl">
        <span className="text-lg font-bold tracking-tight">T3 Arena</span>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block">
            Features
          </a>
          <Link
            href={user ? "/lobby" : "/login"}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-background hover:bg-primary-dark transition-colors"
          >
            {loading ? "..." : user ? "Lobby" : "Login"}
          </Link>
        </div>
      </nav>

      <main className="w-[min(1120px,calc(100%-2rem))] mx-auto pt-32 pb-20 grid grid-cols-1 lg:grid-cols-[1.04fr_0.72fr] gap-12 items-center min-h-screen">
        <section>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Realtime tic tac toe
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.94] tracking-tight">
            Fast two-player matches with live rooms.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl leading-relaxed">
            Create a room, share the six digit code, and play smooth rounds with instant moves,
            replay support, and clean turn feedback.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={user ? "/lobby" : "/login"}
              className="px-6 py-3 text-sm font-bold rounded-lg bg-primary text-background hover:bg-primary-dark transition-colors inline-flex items-center justify-center min-w-[140px]"
            >
              {user ? "Go to Lobby" : "Start Playing"}
            </Link>
            <a
              href="#features"
              className="px-6 py-3 text-sm font-bold rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors inline-flex items-center justify-center min-w-[140px]"
            >
              See Features
            </a>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl border border-border bg-surface shadow-2xl" aria-label="Tic tac toe preview">
          {["X", "", "O", "", "X", "", "O", "", "X"].map((cell, i) => (
            <div
              key={i}
              className={`aspect-square grid place-items-center rounded-lg border border-border text-5xl sm:text-7xl lg:text-8xl font-black transition-colors ${
                cell === "X"
                  ? "text-primary bg-primary/10"
                  : cell === "O"
                  ? "text-accent bg-accent/10"
                  : "bg-surface"
              }`}
            >
              {cell}
            </div>
          ))}
        </section>
      </main>

      <section id="features" className="w-[min(1120px,calc(100%-2rem))] mx-auto pb-20 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { num: "01", title: "Realtime sync", desc: "Moves appear instantly via polling — works on Vercel." },
          { num: "02", title: "Private rooms", desc: "Invite a friend with a simple 6-digit code." },
          { num: "03", title: "Replay rounds", desc: "Restart together after a win or draw." },
        ].map((f) => (
          <div key={f.num} className="p-5 rounded-xl border border-border bg-surface min-h-[156px]">
            <span className="text-primary text-xs font-bold">{f.num}</span>
            <strong className="block mt-7 text-lg">{f.title}</strong>
            <p className="mt-2 text-sm text-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
