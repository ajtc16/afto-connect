import type { EventType } from "@/types/db";

/**
 * Client-side event tracker. Fire-and-forget: never blocks the UI and never
 * throws into the render path. Source/campaign are read from the URL.
 */
export function trackEvent(
  slug: string,
  type: EventType,
  extra?: { source?: string | null; campaign?: string | null }
): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      slug,
      type,
      source: extra?.source ?? params.get("src") ?? params.get("source"),
      campaign: extra?.campaign ?? params.get("campaign"),
      referrer: document.referrer || null,
    });

    // sendBeacon survives navigation (important for click-through events).
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/events", { method: "POST", body, keepalive: true });
    }
  } catch {
    // Analytics must never break the visitor experience.
  }
}
