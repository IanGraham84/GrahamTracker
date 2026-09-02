import { AgentFull } from "@/lib/types";
import { computeStage, computeProgress, computeGroupProgress } from "@/lib/funnel";
import { stepsForAgent } from "@/lib/steps";
import ProgressBar from "./ProgressBar";

export default function ProgressSummary({
  agentFull,
  title = "Progress",
}: {
  agentFull: AgentFull;
  title?: string;
}) {
  const stage = computeStage(agentFull);
  const percent = computeProgress(agentFull);
  const totalSteps = stepsForAgent(agentFull.agent.type).length;
  const checkedSteps = Math.round((percent / 100) * totalSteps);
  const groups = computeGroupProgress(agentFull);

  return (
    <div className="bg-card rounded-2xl border border-line p-4 space-y-3">
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-medium text-muted">{title}</p>
        <p className="text-2xl font-bold text-foreground leading-none">{percent}%</p>
      </div>
      <div className="flex items-center justify-between gap-3 -mt-1">
        <p className="text-xs text-faint">{stage}</p>
        <p className="text-xs text-faint">
          {checkedSteps} of {totalSteps} steps
        </p>
      </div>
      <ProgressBar percent={percent} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        {groups.map((g) => (
          <div key={g.group} className="rounded-xl bg-hover px-3 py-3 text-center">
            <p className="text-lg font-semibold text-foreground">{g.percent}%</p>
            <p className="text-xs text-muted mt-0.5">{g.group}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
