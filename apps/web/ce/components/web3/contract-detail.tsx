/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import useSWR from "swr";
import { Link } from "react-router";
import { ArrowLeft, Copy, ExternalLink, GitBranch, RefreshCw, Check, Plus } from "lucide-react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { web3Service } from "@/plane-web/services/web3.service";
import type { ISmartContract, IContractDeployment, INetwork, TLifecycleStage } from "@/plane-web/types/web3";
import { LIFECYCLE_STAGES, VERIFICATION_META } from "./constants";

type Props = {
  workspaceSlug: string;
  projectId: string;
  contractId: string;
};

function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-1.5 font-mono text-caption-sm-regular text-secondary hover:text-primary"
      title={address}
    >
      {address.slice(0, 8)}…{address.slice(-6)}
      {copied ? <Check className="size-3 text-success-primary" /> : <Copy className="size-3 opacity-0 group-hover:opacity-100" />}
    </button>
  );
}

/** Smart contract detail: header + a per-network deployments table with copyable
 * addresses, explorer links, verification badges, and gas. A dense work view, so
 * it stays calm and token-driven. */
export function Web3ContractDetail({ workspaceSlug, projectId, contractId }: Props) {
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ network: "", address: "", version: "" });

  const { data: contract, mutate: mutateContract } = useSWR<ISmartContract>(
    contractId ? `WEB3_CONTRACT_${contractId}` : null,
    () => web3Service.retrieveContract(workspaceSlug, projectId, contractId)
  );

  const changeStage = async (stage: TLifecycleStage) => {
    try {
      await web3Service.updateContract(workspaceSlug, projectId, contractId, { lifecycle_stage: stage });
      mutateContract();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Lifecycle stage updated" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Could not update stage" });
    }
  };
  const { data: deployments, mutate } = useSWR<IContractDeployment[]>(
    contractId ? `WEB3_CONTRACT_DEPLOYMENTS_${contractId}` : null,
    () => web3Service.listDeployments(workspaceSlug, projectId, contractId)
  );
  const { data: networks } = useSWR<INetwork[]>(
    workspaceSlug ? `WEB3_NETWORKS_${workspaceSlug}` : null,
    () => web3Service.listNetworks(workspaceSlug)
  );

  const networkName = (id: string) => networks?.find((n) => n.id === id)?.name ?? "—";

  const submitDeployment = async () => {
    if (!form.network || !form.address.trim()) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Pick a network and enter an address" });
      return;
    }
    try {
      await web3Service.createDeployment(workspaceSlug, projectId, contractId, {
        network: form.network,
        address: form.address.trim(),
        version: form.version.trim(),
      });
      setForm({ network: "", address: "", version: "" });
      setAdding(false);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Deployment added" });
    } catch (e) {
      const msg = (e as { address?: string[]; error?: string })?.address?.[0] || "Could not add deployment";
      setToast({ type: TOAST_TYPE.ERROR, title: msg });
    }
  };

  const refresh = async (deploymentId: string) => {
    setRefreshing(deploymentId);
    try {
      await web3Service.refreshDeployment(workspaceSlug, projectId, deploymentId);
      setToast({ type: TOAST_TYPE.INFO, title: "Refresh queued", message: "Syncing receipt + verification from chain." });
      setTimeout(() => mutate(), 1200);
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Could not queue refresh" });
    } finally {
      setRefreshing(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* header */}
      <div className="border-b border-subtle px-6 py-4">
        <Link
          to={`/${workspaceSlug}/projects/${projectId}/web3`}
          className="mb-3 inline-flex items-center gap-1.5 text-caption-sm-medium text-tertiary hover:text-secondary"
        >
          <ArrowLeft className="size-3.5" /> Contracts
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-h4-semibold text-primary">{contract?.name ?? "…"}</h1>
            {contract ? (
              <select
                value={contract.lifecycle_stage}
                onChange={(e) => changeStage(e.target.value as TLifecycleStage)}
                title="Lifecycle stage"
                className="rounded-full border border-accent-subtle bg-accent-subtle px-2.5 py-0.5 text-caption-sm-medium text-accent-primary outline-none focus:border-accent-strong"
              >
                {LIFECYCLE_STAGES.map((s) => (
                  <option key={s.key} value={s.key} className="bg-surface-1 text-primary">
                    {s.label}
                  </option>
                ))}
                <option value="deprecated" className="bg-surface-1 text-primary">
                  Deprecated
                </option>
              </select>
            ) : null}
          </div>
          <div className="flex items-center gap-4 text-caption-sm-regular text-tertiary">
            {contract?.current_version ? <span className="font-mono">v{contract.current_version}</span> : null}
            <span className="font-mono">{contract?.language}</span>
            {contract?.repo_url ? (
              <a href={contract.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-secondary">
                <GitBranch className="size-3.5" /> repo
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* deployments table */}
      <div className="vertical-scrollbar flex-1 overflow-y-auto p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-body-sm-semibold text-secondary">Deployments</h2>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-strong bg-layer-1 px-2.5 py-1 text-caption-sm-medium text-secondary transition-colors hover:bg-layer-1-hover"
          >
            <Plus className="size-3.5" /> New deployment
          </button>
        </div>

        {adding ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-subtle bg-surface-2 p-3">
            <select
              value={form.network}
              onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))}
              className="rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 text-caption-sm-regular text-primary outline-none focus:border-accent-strong"
            >
              <option value="">Network…</option>
              {(networks ?? []).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="0x… contract address"
              className="min-w-[16rem] flex-1 rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 font-mono text-caption-sm-regular text-primary outline-none focus:border-accent-strong"
            />
            <input
              value={form.version}
              onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
              placeholder="version"
              className="w-24 rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 text-caption-sm-regular text-primary outline-none focus:border-accent-strong"
            />
            <button
              type="button"
              onClick={submitDeployment}
              className="rounded-md bg-accent-primary px-3 py-1.5 text-caption-sm-medium text-on-color hover:bg-accent-primary-hover"
            >
              Add
            </button>
          </div>
        ) : null}

        {!deployments ? (
          <p className="text-body-sm-regular text-tertiary">Loading…</p>
        ) : deployments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-subtle p-6 text-center text-body-sm-regular text-tertiary">
            No deployments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-subtle">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-caption-xs-medium uppercase tracking-wide text-tertiary">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Network</th>
                  <th className="px-4 py-2.5 font-medium">Address</th>
                  <th className="px-4 py-2.5 font-medium">Version</th>
                  <th className="px-4 py-2.5 font-medium">Verification</th>
                  <th className="px-4 py-2.5 font-medium">Gas used</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {deployments.map((d) => {
                  const v = VERIFICATION_META[d.verification_status];
                  return (
                    <tr key={d.id} className="text-body-sm-regular">
                      <td className="px-4 py-3 text-primary">{networkName(d.network)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CopyableAddress address={d.address} />
                          {d.explorer_url ? (
                            <a href={d.explorer_url} target="_blank" rel="noopener noreferrer" className="text-tertiary hover:text-accent-primary">
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-tertiary">{d.version || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-caption-xs-medium ${v.className}`}>{v.label}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-tertiary">
                        {d.gas_used ? Number(d.gas_used).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => refresh(d.id)}
                          disabled={refreshing === d.id}
                          title="Sync receipt + verification from chain"
                          className="inline-flex items-center gap-1 text-caption-xs-medium text-accent-primary hover:underline disabled:opacity-60"
                        >
                          <RefreshCw className={`size-3 ${refreshing === d.id ? "animate-spin" : ""}`} /> Sync
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
