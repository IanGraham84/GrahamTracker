import { NextRequest, NextResponse } from "next/server";
import { getAgentFullByToken } from "@/lib/data";
import { createSchedule, deleteSchedule, listSchedulesForAgent } from "@/lib/schedules";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const agentFull = await getAgentFullByToken(token);
  if (!agentFull || agentFull.agent.archived_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const schedules = await listSchedulesForAgent(agentFull.agent.id);
  return NextResponse.json({ schedules });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const agentFull = await getAgentFullByToken(token);
  if (!agentFull || agentFull.agent.archived_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { day_of_week, start_time, end_time, label, timezone } = body;
  if (
    typeof day_of_week !== "number" ||
    typeof start_time !== "string" ||
    typeof end_time !== "string"
  ) {
    return NextResponse.json(
      { error: "day_of_week, start_time, end_time are required" },
      { status: 400 }
    );
  }

  const schedule = await createSchedule({
    agent_id: agentFull.agent.id,
    day_of_week,
    start_time,
    end_time,
    label: label ?? null,
    timezone: timezone ?? undefined,
  });

  return NextResponse.json({ schedule }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const agentFull = await getAgentFullByToken(token);
  if (!agentFull || agentFull.agent.archived_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const scheduleId = request.nextUrl.searchParams.get("scheduleId");
  if (!scheduleId) {
    return NextResponse.json({ error: "scheduleId is required" }, { status: 400 });
  }

  // Ensure the schedule belongs to this agent before deleting.
  const { data: existing, error } = await supabaseAdmin
    .from("agent_schedules")
    .select("agent_id")
    .eq("id", scheduleId)
    .maybeSingle();
  if (error) throw error;
  if (!existing || existing.agent_id !== agentFull.agent.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteSchedule(scheduleId);
  return NextResponse.json({ ok: true });
}
