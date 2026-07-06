/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { layout, route } from "@react-router/dev/routes";
import type { RouteConfigEntry } from "@react-router/dev/routes";

/**
 * DeployFlow web3 routes. The nesting mirrors the core route tree's layout files
 * exactly so mergeRoutes() deep-merges these entries into the existing project
 * shell (sidebar/topbar) rather than mounting them standalone.
 */
export const extendedRoutes: RouteConfigEntry[] = [
  layout("./(all)/layout.tsx", [
    layout("./(all)/[workspaceSlug]/layout.tsx", [
      layout("./(all)/[workspaceSlug]/(projects)/layout.tsx", [
        layout("./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/layout.tsx", [
          route(
            ":workspaceSlug/projects/:projectId/web3",
            "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/web3/page.tsx"
          ),
          route(
            ":workspaceSlug/projects/:projectId/web3/:contractId",
            "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/web3/[contractId]/page.tsx"
          ),
          route(
            ":workspaceSlug/projects/:projectId/audits",
            "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/audits/page.tsx"
          ),
          route(
            ":workspaceSlug/projects/:projectId/bounties",
            "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/bounties/page.tsx"
          ),
          route(
            ":workspaceSlug/projects/:projectId/launches",
            "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/launches/page.tsx"
          ),
        ]),
      ]),
    ]),
  ]),
];
