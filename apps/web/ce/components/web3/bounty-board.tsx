/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import useSWR from "swr";
import { Coins, Trophy, Plus } from "lucide-react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { web3Service } from "@/plane-web/services/web3.service";
import type { IBounty, TBountyStatus, INetwork } from "@/plane-web/types/web3";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

const STATUS_META: Record<TBountyStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-accent-subtle text-accent-primary" },
  claimed: { label: "Claimed", className: "bg-warning-subtle text-warning-primary" },
  in_review: { label: "In review", className: "bg-warning-subtle text-warning-primary" },
  approved: { label: "Approved", className: "bg-success-subtle text-success-primary" },
  paid: { label: "Paid", className: "bg-success-subtle text-success-primary" },
  cancelled: { label: "Cancelled", className: "bg-layer-1 text-tertiary" },
};

/** Bounty board — a card grid. Reward amounts render in mono; the board stays
 * calm and token-driven per the design system's restraint rule for dense views. */
export function Web3BountyBoard({ workspaceSlug, projectId }: Props) {
  const key = workspaceSlug && projectId ? `WEB3_BOUNTIES_${workspaceSlug}_${projectId}` : null;
  const { data: bounties, isLoading, mutate } = useSWR<IBounty[]>(key, () =>
    web3Service.listBounties(workspaceSlug, projectId)
  );
  const { data: networks } = useSWR<INetwork[]>(
    workspaceSlug ? `WEB3_NETWORKS_${workspaceSlug}` : null,
    () => web3Service.listNetworks(workspaceSlug)
  );

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", reward_amount: "", reward_token_symbol: "USDC", network: "" });

  const submit = async () => {
    if (!form.title.trim() || !form.network) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Enter a title and pick a network" });
      return;
    }
    try {
      await web3Service.createBounty(workspaceSlug, projectId, form);
      setForm({ title: "", reward_amount: "", reward_token_symbol: "USDC", network: "" });
      setCreating(false);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Bounty created" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Could not create bounty" });
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-accent-primary" />
          <h1 className="text-h5-semibold text-primary">Bounties</h1>
          {bounties ? <span className="text-body-sm-regular text-tertiary">{bounties.length}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color transition-colors hover:bg-accent-primary-hover"
        >
          <Plus className="size-4" /> New bounty
        </button>
      </div>

      {creating ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-subtle bg-surface-2 px-6 py-3">
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="What needs doing?"
            className="min-w-[14rem] flex-1 rounded-md border border-strong bg-layer-1 px-3 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <input
            value={form.reward_amount}
            onChange={(e) => setForm((f) => ({ ...f, reward_amount: e.target.value }))}
            placeholder="reward"
            className="w-24 rounded-md border border-strong bg-layer-1 px-3 py-1.5 font-mono text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <input
            value={form.reward_token_symbol}
            onChange={(e) => setForm((f) => ({ ...f, reward_token_symbol: e.target.value }))}
            placeholder="token"
            className="w-24 rounded-md border border-strong bg-layer-1 px-3 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <select
            value={form.network}
            onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))}
            className="rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          >
            <option value="">Network…</option>
            {(networks ?? []).map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color hover:bg-accent-primary-hover"
          >
            Create
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid h-40 place-items-center text-body-sm-regular text-tertiary">Loading bounties…</div>
      ) : !bounties || bounties.length === 0 ? (
        <div className="grid h-full place-items-center">
          <div className="flex max-w-sm flex-col items-center gap-2 text-center">
            <Coins className="size-10 text-tertiary" />
            <p className="text-body-md-medium text-secondary">No bounties yet</p>
            <p className="text-body-sm-regular text-tertiary">
              Attach a reward to a work item to open it up as a bounty. Payouts are recorded on-chain and verified.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
          {bounties.map((b) => {
            const meta = STATUS_META[b.status];
            return (
              <div key={b.id} className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-caption-sm-medium ${meta.className}`}>
                    {meta.label}
                  </span>
                  {b.deadline ? (
                    <span className="text-caption-xs-regular text-tertiary">
                      due {new Date(b.deadline).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-h4-semibold text-primary">{b.reward_amount || "—"}</span>
                  <span className="text-body-sm-medium text-secondary">{b.reward_token_symbol}</span>
                </div>
                {b.payout_tx_hash ? (
                  <span className="truncate font-mono text-caption-xs-regular text-tertiary">
                    payout {b.payout_tx_hash.slice(0, 10)}…
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
