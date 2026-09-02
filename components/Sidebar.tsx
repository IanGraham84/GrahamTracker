"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAgents } from "@/lib/AgentsContext";
import { AGENCY } from "@/lib/agency";
import Avatar from "./Avatar";
import AddAgentModal from "./AddAgentModal";
import { detectStall } from "@/lib/stall";
import { createClient } from "@/lib/supabaseClient";

export default function Sidebar() {
  const { agents, refetch } = useAgents();
  const [showAdd, setShowAdd] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 border-r border-line bg-card flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-line">
        <p className="font-semibold text-sm">{AGENCY.name}</p>
        <p className="text-xs text-faint">Onboarding tracker</p>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="w-full rounded-lg bg-primary text-background text-sm font-medium py-2 hover:bg-primary-dark transition-colors"
        >
          + Add agent
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        <Link
          href="/dashboard"
          className={`block rounded-lg px-3 py-2 text-sm font-medium ${
            pathname === "/dashboard" ? "bg-primary-light text-primary-dark" : "text-muted hover:bg-hover"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/schedule"
          className={`block rounded-lg px-3 py-2 text-sm font-medium ${
            pathname === "/dashboard/schedule"
              ? "bg-primary-light text-primary-dark"
              : "text-muted hover:bg-hover"
          }`}
        >
          Master schedule
        </Link>

        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase text-faint">
          Agents
        </p>
        {agents.map((a) => {
          const stall = detectStall(a);
          const active = pathname === `/dashboard/${a.agent.id}`;
          return (
            <Link
              key={a.agent.id}
              href={`/dashboard/${a.agent.id}`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-primary-light text-primary-dark font-medium" : "text-muted hover:bg-hover"
              }`}
            >
              <Avatar name={a.agent.name} stalled={!!stall} size="sm" />
              <span className="truncate">{a.agent.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-line text-muted text-sm py-2 hover:bg-hover"
        >
          Log out
        </button>
      </div>

      {showAdd && (
        <AddAgentModal
          onClose={() => setShowAdd(false)}
          onCreated={(agent) => {
            refetch();
            router.push(`/dashboard/${agent.id}`);
          }}
        />
      )}
    </aside>
  );
}
