/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Sparkles } from "lucide-react";
// components
import { SettingsBoxedControlItem } from "@/components/settings/boxed-control-item";
import { SettingsHeading } from "@/components/settings/heading";

// DeployFlow is fully free — there are no paid plans to compare or upgrade to.
// The billing route is unlinked from the settings nav; if reached directly it
// just confirms everything is included, with no plan comparison or checkout.
export const BillingRoot = function BillingRoot() {
  return (
    <section className="relative scrollbar-hide size-full overflow-y-auto">
      <SettingsHeading
        title="Plan"
        description="DeployFlow is free and open source — every feature is included."
      />
      <div className="mt-6">
        <SettingsBoxedControlItem
          title="Free forever"
          description="Unlimited projects, issues, cycles, modules, pages, storage, and the full Web3 workspace — no paid tiers, no limits."
        />
        <div className="mt-4 flex items-center gap-2 text-body-sm-regular text-tertiary">
          <Sparkles className="size-4 text-accent-primary" />
          Nothing to upgrade. You already have everything.
        </div>
      </div>
    </section>
  );
};
