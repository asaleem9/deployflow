/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ShieldCheck,
  GitBranch,
  Radio,
  Wallet,
  Trophy,
  Rocket,
  Github,
} from "lucide-react";
import { gsap, useGSAP, ScrollTrigger, SplitText, prefersReducedMotion } from "@deployflow/motion";
import { PlaneLockup } from "@plane/propel/icons";

// The contract lifecycle, used both in copy and the scroll-scrubbed pipeline.
const STAGES = ["Develop", "Test", "Audit", "Deploy", "Verify"];

const CHAINS = [
  { name: "Ethereum", color: "#627EEA" },
  { name: "Base", color: "#0052FF" },
  { name: "Arbitrum", color: "#28A0F0" },
  { name: "Optimism", color: "#FF0420" },
  { name: "Polygon", color: "#8247E5" },
];

const FEATURES = [
  {
    icon: GitBranch,
    title: "Contract lifecycle",
    body: "Track every contract from first commit to verified mainnet deploy — per network, per version, with addresses and gas built in.",
  },
  {
    icon: ShieldCheck,
    title: "Audit pipeline",
    body: "Severity-graded findings become real work items in one click. Critical maps to urgent. Nothing slips.",
  },
  {
    icon: Radio,
    title: "On-chain, live",
    body: "Deployment receipts, verification status, and gas prices sync straight from the chain via Etherscan and your RPC.",
  },
  {
    icon: Wallet,
    title: "Sign in with your wallet",
    body: "Full EIP-4361 Sign-In With Ethereum, next to email and OAuth. Your keys, your session.",
  },
  {
    icon: Trophy,
    title: "Bounties, settled on-chain",
    body: "Attach rewards to work items. Payouts are recorded by transaction and verified against the chain.",
  },
  {
    icon: Rocket,
    title: "Launch planning",
    body: "Plan TGEs, airdrops, and IDOs with supply, allocation breakdowns, and the tasks that get you there.",
  },
];

type LandingProps = {
  /** Kicks off the anonymous demo session. */
  onTryDemo: () => void;
  demoLoading?: boolean;
  /** When the visitor is already signed in, the nav offers "Open app" instead. */
  isAuthenticated?: boolean;
  /** Where "Open app" points (their last workspace, or create-workspace). */
  appHref?: string;
};

