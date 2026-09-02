import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import { AgentSchedule } from "./types";

export type CreateScheduleInput = {
  agent_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label?: string | null;
  timezone?: string;
};

export async function listSchedulesForAgent(agentId: string): Promise<AgentSchedule[]> {
  const { data, error } = await supabaseAdmin
    .from("agent_schedules")
    .select("*")
    .eq("agent_id", agentId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listAllSchedules(): Promise<AgentSchedule[]> {
  const { data, error } = await supabaseAdmin
    .from("agent_schedules")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createSchedule(input: CreateScheduleInput): Promise<AgentSchedule> {
  const { data, error } = await supabaseAdmin
    .from("agent_schedules")
    .insert({
      agent_id: input.agent_id,
      day_of_week: input.day_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
      label: input.label ?? null,
      timezone: input.timezone ?? "America/New_York",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("agent_schedules").delete().eq("id", id);
  if (error) throw error;
}
