/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Web3Overview } from "@/plane-web/components/web3/overview";

function ProjectWeb3Page() {
  const { workspaceSlug, projectId } = useParams();

  if (!workspaceSlug || !projectId) return null;

  return <Web3Overview workspaceSlug={workspaceSlug.toString()} projectId={projectId.toString()} />;
}

export default observer(ProjectWeb3Page);
