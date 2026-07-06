/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Web3LaunchPlanner } from "@/plane-web/components/web3/launch-planner";

function ProjectLaunchesPage() {
  const { workspaceSlug, projectId } = useParams();
  if (!workspaceSlug || !projectId) return null;
  return <Web3LaunchPlanner workspaceSlug={workspaceSlug.toString()} projectId={projectId.toString()} />;
}

export default observer(ProjectLaunchesPage);
