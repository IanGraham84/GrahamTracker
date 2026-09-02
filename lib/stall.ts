import { AgentFull } from "./types";

export type StallResult = { label: string };

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return null;
  return (Date.now() - then) / DAY_MS;
}

function checked(agentFull: AgentFull, stepId: string): boolean {
  return !!agentFull.checks[stepId]?.checked;
}

export function detectStall(agentFull: AgentFull): StallResult | null {
  const { agent, dates } = agentFull;

  if (agent.stall_snoozed_until) {
    const snoozedUntil = new Date(agent.stall_snoozed_until).getTime();
    if (!Number.isNaN(snoozedUntil) && snoozedUntil >= Date.now()) {
      return null;
    }
  }

  const isUnlicensed = agent.type === "unlicensed";
  const anyContractingStarted =
    checked(agentFull, "10") || checked(agentFull, "12") || checked(agentFull, "13");

  // 1. Unlicensed + course_done checked + no exam_date
  if (isUnlicensed && checked(agentFull, "course_done") && !dates.exam_date) {
    return { label: "Finished course — exam not scheduled" };
  }

  // 2. Licensed (or license_received) + none of AML/SureLC/E&O started
  const isLicensedTrack = agent.type === "licensed" || checked(agentFull, "license_received");
  if (isLicensedTrack && !anyContractingStarted) {
    return { label: "Licensed — AML/SureLC/E&O not started" };
  }

  // 3. Unlicensed + exam_date in past 2+ days + step 2 not checked
  if (isUnlicensed && dates.exam_date && !checked(agentFull, "2")) {
    const since = daysSince(dates.exam_date);
    if (since !== null && since >= 2) {
      return { label: "Exam date passed — not marked passed" };
    }
  }

  // 4. Unlicensed + step 2 checked 2+ days ago + license_received not checked
  if (isUnlicensed && checked(agentFull, "2") && !checked(agentFull, "license_received")) {
    const since = daysSince(agentFull.checks["2"]?.checked_at ?? null);
    if (since !== null && since >= 2) {
      return { label: "Passed exam — license not received" };
    }
  }

  // 5. contracts_sent_at set 2+ days ago + step 16 not checked
  if (dates.contracts_sent_at && !checked(agentFull, "16")) {
    const since = daysSince(dates.contracts_sent_at);
    if (since !== null && since >= 2) {
      return { label: "Contracts sent — no first app" };
    }
  }

  // 6. Unlicensed + step 1 checked + course_done not checked + 7+ days since start
  if (isUnlicensed && checked(agentFull, "1") && !checked(agentFull, "course_done")) {
    const since = daysSince(agent.start_date);
    if (since !== null && since >= 7) {
      return { label: "Started — course not finished" };
    }
  }

  return null;
}
