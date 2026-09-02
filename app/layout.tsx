import type { Metadata } from "next";
import "./globals.css";
import { AGENCY } from "@/lib/agency";

export const metadata: Metadata = {
  title: `${AGENCY.name} — Onboarding Tracker`,
  description: "Agent onboarding tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
