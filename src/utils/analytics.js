/**
 * Google Analytics 4 helpers.
 * All functions are no-ops when GA hasn't loaded (dev mode / no measurement ID).
 */

function gtag(...args) {
  if (typeof window.gtag === 'function') window.gtag(...args)
}

/** Track a page view (call on route change) */
export function trackPageView(path) {
  gtag('event', 'page_view', { page_path: path })
}

/** Low-level event — prefer the named helpers below */
export function trackEvent(name, params = {}) {
  gtag('event', name, params)
}

/** Named tracking events — these show up as custom events in GA4 */
export const track = {
  // ── Deck generation ───────────────────────────────────────────────
  // Succeeded: include how long the AI call took so we can watch p95 latency.
  deckGenerated: (stage, mode, durationMs) =>
    trackEvent('deck_generated', { stage, input_mode: mode, duration_ms: durationMs }),
  // Failed: without this, a broken API key looks like "no traffic" in GA.
  deckGenerateFailed: (stage, mode, errorMessage, durationMs) =>
    trackEvent('deck_generate_failed', { stage, input_mode: mode, error_message: errorMessage, duration_ms: durationMs }),

  // ── Deck rating ───────────────────────────────────────────────────
  deckRated: (stage, durationMs) =>
    trackEvent('deck_rated', { stage, duration_ms: durationMs }),
  deckRateFailed: (stage, errorMessage, durationMs) =>
    trackEvent('deck_rate_failed', { stage, error_message: errorMessage, duration_ms: durationMs }),

  // ── Market research ───────────────────────────────────────────────
  researchQuery: () =>
    trackEvent('research_query'),
  researchSucceeded: (durationMs, usedWebSearch) =>
    trackEvent('research_succeeded', { duration_ms: durationMs, used_web_search: !!usedWebSearch }),
  researchFailed: (errorMessage, durationMs) =>
    trackEvent('research_failed', { error_message: errorMessage, duration_ms: durationMs }),

  // ── Create-flow funnel ────────────────────────────────────────────
  // User selected a mode on the Create page (Quick Text vs Condensed Form)
  modeSelected: (mode) =>
    trackEvent('mode_selected', { mode }),
  // User completed a step of the condensed form — reveals where people drop off
  formStepCompleted: (step) =>
    trackEvent('form_step_completed', { step }),

  // ── Export (the activation "aha" moment) ──────────────────────────
  // Attempt — fires when the user clicks an export option
  deckExported: (method) =>
    trackEvent('deck_exported', { method }),
  // Succeeded — the file actually downloaded (export can throw mid-way)
  deckExportSucceeded: (method, durationMs) =>
    trackEvent('deck_export_succeeded', { method, duration_ms: durationMs }),
  // Failed — caught export error; lets us spot a regression in the wild
  deckExportFailed: (method, errorMessage) =>
    trackEvent('deck_export_failed', { method, error_message: errorMessage }),
}
