/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef } from "react";
import { gsap, useGSAP } from "../setup";
import { prefersReducedMotion } from "../reduced-motion";

type MagneticOptions = {
  /** How far the element follows the cursor, 0-1. */
  strength?: number;
};

/**
 * Give an element a subtle magnetic pull toward the cursor on hover — a premium
 * micro-interaction for primary CTAs. Disabled entirely under reduced-motion and
 * on touch (no hover). Attach the returned ref to the interactive element.
 */
export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(options: MagneticOptions = {}) {
  const { strength = 0.35 } = options;
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      if (!window.matchMedia("(hover: hover)").matches) return;

      const move = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
        gsap.to(el, { x, y, duration: 0.4, ease: "power3.out" });
      };
      const reset = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });

      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", reset);
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", reset);
      };
    },
    { scope: ref }
  );

  return ref;
}
