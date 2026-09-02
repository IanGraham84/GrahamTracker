import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import { Agent, AgentDates, AgentFull, AgentType, ChecksMap } from "./types";

function hydrate(
  agent: Agent,
  checksRows: { step_id: string; checked: boolean; checked_at: string | null; checked_by: "agent" | "admin" | null }[],
  datesRow: AgentDates | null
): AgentFull {
  const checks: ChecksMap = {};
  for (const row of checksRows) {
    checks[row.step_id] = {
      checked: row.checked,
      checked_at: row.checked_at,
      checked_by: row.checked_by,
    };
  }
  return {
    agent,
    checks,
    dates: datesRow ?? {
      agent_id: agent.id,
      exam_date: null,
      exam_date_set_at: null,
      contracts_sent_at: null,
    },
  };
}

export async function listAgentsFull(includeArchived = false): Promise<AgentFull[]> {
  let query = supabaseAdmin.from("agents").select("*").order("created_at", { ascending: false });
  if (!includeArchived) {
    query = query.is("archived_at", null);
  }
  const { data: agents, error } = await query;
  if (error) throw error;
  if (!agents || agents.length === 0) return [];

  const agentIds = agents.map((a) => a.id);

  const [{ data: checksRows, error: checksErr }, { data: datesRows, error: datesErr }] =
    await Promise.all([
      supabaseAdmin.from("agent_checks").select("*").in("agent_id", agentIds),
      supabaseAdmin.from("agent_dates").select("*").in("agent_id", agentIds),
    ]);
  if (checksErr) throw checksErr;
  if (datesErr) throw datesErr;

  const checksByAgent = new Map<string, typeof checksRows>();
  for (const row of checksRows ?? []) {
    const list = checksByAgent.get(row.agent_id) ?? [];
    list.push(row);
    checksByAgent.set(row.agent_id, list);
  }
  const datesByAgent = new Map<string, AgentDates>();
  for (const row of datesRows ?? []) {
    datesByAgent.set(row.agent_id, row);
  }

  return agents.map((agent) =>
    hydrate(agent, checksByAgent.get(agent.id) ?? [], datesByAgent.get(agent.id) ?? null)
  );
}

export async function getAgentFullById(id: string): Promise<AgentFull | null> {
  const { data: agent, error } = await supabaseAdmin.from("agents").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!agent) return null;

  const [{ data: checksRows, error: checksErr }, { data: datesRow, error: datesErr }] =
    await Promise.all([
      supabaseAdmin.from("agent_checks").select("*").eq("agent_id", id),
      supabaseAdmin.from("agent_dates").select("*").eq("agent_id", id).maybeSingle(),
    ]);
  if (checksErr) throw checksErr;
  if (datesErr) throw datesErr;

  return hydrate(agent, checksRows ?? [], datesRow ?? null);
}

export async function getAgentFullByToken(token: string): Promise<AgentFull | null> {
  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("*")
    .eq("unique_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!agent) return null;

  const [{ data: checksRows, error: checksErr }, { data: datesRow, error: datesErr }] =
    await Promise.all([
      supabaseAdmin.from("agent_checks").select("*").eq("agent_id", agent.id),
      supabaseAdmin.from("agent_dates").select("*").eq("agent_id", agent.id).maybeSingle(),
    ]);
  if (checksErr) throw checksErr;
  if (datesErr) throw datesErr;

  return hydrate(agent, checksRows ?? [], datesRow ?? null);
}

export async function setCheck(
  agentId: string,
  stepId: string,
  checked: boolean,
  checkedBy: "agent" | "admin"
) {
  const { error } = await supabaseAdmin.from("agent_checks").upsert(
    {
      agent_id: agentId,
      step_id: stepId,
      checked,
      checked_at: checked ? new Date().toISOString() : null,
      checked_by: checked ? checkedBy : null,
    },
    { onConflict: "agent_id,step_id" }
  );
  if (error) throw error;
}

export async function setExamDate(agentId: string, examDate: string | null) {
  const { error } = await supabaseAdmin.from("agent_dates").upsert(
    {
      agent_id: agentId,
      exam_date: examDate,
      exam_date_set_at: examDate ? new Date().toISOString() : null,
    },
    { onConflict: "agent_id" }
  );
  if (error) throw error;
}

export async function setContractsSent(agentId: string, sent: boolean) {
  const { error } = await supabaseAdmin.from("agent_dates").upsert(
    {
      agent_id: agentId,
      contracts_sent_at: sent ? new Date().toISOString() : null,
    },
    { onConflict: "agent_id" }
  );
  if (error) throw error;
}

export type CreateAgentInput = {
  name: string;
  upline?: string | null;
  start_date?: string;
  type: AgentType;
  phone?: string | null;
  email?: string | null;
  state?: string | null;
};

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const { data, error } = await supabaseAdmin
    .from("agents")
    .insert({
      name: input.name,
      upline: input.upline ?? null,
      start_date: input.start_date ?? new Date().toISOString().slice(0, 10),
      type: input.type,
      phone: input.phone ?? null,
      email: input.email ?? null,
      state: input.state ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  const { error: datesErr } = await supabaseAdmin
    .from("agent_dates")
    .insert({ agent_id: data.id });
  if (datesErr) throw datesErr;

  return data;
}

export async function updateAgent(id: string, fields: Partial<Agent>): Promise<Agent> {
  const { data, error } = await supabaseAdmin
    .from("agents")
    .update(fields)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAgent(id: string) {
  const { error } = await supabaseAdmin.from("agents").delete().eq("id", id);
  if (error) throw error;
}

export async function archiveAgent(id: string): Promise<Agent> {
  return updateAgent(id, { archived_at: new Date().toISOString() });
}

export async function unarchiveAgent(id: string): Promise<Agent> {
  return updateAgent(id, { archived_at: null });
}
