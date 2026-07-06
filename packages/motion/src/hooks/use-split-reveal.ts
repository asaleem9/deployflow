/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "../setup";
import { prefersReducedMotion } from "../reduced-motion";

type SplitRevealOptions = {
  /** Seconds between each word/char. */
  stagger?: number;
  /** Split granularity. */
  by?: "words" | "chars" | "lines";
  /** Delay (seconds) before the reveal. */
  delay?: number;
};

/**
 * Reveal a heading by splitting it into words/chars and rising them in — the
 * signature move for the auth and marketing headlines. Uses GSAP SplitText
 * (free as of GSAP 3.13). Renders the text plainly under reduced-motion. Attach
 * the returned ref to the text element.
 */
export function useSplitReveal<T extends HTMLElement = HTMLHeadingElement>(options: SplitRevealOptions = {}) {
  const { stagger = 0.03, by = "words", delay = 0.1 } = options;
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const split = new SplitText(el, { type: by });
      const targets = by === "chars" ? split.chars : by === "lines" ? split.lines : split.words;

      gsap.fromTo(
        targets,
        { opacity: 0, yPercent: 60 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.5,
          ease: "power4.out",
          stagger,
          delay,
          onComplete: () => split.revert(),
        }
      );

      return () => split.revert();
    },
    { scope: ref }
  );

  return ref;
}
