/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef } from "react";
import { gsap, useGSAP } from "../setup";
import { prefersReducedMotion } from "../reduced-motion";

type RevealOptions = {
  /** Selector for the children to stagger in. Defaults to direct element children. */
  selector?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Vertical offset (px) each child rises from. */
  y?: number;
  /** Delay (seconds) before the sequence starts. */
  delay?: number;
};

/**
 * Stagger a container's children in with a subtle rise + fade. Transform/opacity
 * only, so it is cheap enough for lists. Collapses to the final state instantly
 * under reduced-motion. Returns a ref to attach to the container.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options: RevealOptions = {}) {
  const { selector, stagger = 0.06, y = 12, delay = 0 } = options;
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const container = scope.current;
      if (!container) return;
      const targets = selector ? container.querySelectorAll(selector) : container.children;
      if (!targets || (targets as ArrayLike<Element>).length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger, delay, clearProps: "transform" }
      );
    },
    { scope }
  );

  return scope;
}
