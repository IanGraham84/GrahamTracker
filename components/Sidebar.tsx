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
  const { agents } = useAgents();
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
    <aside className="w-64 shrink-0 border-r border-gray-100 bg-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-100">
        <p className="font-semibold text-sm">{AGENCY.name}</p>
        <p className="text-xs text-gray-400">Onboarding tracker</p>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="w-full rounded-lg bg-primary text-white text-sm font-medium py-2 hover:bg-primary-dark transition-colors"
        >
          + Add agent
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        <Link
          href="/dashboard"
          className={`block rounded-lg px-3 py-2 text-sm font-medium ${
            pathname === "/dashboard" ? "bg-primary-light text-primary-dark" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/schedule"
          className={`block rounded-lg px-3 py-2 text-sm font-medium ${
            pathname === "/dashboard/schedule"
              ? "bg-primary-light text-primary-dark"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Master schedule
        </Link>

        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase text-gray-400">
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
                active ? "bg-primary-light text-primary-dark font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Avatar name={a.agent.name} stalled={!!stall} size="sm" />
              <span className="truncate">{a.agent.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-gray-200 text-gray-500 text-sm py-2 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>

      {showAdd && (
        <AddAgentModal
          onClose={() => setShowAdd(false)}
          onCreated={(agent) => router.push(`/dashboard/${agent.id}`)}
        />
      )}
    </aside>
  );
}
