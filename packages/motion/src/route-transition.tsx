/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useLocation, useOutlet } from "react-router";
import { useRef } from "react";
import { gsap, useGSAP } from "./setup";
import { prefersReducedMotion } from "./reduced-motion";

/**
 * Cross-fade + rise transition for the routed content pane in a React Router v7
 * SPA. Mount this INSTEAD of a bare <Outlet /> at the content-pane level only —
 * never around the persistent app shell, so the sidebar/topbar never re-animate
 * on navigation. Under reduced-motion it renders the outlet with no animation.
 *
 * It animates on each pathname change by keying a wrapper; GSAP tweens the
 * wrapper's opacity/transform on mount.
 */
export function TransitionOutlet() {
  const outlet = useOutlet();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform" }
      );
    },
    { dependencies: [location.pathname], scope: ref }
  );

  return (
    <div ref={ref} className="h-full w-full" key={location.pathname}>
      {outlet}
    </div>
  );
}
