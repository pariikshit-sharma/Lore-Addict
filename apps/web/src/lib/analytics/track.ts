"use client";

const SESSION_KEY = "lore-addict:session-id";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export type TrackableEvent = "view" | "scroll_25" | "scroll_75" | "share" | "bookmark";

export function trackEvent(articleId: string, eventType: TrackableEvent): void {
  const payload = JSON.stringify({
    articleId,
    eventType,
    sessionId: getSessionId(),
  });

  // sendBeacon survives the page unloading (important for events fired
  // right as someone navigates away); fetch with keepalive is the
  // fallback where sendBeacon isn't available.
  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(
      "/api/analytics/ingest",
      new Blob([payload], { type: "application/json" }),
    );
    return;
  }

  fetch("/api/analytics/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Losing a single analytics event is never worth surfacing to the
    // reader — this is a metrics pipeline, not a user-facing feature.
  });
}
