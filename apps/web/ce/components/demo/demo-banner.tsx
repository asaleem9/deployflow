/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { Sparkles, ArrowRight, X } from "lucide-react";
// hooks
import { useUser } from "@/hooks/store/user";
// local
import { isDemoUser, exitDemoTo } from "./demo.utils";

/**
 * A floating banner shown only while the shared demo account is signed in. It
 * frames the session as a sandbox and gives two intuitive ways out — create a
 * real account, or return to the marketing home — so a demo visitor never has to
 * reason about "signing out" of an account that isn't theirs.
 */
export const DemoModeBanner = observer(function DemoModeBanner() {
  const { data: currentUser } = useUser();
  const [dismissed, setDismissed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (!isDemoUser(currentUser) || dismissed) return null;

  const go = (destination: string) => {
    if (leaving) return;
    setLeaving(true);
    void exitDemoTo(destination);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="glass-2 pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-accent-subtle px-4 py-2 shadow-glow-brand">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm-semibold text-primary">You’re exploring the DeployFlow demo</p>
          <p className="hidden truncate text-caption-sm-regular text-tertiary sm:block">
            Poke around freely — it’s a shared sandbox that resets now and then.
          </p>
        </div>
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
          onClick={() => go("/")}
          disabled={leaving}
          className="shrink-0 rounded-full px-3 py-1.5 text-body-sm-medium text-secondary transition-colors hover:bg-layer-1-hover hover:text-primary disabled:opacity-70"
        >
          Exit demo
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide"
          className="grid size-6 shrink-0 place-items-center rounded-full text-tertiary transition-colors hover:bg-layer-1-hover hover:text-primary"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
});
