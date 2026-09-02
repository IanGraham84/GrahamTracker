import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/apiAuth";
import { deleteAgent, getAgentFullById, updateAgent } from "@/lib/data";
import { Agent } from "@/lib/types";

const UPDATABLE_FIELDS: (keyof Agent)[] = [
  "name",
  "upline",
  "start_date",
  "type",
  "phone",
  "email",
  "state",
  "notes",
  "stall_snoozed_until",
  "archived_at",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const agentFull = await getAgentFullById(id);
  if (!agentFull) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agentFull);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await request.json();

  const fields: Partial<Agent> = {};
  for (const key of UPDATABLE_FIELDS) {
    if (key in body) {
      fields[key] = body[key];
    }
  }

  const agent = await updateAgent(id, fields);
  return NextResponse.json({ agent });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  await deleteAgent(id);
  return NextResponse.json({ ok: true });
}
