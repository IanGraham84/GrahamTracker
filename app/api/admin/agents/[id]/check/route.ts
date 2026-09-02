import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/apiAuth";
import { setCheck } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const { stepId, checked } = body;
  if (typeof stepId !== "string" || typeof checked !== "boolean") {
    return NextResponse.json({ error: "stepId and checked are required" }, { status: 400 });
  }

  await setCheck(id, stepId, checked, "admin");
  return NextResponse.json({ ok: true });
}
