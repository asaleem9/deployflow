/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import useSWR from "swr";
import { useReveal } from "@deployflow/motion";
import { FileCode2, ShieldAlert, Trophy, Rocket } from "lucide-react";
import { web3Service } from "@/plane-web/services/web3.service";
import type { ISmartContract, IAuditFinding, IBounty, ITokenLaunch } from "@/plane-web/types/web3";
import { StatCard } from "./stat-card";
import { Web3ContractsList } from "./contracts-list";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

/**
 * The web3 module's landing surface: a bold dashboard strip of animated stat
 * cards over the calm contracts list. This is where the "bold entry, calm work
 * views" split shows up on one screen.
 */
export function Web3Overview({ workspaceSlug, projectId }: Props) {
  const scope = useReveal<HTMLDivElement>({ stagger: 0.08, y: 16 });

  const args = [workspaceSlug, projectId] as const;
  const { data: contracts } = useSWR<ISmartContract[]>(
    workspaceSlug && projectId ? `WEB3_OV_CONTRACTS_${workspaceSlug}_${projectId}` : null,
    () => web3Service.listContracts(...args)
  );
  const { data: findings } = useSWR<IAuditFinding[]>(
    workspaceSlug && projectId ? `WEB3_OV_FINDINGS_${workspaceSlug}_${projectId}` : null,
    () => web3Service.listFindings(...args)
  );
  const { data: bounties } = useSWR<IBounty[]>(
    workspaceSlug && projectId ? `WEB3_OV_BOUNTIES_${workspaceSlug}_${projectId}` : null,
    () => web3Service.listBounties(...args)
  );
  const { data: launches } = useSWR<ITokenLaunch[]>(
    workspaceSlug && projectId ? `WEB3_OV_LAUNCHES_${workspaceSlug}_${projectId}` : null,
    () => web3Service.listTokenLaunches(...args)
  );

  const deployments = (contracts ?? []).reduce((s, c) => s + (c.deployment_count ?? 0), 0);
  const criticalOpen = (findings ?? []).filter(
    (f) => f.severity === "critical" && !["remediated", "verified_fixed", "wont_fix"].includes(f.status)
  ).length;
  const openBounties = (bounties ?? []).filter((b) => b.status === "open").length;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      {/* bold dashboard strip */}
      <div ref={scope} className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <StatCard
          label="Contracts"
          value={contracts?.length ?? 0}
          icon={<FileCode2 className="size-4" />}
          gradient="bg-gradient-brand"
          suffix={`· ${deployments} deployed`}
        />
        <StatCard
          label="Critical findings"
          value={criticalOpen}
          icon={<ShieldAlert className="size-4" />}
          gradient="bg-gradient-severity-critical"
          suffix="open"
        />
        <StatCard
          label="Open bounties"
          value={openBounties}
          icon={<Trophy className="size-4" />}
          gradient="bg-gradient-cta"
        />
        <StatCard
          label="Token launches"
          value={launches?.length ?? 0}
          icon={<Rocket className="size-4" />}
          gradient="bg-gradient-brand"
        />
      </div>

      {/* calm work view */}
      <div className="min-h-0 flex-1 border-t border-subtle">
        <Web3ContractsList workspaceSlug={workspaceSlug} projectId={projectId} />
      </div>
    </div>
  );
}
