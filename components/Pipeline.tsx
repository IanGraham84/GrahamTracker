"use client";

import { AgentFull } from "@/lib/types";
import { computeStage, funnelStagesForType, FunnelStage, STAGE_ADVANCE_STEPS } from "@/lib/funnel";

export default function Pipeline({
  agentFull,
  onStageClick,
}: {
  agentFull: AgentFull;
  onStageClick?: (stage: FunnelStage) => void;
}) {
  const stages = funnelStagesForType(agentFull.agent.type);
  const currentStage = computeStage(agentFull);
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="flex flex-wrap gap-2">
      {stages.map((stage, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const clickable = !!onStageClick && !reached && !!STAGE_ADVANCE_STEPS[stage];

        return (
          <button
            key={stage}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStageClick?.(stage)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              isCurrent
                ? "bg-primary text-white border-primary"
                : reached
                ? "bg-primary-light text-primary-dark border-primary-light"
                : clickable
                ? "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary cursor-pointer"
                : "bg-white text-gray-300 border-gray-100 cursor-default"
            }`}
          >
            {stage}
          </button>
        );
      })}
    </div>
  );
}
