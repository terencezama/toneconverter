import { anthropicProvider } from "./anthropic";
import { localProvider } from "./local";
import { openaiProvider } from "./openai";
import { openrouterProvider } from "./openrouter";
import type { ToneProvider } from "./types";

const PROVIDERS: ToneProvider[] = [
  openaiProvider,
  openrouterProvider,
  localProvider,
  anthropicProvider,
];

export function getProvider(id: string): ToneProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getAvailableProviders(): { id: string; label: string }[] {
  return PROVIDERS.filter((p) => p.isConfigured()).map(({ id, label }) => ({
    id,
    label,
  }));
}

export const DEFAULT_PROVIDER_ID = "openai";
