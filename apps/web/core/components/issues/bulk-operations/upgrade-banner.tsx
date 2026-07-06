/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

type Props = {
  className?: string;
};

// No paid tier in DeployFlow — the bulk-operations "Upgrade to One" banner renders
// nothing.
export function BulkOperationsUpgradeBanner(_props: Props) {
  return null;
}