export function Landing({ onTryDemo, demoLoading, isAuthenticated = false, appHref = "/" }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const [navSolid, setNavSolid] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // --- hero headline: split into chars and rise in ---
      const heading = root.current?.querySelector<HTMLElement>("[data-hero-heading]");
      if (heading) {
        const split = new SplitText(heading, { type: "chars, words" });
        gsap.from(split.chars, {
          yPercent: 120,
          opacity: 0,
          rotateX: -40,
          stagger: 0.018,
          duration: 0.9,
          ease: "power4.out",
          delay: 0.15,
        });
      }

      // --- hero: eyebrow, sub, ctas, card float in after headline ---
      gsap.from("[data-hero-fade]", {
        y: 26,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.6,
      });
      // subtle scroll parallax on the hero panel (finite — no idle-blocking loop)
      gsap.to("[data-hero-card]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: "[data-hero-card]", start: "top 70%", end: "bottom top", scrub: 0.8 },
      });

      // --- nav glass intensifies after scrolling past the hero fold ---
      ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => setNavSolid(self.scroll() > 80),
      });

      // --- pipeline: scrub the progress line + light up each stage ---
      const line = root.current?.querySelector<HTMLElement>("[data-pipeline-line]");
      if (line) {
        gsap.to(line, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-pipeline]",
            start: "top 65%",
            end: "bottom 70%",
            scrub: 0.6,
          },
        });
      }
      gsap.utils.toArray<HTMLElement>("[data-stage]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0.25, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: "[data-pipeline]", start: `top ${60 - i * 6}%`, toggleActions: "play none none reverse" },
          }
        );
      });

      // --- feature cards: batch reveal as they enter ---
      ScrollTrigger.batch("[data-feature]", {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.from(batch, { y: 40, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out", overwrite: true }),
      });

      // --- stat counters ---
      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.counter || "0");
        const obj = { n: 0 };
        gsap.to(obj, {
          n: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.n).toLocaleString();
          },
        });
      });

      // --- section headings rise on enter ---
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // --- CTA aurora parallax ---
      gsap.to("[data-cta-glow]", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative min-h-screen overflow-x-hidden bg-canvas text-primary">
      {/* ===== atmosphere ===== */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-aurora" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--border-strong) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ===== nav ===== */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          navSolid ? "glass-2 border-b border-subtle" : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <PlaneLockup height={28} width={132} className="text-primary" />
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={appHref}
                className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-cta px-4 py-2 text-body-sm-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.03]"
              >
                Open app
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="hidden rounded-lg px-4 py-2 text-body-sm-medium text-secondary transition-colors hover:text-primary sm:block"
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={onTryDemo}
                  disabled={demoLoading}
                  className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-cta px-4 py-2 text-body-sm-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.03] disabled:opacity-70"
                >
                  {demoLoading ? "Loading demo…" : "Try live demo"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ===== hero ===== */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-40 pb-24 text-center">
        <div
          data-hero-fade
          className="mb-8 flex items-center gap-3 font-mono text-caption-sm-regular uppercase tracking-[0.25em] text-tertiary"
        >
          <span className="h-px w-10 bg-accent-primary" />
          Web3-native project management
          <span className="h-px w-10 bg-accent-primary" />
        </div>
        <h1
          data-hero-heading
          className="max-w-4xl font-heading text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-tight"
        >
          Ship contracts,
          <br />
          <span className="text-gradient-brand">not chaos.</span>
        </h1>
        <p data-hero-fade className="mt-6 max-w-xl text-body-lg-regular text-secondary">
          DeployFlow tracks your smart contracts from first commit to verified mainnet deploy — audits, on-chain data,
          wallet sign-in, and bounties, in one workspace.
        </p>
        <div data-hero-fade className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onTryDemo}
            disabled={demoLoading}
            className="group inline-flex items-center gap-2 rounded-md bg-gradient-cta px-6 py-3.5 text-body-md-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.03] disabled:opacity-70"
          >
            {demoLoading ? "Loading demo…" : "Explore the live demo"}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            to="/sign-in"
            className="rounded-md border border-strong bg-layer-1 px-6 py-3.5 text-body-md-medium text-primary transition-colors hover:bg-layer-1-hover"
          >
            Get started free
          </Link>
        </div>

        {/* contract card mock — a terminal/spec panel, not a glass bubble */}
        <div data-hero-fade className="mt-16 w-full max-w-2xl">
          <div data-hero-card className="rounded-md border border-strong bg-surface-1/80 backdrop-blur-xl">
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-subtle px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-caption-sm-regular text-secondary">
                <span className="text-accent-primary">▸</span>
                VaultManager.sol
              </div>
              <span className="border border-success-strong/40 bg-success-subtle px-2 py-0.5 font-mono text-caption-xs-medium uppercase tracking-wider text-success-primary">
                verified
              </span>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between font-mono text-caption-sm-regular text-tertiary">
                <span>0x742d…f44e</span>
                <span>base · 0.005 gwei</span>
              </div>
              <div className="mt-4 flex gap-0.5">
                {STAGES.map((s, i) => (
                  <div key={s} className={`h-1 flex-1 ${i < 4 ? "bg-gradient-brand" : "bg-layer-1"}`} />
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-caption-xs-regular uppercase tracking-wider text-tertiary">
                {STAGES.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* chain strip — a technical row, square chips */}
        <div data-hero-fade className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <span className="font-mono text-caption-xs-regular uppercase tracking-[0.25em] text-tertiary">
            EVM-native /
          </span>
          {CHAINS.map((c) => (
            <span key={c.name} className="flex items-center gap-2 font-mono text-caption-sm-regular text-secondary">
              <span className="size-2" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
      </section>

      {/* ===== pipeline (scroll-scrubbed) ===== */}
      <section data-pipeline className="relative mx-auto max-w-5xl px-6 py-28">
        <h2 data-reveal className="text-center font-heading text-h2-semibold">
          One pipeline, first commit to mainnet
        </h2>
        <p data-reveal className="mx-auto mt-3 max-w-lg text-center text-body-md-regular text-secondary">
          Every contract moves through the same ordered lifecycle — and DeployFlow keeps the chain in sync at each step.
        </p>
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-6 h-0.5 rounded-full bg-layer-1" />
          <div
            data-pipeline-line
            className="absolute left-0 right-0 top-6 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-brand"
          />
          <div className="relative grid grid-cols-5 gap-2">
            {STAGES.map((s, i) => (
              <div key={s} data-stage className="flex flex-col items-center gap-3 text-center">
                <span className="grid size-12 place-items-center border border-strong bg-surface-1 font-mono text-body-md-semibold text-primary shadow-glow-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-caption-sm-regular uppercase tracking-wider text-primary">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== features — a numbered spec-sheet grid, hairline rules ===== */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div data-reveal className="flex items-end justify-between border-b border-subtle pb-6">
          <h2 className="max-w-xl font-heading text-h2-semibold">Everything a Web3 team actually needs.</h2>
          <span className="hidden font-mono text-caption-xs-regular uppercase tracking-[0.25em] text-tertiary sm:block">
            06 capabilities
          </span>
        </div>
        <div className="grid grid-cols-1 border-l border-subtle sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              data-feature
              className="group relative border-b border-r border-subtle p-8 transition-colors hover:bg-surface-1"
            >
              <div className="flex items-center justify-between">
                <f.icon className="size-6 text-accent-primary" />
                <span className="font-mono text-caption-sm-regular text-tertiary">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-heading text-body-lg-semibold">{f.title}</h3>
              <p className="mt-2 text-body-sm-regular text-secondary">{f.body}</p>
              {/* accent rule that grows on hover */}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-brand transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== stats — a hairline-divided strip, not a rounded glass box ===== */}
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 divide-subtle border-y border-subtle md:grid-cols-4 md:divide-x">
          {[
            { n: 10, label: "EVM networks", suffix: "" },
            { n: 5, label: "Lifecycle stages", suffix: "" },
            { n: 100, label: "Open source", suffix: "%" },
            { n: 0, label: "Vendor lock-in", suffix: "" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-10">
              <div className="font-heading text-h1-semibold text-gradient-brand">
                <span data-counter={s.n}>0</span>
                {s.suffix}
              </div>
              <div className="mt-1 font-mono text-caption-xs-regular uppercase tracking-wider text-tertiary">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section data-cta className="relative mx-auto max-w-5xl overflow-hidden px-6 py-32 text-center">
        <div
          data-cta-glow
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-brand opacity-20 blur-[120px]"
        />
        <h2 data-reveal className="mx-auto max-w-2xl font-heading text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight">
          Start shipping with a workspace built for the chain.
        </h2>
        <div data-reveal className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onTryDemo}
            disabled={demoLoading}
            className="group inline-flex items-center gap-2 rounded-md bg-gradient-cta px-7 py-4 text-body-md-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.03] disabled:opacity-70"
          >
            {demoLoading ? "Loading demo…" : "Open the live demo"}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            to="/sign-in"
            className="rounded-md border border-strong bg-layer-1 px-7 py-4 text-body-md-medium text-primary transition-colors hover:bg-layer-1-hover"
          >
            Create an account
          </Link>
        </div>
      </section>

      {/* ===== footer ===== */}
      <footer className="relative border-t border-subtle">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <PlaneLockup height={22} width={104} className="text-secondary" />
          <p className="text-caption-sm-regular text-tertiary">
            Open source under AGPL-3.0 · not affiliated with Plane
          </p>
          <a
            href="https://github.com/asaleem9/deployflow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-caption-sm-medium text-secondary transition-colors hover:text-primary"
          >
            <Github className="size-4" /> Source code
          </a>
        </div>
      </footer>
    </div>
  );
}
