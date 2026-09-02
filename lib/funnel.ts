import { AgentFull } from "./types";
import { stepsForAgent } from "./steps";

export type FunnelStage =
  | "Not started"
  | "Started"
  | "Course complete"
  | "Exam scheduled"
  | "Passed exam"
  | "License received"
  | "Application submitted"
  | "Licensed — starting contracting"
  | "In Leake Training"
  | "AML / SureLC / E&O in progress"
  | "Ready for contracts"
  | "Contracts sent"
  | "Wrote first business";

export const FUNNEL_STAGES_UNLICENSED: FunnelStage[] = [
  "Not started",
  "Started",
  "Course complete",
  "Exam scheduled",
  "Passed exam",
  "License received",
  "Application submitted",
  "In Leake Training",
  "AML / SureLC / E&O in progress",
  "Ready for contracts",
  "Contracts sent",
  "Wrote first business",
];

export const FUNNEL_STAGES_LICENSED: FunnelStage[] = [
  "Not started",
  "Started",
  "Licensed — starting contracting",
  "In Leake Training",
  "AML / SureLC / E&O in progress",
  "Ready for contracts",
  "Contracts sent",
  "Wrote first business",
];

export function funnelStagesForType(type: "licensed" | "unlicensed"): FunnelStage[] {
  return type === "licensed" ? FUNNEL_STAGES_LICENSED : FUNNEL_STAGES_UNLICENSED;
}

// The step(s) that drive an admin manually advancing an agent to a given
// stage from the Pipeline UI. Stages driven purely by dates (exam scheduled)
// or by "any one of" conditions aren't included — they aren't safely
// single-click actions.
export const STAGE_ADVANCE_STEPS: Partial<Record<FunnelStage, string[]>> = {
  Started: ["1"],
  "Course complete": ["course_done"],
  "Passed exam": ["2"],
  "License received": ["license_received"],
  "Application submitted": ["7"],
  "Licensed — starting contracting": ["7"],
  "In Leake Training": ["leake"],
  "Ready for contracts": ["10", "12", "13"],
  "Wrote first business": ["16"],
};

function checked(agentFull: AgentFull, stepId: string): boolean {
  return !!agentFull.checks[stepId]?.checked;
}

export function computeStage(agentFull: AgentFull): FunnelStage {
  const { agent, dates } = agentFull;
  const isLicensed = agent.type === "licensed";
  const isUnlicensed = agent.type === "unlicensed";

  if (checked(agentFull, "16")) return "Wrote first business";
  if (dates.contracts_sent_at) return "Contracts sent";
  if (checked(agentFull, "10") && checked(agentFull, "12") && checked(agentFull, "13")) {
    return "Ready for contracts";
  }
  if (checked(agentFull, "10") || checked(agentFull, "12") || checked(agentFull, "13")) {
    return "AML / SureLC / E&O in progress";
  }
  if (isLicensed && checked(agentFull, "7")) return "Licensed — starting contracting";
  if (isUnlicensed && checked(agentFull, "license_received")) return "License received";
  if (isUnlicensed && checked(agentFull, "2")) return "Passed exam";
  if (isUnlicensed && dates.exam_date) return "Exam scheduled";
  if (isUnlicensed && checked(agentFull, "course_done")) return "Course complete";
  if (checked(agentFull, "leake")) return "In Leake Training";
  if (checked(agentFull, "7")) return "Application submitted";
  if (checked(agentFull, "1")) return "Started";
  return "Not started";
}

export function computeProgress(agentFull: AgentFull): number {
  const steps = stepsForAgent(agentFull.agent.type);
  if (steps.length === 0) return 0;
  const done = steps.filter((s) => checked(agentFull, s.id)).length;
  return Math.round((done / steps.length) * 100);
}
