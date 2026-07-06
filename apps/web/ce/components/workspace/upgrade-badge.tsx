/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

type TUpgradeBadge = {
  className?: string;
  size?: "sm" | "md";
};

// No paid tier in DeployFlow — the "PRO" upsell pill renders nothing everywhere
// it appears (workspace menu items, active-cycles, estimate picker, feature list).
export function UpgradeBadge(_props: TUpgradeBadge) {
  return null;
}
