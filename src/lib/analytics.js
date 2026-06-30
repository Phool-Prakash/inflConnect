/** Client-side GA4 event helpers (no-op when gtag is unavailable). */

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

export function trackOnboardSubmitAttempt() {
  trackEvent("onboard_submit_attempt");
}

export function trackOnboardSubmitSuccess() {
  trackEvent("onboard_submit_success");
}

export function trackOnboardSubmitError(errorMessage) {
  trackEvent("onboard_submit_error", {
    error_message: String(errorMessage || "unknown").slice(0, 200),
  });
}

export function trackPageView(path) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", { page_path: path });
}
