"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-10 w-[min(1120px,calc(100%-2rem))] flex items-center justify-between px-6 py-2 rounded-[24px] sketch-card bg-neutral-primary-medium">
        <span className="text-xl font-hand font-bold tracking-tight text-heading">T3 Arena</span>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm font-medium text-body hover:text-brand transition-colors hidden sm:block">
            Features
          </a>
          <Link
            href={user ? "/lobby" : "/login"}
            className="sketch-button sketch-button-secondary text-sm px-6 py-2"
          >
            {loading ? "..." : user ? "Lobby" : "Login"}
          </Link>
        </div>
      </nav>

      <main className="w-[min(1200px,calc(100%-2rem))] mx-auto pt-36 pb-20 flex flex-col items-center justify-center text-center gap-12 min-h-screen">
        <section className="max-w-4xl flex flex-col items-center">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-4">
            Realtime tic tac toe
          </p>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-hand font-normal leading-[1.0] tracking-tight text-heading">
            Fast two-player matches with live rooms.
          </h1>
          <p className="mt-6 text-lg text-body max-w-2xl leading-relaxed">
            Create a room, share the six digit code, and play smooth rounds with instant moves,
            replay support, and clean turn feedback.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={user ? "/lobby" : "/login"}
              className="sketch-button text-base px-8 py-3.5 inline-flex items-center justify-center min-w-[160px]"
            >
              {user ? "Go to Lobby" : "Start Playing"}
            </Link>
            <a
              href="#features"
              className="sketch-button sketch-button-secondary text-base px-8 py-3.5 inline-flex items-center justify-center min-w-[160px]"
            >
              See Features
            </a>
          </div>
        </section>

        <section className="sketch-card w-full max-w-[420px] p-5" aria-label="Tic tac toe preview">
          <div className="grid grid-cols-3 gap-3">
            {["X", "", "O", "", "X", "", "O", "", "X"].map((cell, i) => (
              <div
                key={i}
                className={`aspect-square grid place-items-center rounded-xl border-2 border-dashed text-5xl sm:text-6xl font-black transition-all
                  ${cell === "X" ? "text-brand bg-brand-softer border-brand shadow-xs" : ""}
                  ${cell === "O" ? "text-fg-purple bg-purple-soft border-purple shadow-xs" : ""}
                  ${!cell ? "bg-neutral-primary-soft border-border-default" : ""}
                `}
              >
                {cell}
              </div>
            ))}
          </div>
        </section>
      </main>

      <section id="features" className="w-[min(1120px,calc(100%-2rem))] mx-auto pb-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { num: "01", title: "Realtime sync", desc: "Moves appear instantly via polling — works on Vercel." },
          { num: "02", title: "Private rooms", desc: "Invite a friend with a simple 6-digit code." },
          { num: "03", title: "Replay rounds", desc: "Restart together after a win or draw." },
        ].map((f) => (
          <div key={f.num} className="sketch-card flex flex-col justify-between min-h-[170px]">
            <div>
              <span className="text-brand text-xs font-bold">{f.num}</span>
              <h3 className="block mt-4 text-xl font-hand font-normal text-heading">{f.title}</h3>
            </div>
            <p className="mt-4 text-sm text-body-subtle leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
