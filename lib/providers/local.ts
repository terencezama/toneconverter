import type { ConvertParams, ToneProvider } from "./types";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export const localProvider: ToneProvider = {
  id: "local",
  label: "Local model",

  isConfigured() {
    return Boolean(BACKEND_URL);
  },

  async convert({ text, tone, length }: ConvertParams) {
    const res = await fetch(`${BACKEND_URL}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone, length }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `Local backend error (${res.status}): ${detail || res.statusText}`
      );
    }
    const data = (await res.json()) as { result?: string };
    if (!data.result) throw new Error("Local backend returned an empty result.");
    return data.result;
  },
};
