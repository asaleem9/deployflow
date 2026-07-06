/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef } from "react";
import { gsap, useGSAP } from "../setup";
import { prefersReducedMotion } from "../reduced-motion";

/**
 * Slow, endless drift for an aurora/gradient-mesh background element. Animates
 * background-position and a gentle scale so the mesh feels alive without ever
 * demanding attention. Static under reduced-motion. Attach the returned ref to
 * the element carrying the `bg-gradient-aurora` layer.
 */
export function useAurora<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(el, { backgroundPosition: "30% 20%", scale: 1.08, duration: 18, ease: "sine.inOut" }).to(el, {
        backgroundPosition: "70% 60%",
        scale: 1.0,
        duration: 22,
        ease: "sine.inOut",
      });
    },
    { scope: ref }
  );

  return ref;
}
