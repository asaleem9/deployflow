/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useAurora } from "../hooks/use-aurora";

type AuroraBackgroundProps = {
  className?: string;
};

/**
 * Full-bleed animated aurora mesh for expressive surfaces (auth, onboarding,
 * dashboards, empty states). Renders the `bg-gradient-aurora` token layer over
 * the dark canvas and drifts it slowly via useAurora. Purely decorative, so it
 * is aria-hidden and sits behind content with negative z-index.
 */
export function AuroraBackground({ className = "" }: AuroraBackgroundProps) {
  const ref = useAurora<HTMLDivElement>();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 bg-canvas bg-gradient-aurora ${className}`}
      style={{ backgroundSize: "160% 160%", backgroundPosition: "50% 40%" }}
    />
  );
}
