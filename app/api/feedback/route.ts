import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: {
    rating?: unknown;
    comment?: unknown;
    tone?: unknown;
    provider?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // MVP: log only. Swap for DB persistence later.
  console.log("[feedback]", {
    rating: body.rating,
    comment: body.comment,
    tone: body.tone,
    provider: body.provider,
  });
  return NextResponse.json({ ok: true });
}
