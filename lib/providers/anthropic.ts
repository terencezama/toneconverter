import { buildSystemPrompt } from "./prompt";
import type { ConvertParams, ToneProvider } from "./types";

export const anthropicProvider: ToneProvider = {
  id: "anthropic",
  label: "Claude",

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async convert(params: ConvertParams) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Claude is not configured.");
    const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: buildSystemPrompt(params),
        messages: [{ role: "user", content: params.text }],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Claude error (${res.status}): ${detail || res.statusText}`);
    }
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const result = data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("")
      .trim();
    if (!result) throw new Error("Claude returned an empty result.");
    return result;
  },
};
