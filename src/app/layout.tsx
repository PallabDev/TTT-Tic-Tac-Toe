import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "T3 Arena - Realtime Tic Tac Toe",
  description: "Play realtime two-player tic tac toe with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-primary-soft text-body font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
