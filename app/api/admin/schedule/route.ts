import { NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/apiAuth";
import { listAllSchedules } from "@/lib/schedules";
import { listAgentsFull } from "@/lib/data";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const [schedules, agentsFull] = await Promise.all([
    listAllSchedules(),
    listAgentsFull(false),
  ]);

  const agents = agentsFull.map((a) => ({ id: a.agent.id, name: a.agent.name }));

  return NextResponse.json({ schedules, agents });
}
