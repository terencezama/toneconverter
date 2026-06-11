/**
 * Generic JSON-mode completion used by the emotion analyzer and the
 * originality checker. Picks the first configured provider:
 * OpenAI -> Anthropic -> OpenRouter.
 */

type CompletionParams = {
  system: string;
  user: string;
  maxTokens?: number;
};

async function completeOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  { system, user, maxTokens }: CompletionParams
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: maxTokens ?? 1024,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LLM error (${res.status}): ${detail || res.statusText}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("LLM returned an empty result.");
  return content;
}

async function completeAnthropic(
  apiKey: string,
  { system, user, maxTokens }: CompletionParams
): Promise<string> {
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
      max_tokens: maxTokens ?? 1024,
      system: `${system}\nRespond with ONLY a valid JSON object, no markdown fences.`,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude error (${res.status}): ${detail || res.statusText}`);
  }
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const content = data.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();
  if (!content) throw new Error("Claude returned an empty result.");
  return content;
}

export function isAnalysisConfigured(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENROUTER_API_KEY
  );
}

/** Run a JSON-mode completion and parse the result. */
export async function completeJson<T>(params: CompletionParams): Promise<T> {
  let raw: string;
  if (process.env.OPENAI_API_KEY) {
    raw = await completeOpenAICompatible(
      "https://api.openai.com/v1/chat/completions",
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      params
    );
  } else if (process.env.ANTHROPIC_API_KEY) {
    raw = await completeAnthropic(process.env.ANTHROPIC_API_KEY, params);
  } else if (process.env.OPENROUTER_API_KEY) {
    raw = await completeOpenAICompatible(
      "https://openrouter.ai/api/v1/chat/completions",
      process.env.OPENROUTER_API_KEY,
      process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.2-3b-instruct:free",
      params
    );
  } else {
    throw new Error("No LLM provider is configured on this server.");
  }

  // Strip markdown fences some models insist on adding.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("LLM did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
