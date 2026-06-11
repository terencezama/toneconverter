import { corsJson, corsPreflight } from "@/lib/cors";
import { DEFAULT_PROVIDER_ID, getProvider } from "@/lib/providers";
import type { ConvertParams } from "@/lib/providers/types";
import { MAX_CHARS, TONES } from "@/lib/tones";

const VALID_TONES = new Set<string>(TONES.map((t) => t.id));
const VALID_LENGTHS = new Set(["normal", "shorter", "longer"]);

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  let body: {
    text?: unknown;
    tone?: unknown;
    length?: unknown;
    provider?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return corsJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return corsJson({ error: "Text is required." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return corsJson(
      { error: `Text must be ${MAX_CHARS} characters or fewer.` },
      { status: 400 }
    );
  }

  const tone =
    typeof body.tone === "string" && VALID_TONES.has(body.tone.toLowerCase())
      ? body.tone.toLowerCase()
      : "professional";
  const length =
    typeof body.length === "string" && VALID_LENGTHS.has(body.length)
      ? (body.length as ConvertParams["length"])
      : "normal";
  const providerId =
    typeof body.provider === "string" ? body.provider : DEFAULT_PROVIDER_ID;

  const provider = getProvider(providerId);
  if (!provider) {
    return corsJson(
      { error: `Unknown provider: ${providerId}` },
      { status: 400 }
    );
  }
  if (!provider.isConfigured()) {
    return corsJson(
      { error: `${provider.label} is not configured on this server.` },
      { status: 400 }
    );
  }

  try {
    const result = await provider.convert({ text, tone, length });
    return corsJson({ result });
  } catch (err) {
    console.error("convert-tone failed:", err);
    const message =
      err instanceof Error ? err.message : "Conversion failed. Please try again.";
    return corsJson({ error: message }, { status: 502 });
  }
}
