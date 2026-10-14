import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.refreshToken) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: session.userId, name: session.displayName } });
}
