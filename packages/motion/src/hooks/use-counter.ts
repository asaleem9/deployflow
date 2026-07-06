/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef } from "react";
import { gsap, useGSAP } from "../setup";
import { prefersReducedMotion } from "../reduced-motion";

type CounterOptions = {
  /** Seconds the count-up takes. */
  duration?: number;
  /** Decimal places to render. */
  decimals?: number;
  /** Optional formatter (e.g. thousands separators, currency). */
  format?: (value: number) => string;
};

/**
 * Animate a numeric ticker from 0 to `value`. Writes textContent directly (no
 * React re-render per frame). Under reduced-motion it snaps to the final value.
 * Returns a ref to attach to the element that should display the number.
 */
export function useCounter<T extends HTMLElement = HTMLSpanElement>(value: number, options: CounterOptions = {}) {
  const { duration = 1.1, decimals = 0, format } = options;
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const render = (n: number) => {
        el.textContent = format ? format(n) : n.toFixed(decimals);
      };

      if (prefersReducedMotion()) {
        render(value);
        return;
      }

      const state = { n: 0 };
      gsap.to(state, {
        n: value,
        duration,
        ease: "power2.out",
        onUpdate: () => render(state.n),
      });
    },
    { dependencies: [value], scope: ref }
  );

  return ref;
}
