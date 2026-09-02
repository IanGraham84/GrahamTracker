"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Agent, AgentType } from "@/lib/types";

export default function EditAgentModal({
  agent,
  onClose,
  onSaved,
}: {
  agent: Agent;
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}) {
  const [name, setName] = useState(agent.name);
  const [type, setType] = useState<AgentType>(agent.type);
  const [upline, setUpline] = useState(agent.upline ?? "");
  const [startDate, setStartDate] = useState(agent.start_date);
  const [phone, setPhone] = useState(agent.phone ?? "");
  const [email, setEmail] = useState(agent.email ?? "");
  const [state, setState] = useState(agent.state ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          upline: upline.trim() || null,
          start_date: startDate,
          phone: phone.trim() || null,
          email: email.trim() || null,
          state: state.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update agent");
      }
      const { agent: updated } = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit agent" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Name</label>
          <input
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Type</label>
          <div className="flex gap-2">
            {(["unlicensed", "licensed"] as AgentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize ${
                  type === t
                    ? "bg-primary text-background border-primary"
                    : "bg-card border-line text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Upline</label>
          <input
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={upline}
            onChange={(e) => setUpline(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Start date</label>
          <input
            type="date"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Phone</label>
            <input
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">State</label>
            <input
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="text-xs text-stall">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary text-background py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}
