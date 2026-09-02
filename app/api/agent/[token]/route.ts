import { NextRequest, NextResponse } from "next/server";
import { getAgentFullByToken } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const agentFull = await getAgentFullByToken(token);
  if (!agentFull || agentFull.agent.archived_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(agentFull);
}
