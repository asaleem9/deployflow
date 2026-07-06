/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import useSWR from "swr";
import { Link } from "react-router";
import { FileCode2, Plus, Layers } from "lucide-react";
import { web3Service } from "@/plane-web/services/web3.service";
import type { ISmartContract } from "@/plane-web/types/web3";
import { LIFECYCLE_STAGES, LIFECYCLE_LABEL } from "./constants";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

/** Project-scoped smart contract list. A dense work view, so it stays calm and
 * token-driven (no gradients/glass) per the design system's restraint rule. */
export function Web3ContractsList({ workspaceSlug, projectId }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const key = workspaceSlug && projectId ? `WEB3_CONTRACTS_${workspaceSlug}_${projectId}` : null;
  const { data: contracts, isLoading, mutate } = useSWR<ISmartContract[]>(key, () =>
    web3Service.listContracts(workspaceSlug, projectId)
  );

  const createContract = async () => {
    if (!name.trim()) return;
    await web3Service.createContract(workspaceSlug, projectId, { name: name.trim() });
    setName("");
    setCreating(false);
    mutate();
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* header */}
      <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="size-5 text-accent-primary" />
          <h1 className="text-h5-semibold text-primary">Smart contracts</h1>
          {contracts ? <span className="text-body-sm-regular text-tertiary">{contracts.length}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color transition-colors hover:bg-accent-primary-hover"
        >
          <Plus className="size-4" /> New contract
        </button>
      </div>

      {/* inline create row */}
      {creating ? (
        <div className="flex items-center gap-2 border-b border-subtle bg-surface-2 px-6 py-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createContract()}
            placeholder="Contract name (e.g. DeployFlowToken)"
            className="flex-1 rounded-md border border-strong bg-layer-1 px-3 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <button
            type="button"
            onClick={createContract}
            className="rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color hover:bg-accent-primary-hover"
          >
            Create
          </button>
        </div>
      ) : null}

      {/* list */}
      <div className="vertical-scrollbar flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid h-40 place-items-center text-body-sm-regular text-tertiary">Loading contracts…</div>
        ) : !contracts || contracts.length === 0 ? (
          <div className="grid h-full place-items-center">
            <div className="flex max-w-sm flex-col items-center gap-2 text-center">
              <Layers className="size-10 text-tertiary" />
              <p className="text-body-md-medium text-secondary">No contracts yet</p>
              <p className="text-body-sm-regular text-tertiary">
                Track a contract through its lifecycle — develop, test, audit, deploy, verify.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-subtle">
            {contracts.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/${workspaceSlug}/projects/${projectId}/web3/${c.id}`}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-layer-1"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-body-md-medium text-primary">{c.name}</span>
                    <span className="text-caption-sm-regular font-mono text-tertiary">{c.language}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-4">
                    <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-caption-sm-medium text-accent-primary">
                      {LIFECYCLE_LABEL[c.lifecycle_stage]}
                    </span>
                    <span className="text-caption-sm-regular text-tertiary">
                      {c.deployment_count ?? 0} deployment{(c.deployment_count ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* pipeline legend — the lifecycle stages this project's contracts move through */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-subtle px-6 py-2">
        {LIFECYCLE_STAGES.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <span className="whitespace-nowrap text-caption-xs-regular text-tertiary">{s.label}</span>
            {i < LIFECYCLE_STAGES.length - 1 ? <span className="text-tertiary">›</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
