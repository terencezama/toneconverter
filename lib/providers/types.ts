export type ConvertParams = {
  text: string;
  tone: string;
  length: "normal" | "shorter" | "longer";
};

export interface ToneProvider {
  id: string;
  label: string;
  isConfigured(): boolean;
  convert(params: ConvertParams): Promise<string>;
}
