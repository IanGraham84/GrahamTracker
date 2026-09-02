"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { AGENCY } from "@/lib/agency";

const agencyNameWords = AGENCY.name.split(" ");

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-line p-8">
        <div className="text-center mb-1">
          <p className="text-[11px] font-semibold tracking-widest text-faint uppercase">The</p>
          <p className="text-xl font-bold tracking-tight">
            <span className="text-foreground">{agencyNameWords.slice(0, -1).join(" ")} </span>
            <span className="text-primary">{agencyNameWords.at(-1)}</span>
          </p>
        </div>
        <p className="text-sm text-muted text-center mb-6">Onboarding tracker admin login</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs text-stall">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-background py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
