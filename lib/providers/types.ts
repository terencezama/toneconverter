import type { LengthId, OutcomeId, ToneId } from "../../../shared/tones";

export type ConvertParams = {
  text: string;
  tone: ToneId;
  length: LengthId;
  outcome?: OutcomeId | null;
};

export interface ToneProvider {
  id: string;
  label: string;
  isConfigured(): boolean;
  convert(params: ConvertParams): Promise<string>;
}
