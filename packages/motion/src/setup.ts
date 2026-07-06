/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/**
 * Register the GSAP plugin set exactly once. Safe to call on every module load
 * (client and server) — it no-ops after the first run and does nothing when
 * `window` is absent, so importing motion helpers never breaks SSR.
 *
 * Call this from the app's client entry (entry.client.tsx) before hydration.
 */
export function setupMotion(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;

  gsap.registerPlugin(useGSAP, Flip, ScrollTrigger, SplitText);

  // Global defaults, aligned with the --motion-*/--ease-* design tokens so
  // motion timing stays consistent with the token layer.
  gsap.defaults({ ease: "power3.out", duration: 0.32 });
}

/** Milliseconds for a named motion token, with a sensible fallback. */
export function motionDuration(token: "instant" | "fast" | "base" | "slow"): number {
  const fallbacks = { instant: 120, fast: 200, base: 320, slow: 600 };
  if (typeof window === "undefined") return fallbacks[token];
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--motion-${token}`).trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallbacks[token];
}

export { gsap, useGSAP, Flip, ScrollTrigger, SplitText };
