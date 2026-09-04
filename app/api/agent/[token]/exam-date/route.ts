import { NextRequest, NextResponse } from "next/server";
import { getAgentFullByToken, setExamDate } from "@/lib/data";

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
  const examDate: string | null = body.examDate ?? null;

  await setExamDate(agentFull.agent.id, examDate);
  return NextResponse.json({ ok: true });
}
