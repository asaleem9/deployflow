/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// engine
export { setupMotion, motionDuration, gsap, useGSAP, Flip, ScrollTrigger, SplitText } from "./setup";
export { prefersReducedMotion, setReduceMotion } from "./reduced-motion";

// hooks
export { useReveal } from "./hooks/use-reveal";
export { useCounter } from "./hooks/use-counter";
export { useAurora } from "./hooks/use-aurora";
export { useMagnetic } from "./hooks/use-magnetic";
export { useSplitReveal } from "./hooks/use-split-reveal";

// components
export { TransitionOutlet } from "./route-transition";
export { AuroraBackground } from "./components/aurora-background";
