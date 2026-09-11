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

function earliestCheckedAt(agentFull: AgentFull, stepIds: string[]): string | null {
  const checkedAts = stepIds
    .map((id) => agentFull.checks[id]?.checked_at)
    .filter((d): d is string => !!d);
  if (checkedAts.length === 0) return null;
  return checkedAts.reduce((earliest, d) => (d < earliest ? d : earliest));
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

  // 2. Licensed + step 7 (Onboarding Application) not checked + 2+ days since start
  if (agent.type === "licensed" && !checked(agentFull, "7")) {
    const since = daysSince(agent.start_date);
    if (since !== null && since >= 2) {
      return { label: "Licensed — Onboarding Application not submitted" };
    }
  }

  // 3. Licensed (or license_received) + none of AML/SureLC/E&O started
  const isLicensedTrack = agent.type === "licensed" || checked(agentFull, "license_received");
  if (isLicensedTrack && !anyContractingStarted) {
    return { label: "Licensed — AML/SureLC/E&O not started" };
  }

  // 4. Bundle started but not complete 3+ days after the first of AML/SureLC/E&O was checked
  const bundleIds = ["10", "12", "13"];
  const checkedBundleCount = bundleIds.filter((id) => checked(agentFull, id)).length;
  if (isLicensedTrack && checkedBundleCount > 0 && checkedBundleCount < bundleIds.length) {
    const since = daysSince(earliestCheckedAt(agentFull, bundleIds));
    if (since !== null && since >= 3) {
      return { label: "AML/SureLC/E&O started — bundle not complete" };
    }
  }

  // 5. Unlicensed + exam_date in past 2+ days + step 2 not checked
  if (isUnlicensed && dates.exam_date && !checked(agentFull, "2")) {
    const since = daysSince(dates.exam_date);
    if (since !== null && since >= 2) {
      return { label: "Exam date passed — not marked passed" };
    }
  }

  // 6. Unlicensed + step 2 checked 2+ days ago + license_received not checked
  if (isUnlicensed && checked(agentFull, "2") && !checked(agentFull, "license_received")) {
    const since = daysSince(agentFull.checks["2"]?.checked_at ?? null);
    if (since !== null && since >= 2) {
      return { label: "Passed exam — license not received" };
    }
  }

  // 7. contracts_sent_at set 2+ days ago + step 16 not checked
  if (dates.contracts_sent_at && !checked(agentFull, "16")) {
    const since = daysSince(dates.contracts_sent_at);
    if (since !== null && since >= 2) {
      return { label: "Contracts sent — no first app" };
    }
  }

  // 8. Unlicensed + step 1 checked + course_done not checked + 7+ days since start
  if (isUnlicensed && checked(agentFull, "1") && !checked(agentFull, "course_done")) {
    const since = daysSince(agent.start_date);
    if (since !== null && since >= 7) {
      return { label: "Started — course not finished" };
    }
  }

  return null;
}
