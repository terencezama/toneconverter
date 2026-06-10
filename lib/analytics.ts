type AnalyticsEvent =
  | "convert"
  | "convert_success"
  | "convert_error"
  | "copy"
  | "regenerate";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(
  event: AnalyticsEvent,
  meta: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;
  const payload = { event, ...meta, ts: Date.now() };
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  } else if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", payload);
  }
}
