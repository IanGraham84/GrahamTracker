import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/apiAuth";
import { createAgent, listAgentsFull } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const includeArchived = request.nextUrl.searchParams.get("include_archived") === "true";
  const agents = await listAgentsFull(includeArchived);
  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const body = await request.json();
  if (!body?.name || !body?.type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  if (body.type !== "licensed" && body.type !== "unlicensed") {
    return NextResponse.json({ error: "type must be licensed or unlicensed" }, { status: 400 });
  }

  const agent = await createAgent({
    name: body.name,
    upline: body.upline ?? null,
    start_date: body.start_date ?? undefined,
    type: body.type,
    phone: body.phone ?? null,
    email: body.email ?? null,
    state: body.state ?? null,
  });

  return NextResponse.json({ agent }, { status: 201 });
}
