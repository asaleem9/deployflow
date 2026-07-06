/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import useSWR from "swr";
import { Rocket, Coins, Plus } from "lucide-react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { web3Service } from "@/plane-web/services/web3.service";
import type { ITokenLaunch, INetwork } from "@/plane-web/types/web3";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

// Allocation bar colors, cycled across segments (token-aligned accents).
const ALLOCATION_COLORS = [
  "var(--brand-default)",
  "#22D3EE",
  "#D946EF",
  "#34D399",
  "#FBBF24",
  "#FB7185",
];

/** Token-launch planner: each launch shows its type, status, supply, and an
 * allocation breakdown bar. A launch surface, so the header leans a touch bolder
 * while the detail stays legible. */
const LAUNCH_TYPES = [
  { value: "tge", label: "TGE" },
  { value: "airdrop", label: "Airdrop" },
  { value: "ido", label: "IDO" },
  { value: "liquidity_event", label: "Liquidity" },
];

export function Web3LaunchPlanner({ workspaceSlug, projectId }: Props) {
  const key = workspaceSlug && projectId ? `WEB3_LAUNCHES_${workspaceSlug}_${projectId}` : null;
  const { data: launches, isLoading, mutate } = useSWR<ITokenLaunch[]>(key, () =>
    web3Service.listTokenLaunches(workspaceSlug, projectId)
  );
  const { data: networks } = useSWR<INetwork[]>(
    workspaceSlug ? `WEB3_NETWORKS_${workspaceSlug}` : null,
    () => web3Service.listNetworks(workspaceSlug)
  );

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", token_symbol: "", launch_type: "tge", network: "", total_supply: "" });

  const submit = async () => {
    if (!form.name.trim()) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Give the launch a name" });
      return;
    }
    try {
      await web3Service.createTokenLaunch(workspaceSlug, projectId, {
        name: form.name.trim(),
        token_symbol: form.token_symbol.trim(),
        launch_type: form.launch_type as ITokenLaunch["launch_type"],
        network: form.network || null,
        total_supply: form.total_supply.trim(),
        allocations: [],
      });
      setForm({ name: "", token_symbol: "", launch_type: "tge", network: "", total_supply: "" });
      setCreating(false);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Launch created" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Could not create launch" });
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-accent-primary" />
          <h1 className="text-h5-semibold text-primary">Token launches</h1>
          {launches ? <span className="text-body-sm-regular text-tertiary">{launches.length}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color transition-colors hover:bg-accent-primary-hover"
        >
          <Plus className="size-4" /> New launch
        </button>
      </div>

      {creating ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-subtle bg-surface-2 px-6 py-3">
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Launch name"
            className="min-w-[12rem] flex-1 rounded-md border border-strong bg-layer-1 px-3 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <input
            value={form.token_symbol}
            onChange={(e) => setForm((f) => ({ ...f, token_symbol: e.target.value }))}
            placeholder="SYMBOL"
            className="w-28 rounded-md border border-strong bg-layer-1 px-3 py-1.5 font-mono text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <select
            value={form.launch_type}
            onChange={(e) => setForm((f) => ({ ...f, launch_type: e.target.value }))}
            className="rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          >
            {LAUNCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
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
        <div className="grid h-40 place-items-center text-body-sm-regular text-tertiary">Loading launches…</div>
      ) : !launches || launches.length === 0 ? (
        <div className="grid h-full place-items-center">
          <div className="flex max-w-sm flex-col items-center gap-2 text-center">
            <Coins className="size-10 text-tertiary" />
            <p className="text-body-md-medium text-secondary">No launches planned</p>
            <p className="text-body-sm-regular text-tertiary">
              Plan a TGE, airdrop, or IDO — track supply, allocations, and the tasks that get you there.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          {launches.map((l) => {
            const total = (l.allocations ?? []).reduce((s, a) => s + (Number(a.pct) || 0), 0) || 100;
            return (
              <div key={l.id} className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md-semibold text-primary">{l.name}</span>
                    <span className="font-mono text-caption-sm-regular text-accent-primary">{l.token_symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-caption-sm-medium text-accent-primary uppercase">
                      {l.launch_type}
                    </span>
                    <span className="text-caption-sm-regular text-tertiary">{l.status}</span>
                  </div>
                </div>

                {l.total_supply ? (
                  <span className="font-mono text-caption-sm-regular text-secondary">
                    supply {Number(l.total_supply).toLocaleString()}
                  </span>
                ) : null}

                {/* allocation breakdown bar */}
                {l.allocations && l.allocations.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-layer-1">
                      {l.allocations.map((a, i) => (
                        <div
                          key={a.label + i}
                          style={{
                            width: `${((Number(a.pct) || 0) / total) * 100}%`,
                            backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {l.allocations.map((a, i) => (
                        <div key={a.label + i} className="flex items-center gap-1.5">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                          />
                          <span className="text-caption-xs-regular text-secondary">
                            {a.label} {a.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
