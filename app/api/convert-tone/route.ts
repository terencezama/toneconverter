import { corsJson, corsPreflight } from "@/lib/cors";
import { DEFAULT_PROVIDER_ID, getProvider } from "@/lib/providers";
import { isLengthId, isOutcomeId, isToneId, MAX_CHARS } from "@/lib/tones";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  let body: {
    text?: unknown;
    tone?: unknown;
    length?: unknown;
    outcome?: unknown;
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

  const requestedTone = typeof body.tone === "string" ? body.tone.toLowerCase() : "";
  const tone = isToneId(requestedTone) ? requestedTone : "professional";
  const length = isLengthId(body.length) ? body.length : "normal";
  const outcome = isOutcomeId(body.outcome) ? body.outcome : null;
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
    const result = await provider.convert({ text, tone, length, outcome });
    return corsJson({ result });
  } catch (err) {
    console.error("convert-tone failed:", err);
    const message =
      err instanceof Error ? err.message : "Conversion failed. Please try again.";
    return corsJson({ error: message }, { status: 502 });
  }
}
