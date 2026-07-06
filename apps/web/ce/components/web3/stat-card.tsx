/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
import { useCounter } from "@deployflow/motion";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  /** Tailwind gradient utility for the card wash, e.g. "bg-gradient-brand". */
  gradient?: string;
  suffix?: string;
};

/**
 * A dashboard stat card with a GSAP count-up. This is a dashboard surface, so it
 * gets the bold treatment — a glass panel over a soft gradient wash with a brand
 * glow. The number tickers up via the motion package (respecting reduced-motion).
 */
export function StatCard({ label, value, icon, gradient = "bg-gradient-brand", suffix }: StatCardProps) {
  const counterRef = useCounter<HTMLSpanElement>(value, { decimals: 0 });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-subtle">
      {/* soft gradient wash behind the glass */}
      <div className={`absolute inset-0 opacity-20 ${gradient}`} aria-hidden="true" />
      <div className="glass-1 relative flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-body-sm-medium text-secondary">{label}</span>
          <span className="text-accent-primary">{icon}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span ref={counterRef} className="font-heading text-h2-semibold text-primary">
            0
          </span>
          {suffix ? <span className="text-body-sm-regular text-tertiary">{suffix}</span> : null}
        </div>
      </div>
    </div>
  );
}
