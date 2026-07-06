/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

const STORAGE_KEY = "deployflow:reduce-motion";

/**
 * True when motion should be suppressed: either the OS `prefers-reduced-motion`
 * signal is set, or the user turned motion off in DeployFlow settings (persisted
 * to localStorage). Every motion hook checks this and collapses to the final
 * state instantly rather than tweening.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true; // SSR: never animate
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {
    // localStorage may be unavailable (private mode); fall through to the media query.
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Persist the user's motion preference. `true` disables all DeployFlow motion. */
export function setReduceMotion(disabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (disabled) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore write failures
  }
}
