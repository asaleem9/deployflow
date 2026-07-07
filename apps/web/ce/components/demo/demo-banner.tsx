/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router";
import { Sparkles, ArrowRight, Minus, Home } from "lucide-react";
// hooks
import { useUser } from "@/hooks/store/user";
// local
import { isDemoUser, exitDemoTo } from "./demo.utils";

/**
 * A banner shown only while the shared demo account is signed in. It frames the
 * session as a sandbox and gives two intuitive ways out — create a real account,
 * or return to the marketing home — so a demo visitor never has to reason about
 * "signing out" of an account that isn't theirs.
 *
 * The dismiss control MINIMISES to a small chip rather than disappearing, so
 * there's always a visible route back to the demo controls (and to the home
 * page). A solid surface background keeps the text readable over any content
 * that scrolls behind it.
 */
export const DemoModeBanner = observer(function DemoModeBanner() {
  const { data: currentUser } = useUser();
  const [minimized, setMinimized] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (!isDemoUser(currentUser)) return null;

  const go = (destination: string) => {
    if (leaving) return;
    setLeaving(true);
    void exitDemoTo(destination);
  };

  // Minimised: a small always-present chip that reopens the full banner.
  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        title="Demo mode — click for options"
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-accent-subtle bg-surface-2 px-3.5 py-2 text-body-sm-semibold text-primary shadow-glow-brand transition-transform hover:scale-[1.03]"
      >
        <span className="grid size-5 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
          <Sparkles className="size-3" />
        </span>
        Demo mode
      </button>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-accent-subtle bg-surface-2 px-4 py-2 shadow-glow-brand">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm-semibold text-primary">You’re exploring the DeployFlow demo</p>
          <p className="hidden truncate text-caption-sm-regular text-tertiary sm:block">
            Poke around freely — it’s a shared sandbox that resets now and then.
          </p>
        </div>
        {/* Home just navigates to the marketing landing — it keeps the demo
            session, so "Back to the demo" there brings the visitor right back. */}
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm-medium text-secondary transition-colors hover:bg-layer-1-hover hover:text-primary"
        >
          <Home className="size-3.5" />
          Home
        </Link>
        <button
          type="button"
          onClick={() => go("/sign-in")}
          disabled={leaving}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-cta px-3.5 py-1.5 text-body-sm-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-70"
        >
          {leaving ? "…" : "Sign up free"}
          <ArrowRight className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMinimized(true)}
          aria-label="Minimize"
          title="Minimize"
          className="grid size-6 shrink-0 place-items-center rounded-full text-tertiary transition-colors hover:bg-layer-1-hover hover:text-primary"
        >
          <Minus className="size-3.5" />
        </button>
      </div>
    </div>
  );
});
