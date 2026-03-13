import * as React from "react";

import type { ISvgIcons } from "../type";

export function DeployFlowLockup({ width = "160", height = "24", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ethereum diamond icon */}
      <path d="M8 1L2 12L8 9V1Z" fill={color} opacity="0.6" />
      <path d="M8 1L14 12L8 9V1Z" fill={color} opacity="0.8" />
      <path d="M8 16L2 12L8 9V16Z" fill={color} opacity="0.6" />
      <path d="M8 16L14 12L8 9V16Z" fill={color} opacity="0.8" />
      <path d="M8 17.5L2 13.5L8 23V17.5Z" fill={color} opacity="0.6" />
      <path d="M8 17.5L14 13.5L8 23V17.5Z" fill={color} opacity="0.8" />
      {/* "DeployFlow" text */}
      <text
        x="20"
        y="17"
        fill={color}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        DeployFlow
      </text>
    </svg>
  );
}
