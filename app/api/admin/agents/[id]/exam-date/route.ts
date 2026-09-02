import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/apiAuth";
import { setExamDate } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const examDate: string | null = body.examDate ?? null;

  await setExamDate(id, examDate);
  return NextResponse.json({ ok: true });
}
