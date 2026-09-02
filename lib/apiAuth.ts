import "server-only";
import { NextResponse } from "next/server";
import { requireAdmin } from "./supabaseServer";

export async function requireAdminOrResponse() {
  const user = await requireAdmin();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
