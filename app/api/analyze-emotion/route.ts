import { corsJson, corsPreflight } from "@/lib/cors";
import { analyzeHeuristic } from "@/lib/emotion/heuristic";
import { detectTones, isToneId, parseToneList } from "@/lib/emotion/toneDetect";
import { suggestionForEmotion } from "@/lib/emotion/toneSuggestions";
import { EMOTIONS, isEmotionId, type EmotionAnalysis } from "@/lib/emotion/types";
import { completeJson, isAnalysisConfigured } from "@/lib/providers/analysis";
import { MAX_CHARS, TONES } from "@/lib/tones";

const VALID_TONES = new Set<string>(TONES.map((t) => t.id));

const SYSTEM_PROMPT = `You are the emotion engine of Tone Converter, a writing assistant.
Analyze the emotional tone AND writing style of the user's text (email, chat, or any writing).
Reply with ONLY a JSON object with these exact keys:
{
  "emotion": one of ${JSON.stringify(EMOTIONS)},
  "intensity": number 0..1 (how strongly the emotion comes through),
  "messiness": number 0..1 (how unstructured, rambling, or chaotic the writing is),
  "detectedTones": array of 0-3 tone ids from ${JSON.stringify([...VALID_TONES])} that the text currently reads as (e.g. "professional", "casual", "confident"),
  "primaryTone": dominant tone id from that list, or null,
  "summary": short empathetic read max 14 words, e.g. "This reads angry — try Professional or Calm.",
  "suggestion": null, or { "label": short call-to-action max 5 words e.g. "Make it professional", "tone": one of ${JSON.stringify([...VALID_TONES])} }
}
Angry/frustrated text should suggest professional, calm, or polite tones. Messy text should suggest clearer.
Only suggest a rewrite when it would genuinely help. For text already clear and appropriate, set suggestion to null.`;

function clamp01(n: unknown): number {
  const v = typeof n === "number" ? n : 0;
  return Math.min(1, Math.max(0, v));
}

function heuristicAnalysis(text: string): EmotionAnalysis {
  const heuristic = analyzeHeuristic(text);
  const toneRead = detectTones(text, heuristic);
  const suggestion = suggestionForEmotion(heuristic);
  return {
    ...heuristic,
    summary: "",
    suggestion,
    detectedTones: toneRead.tones,
    primaryTone: toneRead.primary,
  };
}

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
  if (!text) {
    return corsJson({ error: "Text is required." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return corsJson(
      { error: `Text must be ${MAX_CHARS} characters or fewer.` },
      { status: 400 }
    );
  }

  if (!isAnalysisConfigured()) {
    return corsJson(heuristicAnalysis(text));
  }

  try {
    const raw = await completeJson<{
      emotion?: unknown;
      intensity?: unknown;
      messiness?: unknown;
      detectedTones?: unknown;
      primaryTone?: unknown;
      summary?: unknown;
      suggestion?: { label?: unknown; tone?: unknown } | null;
    }>({ system: SYSTEM_PROMPT, user: text, maxTokens: 360 });

    const detectedTones = parseToneList(raw.detectedTones);
    const suggestion =
      raw.suggestion &&
      typeof raw.suggestion.label === "string" &&
      typeof raw.suggestion.tone === "string" &&
      VALID_TONES.has(raw.suggestion.tone)
        ? { label: raw.suggestion.label, tone: raw.suggestion.tone }
        : null;

    const heuristic = analyzeHeuristic(text);
    const fallbackTones = detectTones(text, heuristic);

    const analysis: EmotionAnalysis = {
      emotion: isEmotionId(raw.emotion) ? raw.emotion : "neutral",
      intensity: clamp01(raw.intensity),
      messiness: clamp01(raw.messiness),
      summary: typeof raw.summary === "string" ? raw.summary : "",
      suggestion,
      detectedTones: detectedTones.length ? detectedTones : fallbackTones.tones,
      primaryTone: isToneId(raw.primaryTone)
        ? raw.primaryTone
        : detectedTones[0] ?? fallbackTones.primary,
    };
    return corsJson(analysis);
  } catch (err) {
    console.error("analyze-emotion failed:", err);
    return corsJson({ error: "Emotion analysis failed." }, { status: 502 });
  }
}
