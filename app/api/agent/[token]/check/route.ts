import { NextRequest, NextResponse } from "next/server";
import { getAgentFullByToken, setCheck } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const { stepId, checked } = body;
  if (typeof stepId !== "string" || typeof checked !== "boolean") {
    return NextResponse.json({ error: "stepId and checked are required" }, { status: 400 });
  }

  const agentFull = await getAgentFullByToken(token);
  if (!agentFull || agentFull.agent.archived_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = agentFull.checks[stepId];
  if (existing?.checked && existing.checked_by === "admin" && !checked) {
    return NextResponse.json(
      { error: "This step was checked by your admin and can't be unchecked here." },
      { status: 403 }
    );
  }

  await setCheck(agentFull.agent.id, stepId, checked, "agent");
  return NextResponse.json({ ok: true });
}
