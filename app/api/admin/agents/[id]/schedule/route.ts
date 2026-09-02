import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/apiAuth";
import { createSchedule, deleteSchedule, listSchedulesForAgent } from "@/lib/schedules";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const schedules = await listSchedulesForAgent(id);
  return NextResponse.json({ schedules });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
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
    agent_id: id,
    day_of_week,
    start_time,
    end_time,
    label: label ?? null,
    timezone: timezone ?? undefined,
  });

  return NextResponse.json({ schedule }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const scheduleId = request.nextUrl.searchParams.get("scheduleId");
  if (!scheduleId) {
    return NextResponse.json({ error: "scheduleId is required" }, { status: 400 });
  }

  await deleteSchedule(scheduleId);
  return NextResponse.json({ ok: true });
}
