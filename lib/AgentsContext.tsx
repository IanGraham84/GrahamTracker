"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AgentFull } from "@/lib/types";
import { createClient } from "@/lib/supabaseClient";

type AgentsContextValue = {
  agents: AgentFull[];
  loading: boolean;
  refetch: () => Promise<void>;
};

const AgentsContext = createContext<AgentsContextValue | null>(null);

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<AgentFull[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/admin/agents", { cache: "no-store" });
    if (res.ok) {
      const body = await res.json();
      setAgents(body.agents ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    refetch();

    const supabase = createClient();
    const channel = supabase
      .channel("agents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agents" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_checks" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_dates" }, refetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <AgentsContext.Provider value={{ agents, loading, refetch }}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentsContext);
  if (!ctx) throw new Error("useAgents must be used within AgentsProvider");
  return ctx;
}
