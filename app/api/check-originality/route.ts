import { corsJson, corsPreflight } from "@/lib/cors";
import { completeJson, isAnalysisConfigured } from "@/lib/providers/analysis";

const MAX_CHECK_CHARS = 6000;

export type OriginalityPassage = {
  text: string;
  type: "ai-pattern" | "boilerplate" | "original";
  reason: string;
};

export type OriginalityResult = {
  aiLikelihood: number; // 0..100
  originality: number; // 0..100
  verdict: string;
  summary: string;
  passages: OriginalityPassage[];
};

const SYSTEM_PROMPT = `You are an AI-writing and originality analyst for Tone Converter.
Analyze the user's text for signs of AI generation and unoriginal boilerplate.
Look for: uniform sentence rhythm, hedging filler ("it's important to note"), stock transitions ("furthermore", "in conclusion"), absence of personal detail or specific facts, generic claims, list-like structure, overly balanced "on one hand / on the other hand" phrasing, and cliched marketing language.

Reply with ONLY a JSON object:
{
  "aiLikelihood": number 0..100 (how likely the text was AI-generated),
  "originality": number 0..100 (how original and distinctive the writing is),
  "verdict": short verdict max 8 words, e.g. "Likely human, with generic passages",
  "summary": 1-2 sentences explaining the assessment in plain language,
  "passages": up to 6 items: { "text": exact substring copied verbatim from the input (max 140 chars), "type": "ai-pattern" | "boilerplate" | "original", "reason": short explanation max 12 words }
}
Include at least one "original" passage when something genuinely distinctive exists. Be honest: this is a stylistic analysis, not a database comparison.`;

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return corsJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 80) {
    return corsJson(
      { error: "Please provide at least 80 characters so the analysis is meaningful." },
      { status: 400 }
    );
  }
  if (text.length > MAX_CHECK_CHARS) {
    return corsJson(
      { error: `Text must be ${MAX_CHECK_CHARS} characters or fewer.` },
      { status: 400 }
    );
  }

  if (!isAnalysisConfigured()) {
    return corsJson(
      { error: "No AI provider is configured on this server." },
      { status: 503 }
    );
  }

  try {
    const raw = await completeJson<{
      aiLikelihood?: unknown;
      originality?: unknown;
      verdict?: unknown;
      summary?: unknown;
      passages?: unknown;
    }>({ system: SYSTEM_PROMPT, user: text, maxTokens: 900 });

    const clampPct = (n: unknown) =>
      Math.min(100, Math.max(0, Math.round(typeof n === "number" ? n : 0)));

    const passages: OriginalityPassage[] = Array.isArray(raw.passages)
      ? raw.passages
          .filter(
            (p): p is { text: string; type: string; reason: string } =>
              p &&
              typeof p.text === "string" &&
              typeof p.reason === "string" &&
              ["ai-pattern", "boilerplate", "original"].includes(p.type)
          )
          .slice(0, 6)
          .map((p) => ({
            text: p.text,
            type: p.type as OriginalityPassage["type"],
            reason: p.reason,
          }))
      : [];

    const result: OriginalityResult = {
      aiLikelihood: clampPct(raw.aiLikelihood),
      originality: clampPct(raw.originality),
      verdict: typeof raw.verdict === "string" ? raw.verdict : "Analysis complete",
      summary: typeof raw.summary === "string" ? raw.summary : "",
      passages,
    };
    return corsJson(result);
  } catch (err) {
    console.error("check-originality failed:", err);
    return corsJson({ error: "Originality analysis failed." }, { status: 502 });
  }
}
