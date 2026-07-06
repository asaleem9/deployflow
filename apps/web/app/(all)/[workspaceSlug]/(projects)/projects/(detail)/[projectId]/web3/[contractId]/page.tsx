/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Web3ContractDetail } from "@/plane-web/components/web3/contract-detail";

function ProjectContractDetailPage() {
  const { workspaceSlug, projectId, contractId } = useParams();
  if (!workspaceSlug || !projectId || !contractId) return null;
  return (
    <Web3ContractDetail
      workspaceSlug={workspaceSlug.toString()}
      projectId={projectId.toString()}
      contractId={contractId.toString()}
    />
  );
}

export default observer(ProjectContractDetailPage);
