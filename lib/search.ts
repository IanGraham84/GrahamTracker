import { AgentFull } from "./types";

export function matchesAgentSearch(agentFull: AgentFull, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const name = agentFull.agent.name?.toLowerCase() ?? "";
  const state = agentFull.agent.state?.toLowerCase() ?? "";
  if (name.includes(needle) || state.includes(needle)) return true;

  const needleDigits = needle.replace(/\D/g, "");
  if (needleDigits) {
    const phoneDigits = (agentFull.agent.phone ?? "").replace(/\D/g, "");
    if (phoneDigits.includes(needleDigits)) return true;
  }

  return false;
}
