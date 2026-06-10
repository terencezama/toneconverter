import { buildSystemPrompt } from "./prompt";
import type { ConvertParams, ToneProvider } from "./types";

export const openrouterProvider: ToneProvider = {
  id: "openrouter",
  label: "Llama 3.2 (OpenRouter)",

  isConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
  },

  async convert(params: ConvertParams) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter is not configured.");
    const model =
      process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.2-3b-instruct:free";

    // Free models are frequently rate-limited upstream; retry a few times.
    const MAX_ATTEMPTS = 3;
    let lastError = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildSystemPrompt(params) },
            { role: "user", content: params.text },
          ],
          temperature: 0.7,
        }),
      });

      if (res.status === 429 && attempt < MAX_ATTEMPTS) {
        lastError = await res.text().catch(() => "");
        const retryAfter = Number(res.headers.get("retry-after")) || 20;
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        const hint =
          res.status === 429
            ? " The free model is busy right now - please try again in a moment."
            : "";
        throw new Error(
          `OpenRouter error (${res.status}): ${detail || res.statusText}${hint}`
        );
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const result = data.choices?.[0]?.message?.content?.trim();
      if (!result) throw new Error("OpenRouter returned an empty result.");
      return result;
    }

    throw new Error(`OpenRouter rate-limited after retries: ${lastError}`);
  },
};
