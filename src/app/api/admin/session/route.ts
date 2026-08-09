import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export async function GET() {
  const authenticated = await isAdminRequest();
  return NextResponse.json({ authenticated });
}
