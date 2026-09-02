"use client";

import { useState } from "react";
import { AgentFull } from "@/lib/types";
import { STEP_GROUPS, Step, stepsForAgent } from "@/lib/steps";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-faint shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function StepRow({
  step,
  agentFull,
  admin,
  onToggle,
}: {
  step: Step;
  agentFull: AgentFull;
  admin: boolean;
  onToggle: (stepId: string, checked: boolean) => void;
}) {
  const record = agentFull.checks[step.id];
  const isChecked = !!record?.checked;
  const lockedForAgent = !admin && isChecked && record?.checked_by === "admin";

  return (
    <label
      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
        isChecked ? "bg-primary-light/50 border-primary-light" : "bg-card border-line"
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
        <p className={`text-sm ${isChecked ? "strike" : "text-foreground"}`}>{step.name}</p>
        {step.note && <p className="text-xs text-muted mt-0.5">{step.note}</p>}
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
          <p className="text-[11px] text-faint mt-1">
            Checked {record.checked_by === "admin" ? "by admin" : "by agent"} on{" "}
            {new Date(record.checked_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </label>
  );
}

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

  const groups = STEP_GROUPS.map((group) => {
    const groupSteps = steps.filter((s) => s.group === group);
    const checkedCount = groupSteps.filter((s) => agentFull.checks[s.id]?.checked).length;
    return { group, groupSteps, checkedCount, isComplete: groupSteps.length > 0 && checkedCount === groupSteps.length };
  }).filter((g) => g.groupSteps.length > 0);

  // Groups that are already complete start collapsed; anything still in
  // progress starts open. Only computed once per mount (per agent, via the
  // `key` the parent passes) — a later toggle doesn't yank a group shut
  // out from under whoever is looking at it.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.group, g.isComplete]))
  );

  function toggleGroup(group: string) {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  return (
    <div className="space-y-3">
      {groups.map(({ group, groupSteps, checkedCount, isComplete }) => {
        const isExpanded = !collapsed[group];

        return (
          <div key={group} className="rounded-xl border border-line overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center gap-2 px-3 py-3 bg-card hover:bg-hover transition-colors text-left"
            >
              <span className="text-sm font-semibold text-foreground">{group}</span>
              {isComplete && (
                <span className="text-[11px] font-medium bg-primary-light text-primary-dark rounded-full px-2 py-0.5">
                  Complete
                </span>
              )}
              <span className="flex-1" />
              <span className="text-xs text-faint">
                {checkedCount}/{groupSteps.length}
              </span>
              <ChevronIcon expanded={isExpanded} />
            </button>
            {isExpanded && (
              <div className="space-y-1.5 p-3 pt-0">
                {groupSteps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    agentFull={agentFull}
                    admin={admin}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
