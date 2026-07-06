/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/**
 * DeployFlow horizontal lockup: the chevron-hexagon mark (brand gradient) plus
 * the "DeployFlow" wordmark (inherits currentColor so it adapts to the theme).
 * Export name kept as PlaneLockup so upstream import sites remain unchanged.
 */
export function PlaneLockup({ width = "210", height = "44", className, color = "currentColor" }: ISvgIcons) {
  const gid = React.useId();
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 210 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DeployFlow"
    >
      <defs>
        <linearGradient id={`${gid}-mark`} x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5CFF" />
          <stop offset="0.5" stopColor="#A855F7" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* mark */}
      <g transform="translate(2 2) scale(0.078)">
        <path
          d="M256 40 L432 138 Q448 147 448 165 L448 347 Q448 365 432 374 L256 472 L80 374 Q64 365 64 347 L64 165 Q64 147 80 138 Z"
          fill={`url(#${gid}-mark)`}
        />
        <g fill="none" stroke="#ffffff" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
          <path d="M168 176 L250 256 L168 336" opacity="0.55" />
          <path d="M238 176 L320 256 L238 336" opacity="0.8" />
          <path d="M308 176 L390 256 L308 336" />
        </g>
      </g>
      {/* wordmark */}
      <text
        x="50"
        y="29"
        fill={color}
        fontFamily="'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="-0.5"
      >
        DeployFlow
      </text>
    </svg>
  );
}
