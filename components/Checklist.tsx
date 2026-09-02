"use client";

import { AgentFull } from "@/lib/types";
import { STEP_GROUPS, stepsForAgent } from "@/lib/steps";

export default function Checklist({
  agentFull,
  admin,
  onToggle,
}: {
  agentFull: AgentFull;
  admin: boolean;
  onToggle: (stepId: string, checked: boolean) => void;
}) {
  const steps = stepsForAgent(agentFull.agent.type);

  return (
    <div className="space-y-6">
      {STEP_GROUPS.map((group) => {
        const groupSteps = steps.filter((s) => s.group === group);
        if (groupSteps.length === 0) return null;

        return (
          <div key={group}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{group}</h3>
            <div className="space-y-1.5">
              {groupSteps.map((step) => {
                const record = agentFull.checks[step.id];
                const isChecked = !!record?.checked;
                const lockedForAgent = !admin && isChecked && record?.checked_by === "admin";

                return (
                  <label
                    key={step.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                      isChecked
                        ? "bg-primary-light/50 border-primary-light"
                        : "bg-white border-gray-100"
                    } ${lockedForAgent ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={lockedForAgent}
                      onChange={(e) => onToggle(step.id, e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[var(--color-primary)] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm ${isChecked ? "strike" : "text-foreground"}`}>
                        {step.name}
                      </p>
                      {step.note && (
                        <p className="text-xs text-gray-500 mt-0.5">{step.note}</p>
                      )}
                      {step.links && step.links.length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {step.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-sky underline hover:text-primary"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                      {record?.checked_at && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          Checked {record.checked_by === "admin" ? "by admin" : "by agent"} on{" "}
                          {new Date(record.checked_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
