import { buildSystemPrompt } from "./prompt";
import type { ConvertParams, ToneProvider } from "./types";

export const openaiProvider: ToneProvider = {
  id: "openai",
  label: "OpenAI",

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  },

  async convert(params: ConvertParams) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI is not configured.");
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenAI error (${res.status}): ${detail || res.statusText}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const result = data.choices?.[0]?.message?.content?.trim();
    if (!result) throw new Error("OpenAI returned an empty result.");
    return result;
  },
};
