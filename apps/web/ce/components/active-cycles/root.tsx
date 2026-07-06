/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { CircleDashed } from "lucide-react";

// The cross-project "active cycles" overview isn't built in this edition. It used
// to render a paid-plan upsell — DeployFlow has no paid tier, so it shows a plain
// neutral empty state instead of an upgrade pitch.
export function WorkspaceActiveCyclesRoot() {
  return (
    <div className="grid size-full place-items-center px-6 py-20 text-center">
      <div className="flex max-w-md flex-col items-center gap-3">
        <CircleDashed className="size-8 text-tertiary" />
        <h3 className="text-h6-semibold text-primary">Active cycles overview</h3>
        <p className="text-body-sm-regular text-tertiary">
          A cross-project view of every running cycle is on the roadmap. For now, open a project to track its cycles.
        </p>
      </div>
    </div>
  );
}
