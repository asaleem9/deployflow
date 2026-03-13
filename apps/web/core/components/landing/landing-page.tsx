/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { DeployFlowLockup } from "@plane/propel/icons";
import PlaneBackgroundPatternDark from "@/app/assets/auth/background-pattern-dark.svg?url";
import PlaneBackgroundPattern from "@/app/assets/auth/background-pattern.svg?url";

const FEATURES = [
  {
    title: "Smart Contract Lifecycle",
    description:
      "Track work from Specification through Audit, Testnet, and Mainnet deployment with 12 purpose-built states.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "Audit Tracking",
    description:
      "Built-in audit severity labels, audit status fields, and dedicated issue types for security findings.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Multi-Chain Support",
    description:
      "Track deployments across Ethereum, Polygon, Arbitrum, Optimism, Base, and Solana from a single board.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: "Gas Optimization",
    description: "Track gas costs per contract, compare deployment and transaction gas, and optimize before mainnet.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Web3 Project Templates",
    description:
      "Start fast with templates for Smart Contracts, DeFi Protocols, DAOs, NFT Projects, and Cross-Chain Bridges.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Cycles, Modules & Views",
    description:
      "Sprints, feature modules, custom filtered views, pages, and analytics — everything you need to ship.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function LandingPage() {
  const { resolvedTheme } = useTheme();
  const patternBackground = resolvedTheme === "dark" ? PlaneBackgroundPatternDark : PlaneBackgroundPattern;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-surface-1">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img src={patternBackground} className="h-full w-full object-cover opacity-50" alt="" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <DeployFlowLockup height={28} width={160} className="text-primary" />
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-tertiary transition-colors hover:text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#627EEA] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-16 pb-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-1 bg-surface-2 px-4 py-1.5 text-xs font-medium text-tertiary">
          <span className="inline-block h-2 w-2 rounded-full bg-[#627EEA]" />
          Project management built for web3 teams
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-primary sm:text-6xl">
          Ship on-chain
          <br />
          <span className="text-[#627EEA]">with confidence</span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-tertiary">
          DeployFlow is the project management tool built for blockchain teams.
          Track smart contracts from specification to mainnet, manage audits,
          and coordinate multi-chain deployments — all in one place.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#627EEA] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#627EEA]/25 transition-all hover:shadow-xl hover:shadow-[#627EEA]/30 hover:opacity-95"
          >
            Start for free
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-border-1 bg-surface-1 px-8 py-3 text-base font-semibold text-primary transition-colors hover:bg-surface-2"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-primary">
            Built for the way web3 teams work
          </h2>
          <p className="text-base text-tertiary">
            Every feature designed around smart contract development, auditing, and deployment workflows.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border-1 bg-surface-1 p-6 transition-all hover:border-[#627EEA]/30 hover:shadow-lg hover:shadow-[#627EEA]/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#627EEA]/10 text-[#627EEA] transition-colors group-hover:bg-[#627EEA]/15">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-primary">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-tertiary">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24 text-center">
        <div className="rounded-2xl border border-[#627EEA]/20 bg-[#627EEA]/5 px-8 py-12">
          <h2 className="mb-3 text-2xl font-bold text-primary">Ready to build?</h2>
          <p className="mb-8 text-base text-tertiary">
            Create your workspace and start managing your web3 projects in minutes.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#627EEA] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#627EEA]/25 transition-all hover:opacity-95"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-1 py-8 text-center text-sm text-placeholder">
        <p>DeployFlow — Web3 project management</p>
      </footer>
    </div>
  );
}
