import { NextResponse } from "next/server";
import { getAvailableProviders } from "@/lib/providers";

export async function GET() {
  return NextResponse.json({ providers: getAvailableProviders() });
}
