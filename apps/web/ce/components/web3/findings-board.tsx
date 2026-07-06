/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import useSWR from "swr";
import { ShieldAlert, TicketPlus, CheckCircle2, Plus } from "lucide-react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { web3Service } from "@/plane-web/services/web3.service";
import type { IAuditFinding, ISmartContract, TSeverity } from "@/plane-web/types/web3";
import { SEVERITY_ORDER, SEVERITY_META } from "./constants";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

/** Audit findings board grouped by severity. Column headers carry the one bold
 * touch (severity gradients); the cards stay calm and token-driven. */
export function Web3FindingsBoard({ workspaceSlug, projectId }: Props) {
  const [converting, setConverting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ contract: string; title: string; severity: TSeverity; code: string }>({
    contract: "",
    title: "",
    severity: "medium",
    code: "",
  });

  const key = workspaceSlug && projectId ? `WEB3_FINDINGS_${workspaceSlug}_${projectId}` : null;
  const { data: findings, isLoading, mutate } = useSWR<IAuditFinding[]>(key, () =>
    web3Service.listFindings(workspaceSlug, projectId)
  );
  const { data: contracts } = useSWR<ISmartContract[]>(
    workspaceSlug && projectId ? `WEB3_CONTRACTS_${workspaceSlug}_${projectId}` : null,
    () => web3Service.listContracts(workspaceSlug, projectId)
  );

  const submitFinding = async () => {
    if (!form.contract || !form.title.trim()) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Pick a contract and enter a title" });
      return;
    }
    try {
      await web3Service.createFinding(workspaceSlug, projectId, form);
      setForm({ contract: "", title: "", severity: "medium", code: "" });
      setCreating(false);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Finding recorded" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Could not record finding" });
    }
  };

  const createRemediation = async (finding: IAuditFinding) => {
    setConverting(finding.id);
    try {
      const res = await web3Service.createRemediationIssue(workspaceSlug, projectId, finding.id);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: res.created ? "Remediation issue created" : "Remediation issue already exists",
        message: res.sequence_id ? `Tracked as work item #${res.sequence_id}` : undefined,
      });
      mutate();
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Could not create remediation issue" });
    } finally {
      setConverting(null);
    }
  };

  const byS = (s: string) => (findings ?? []).filter((f) => f.severity === s);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-accent-primary" />
          <h1 className="text-h5-semibold text-primary">Audit findings</h1>
          {findings ? <span className="text-body-sm-regular text-tertiary">{findings.length}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color transition-colors hover:bg-accent-primary-hover"
        >
          <Plus className="size-4" /> New finding
        </button>
      </div>

      {creating ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-subtle bg-surface-2 px-6 py-3">
          <select
            value={form.contract}
            onChange={(e) => setForm((f) => ({ ...f, contract: e.target.value }))}
            className="rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          >
            <option value="">Contract…</option>
            {(contracts ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="code"
            className="w-20 rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 font-mono text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Finding title"
            className="min-w-[14rem] flex-1 rounded-md border border-strong bg-layer-1 px-3 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          />
          <select
            value={form.severity}
            onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as TSeverity }))}
            className="rounded-md border border-strong bg-layer-1 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-accent-strong"
          >
            {SEVERITY_ORDER.map((s) => (
              <option key={s} value={s}>
                {SEVERITY_META[s].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submitFinding}
            className="rounded-md bg-accent-primary px-3 py-1.5 text-body-sm-medium text-on-color hover:bg-accent-primary-hover"
          >
            Add
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid h-40 place-items-center text-body-sm-regular text-tertiary">Loading findings…</div>
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          {SEVERITY_ORDER.map((sev) => {
            const meta = SEVERITY_META[sev];
            const items = byS(sev);
            return (
              <div key={sev} className="flex w-72 flex-shrink-0 flex-col gap-2">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-on-color ${meta.gradient}`}>
                  <span className="text-body-sm-semibold">{meta.label}</span>
                  <span className="text-caption-sm-medium opacity-90">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.length === 0 ? (
                    <p className="px-1 py-4 text-center text-caption-sm-regular text-tertiary">No findings</p>
                  ) : (
                    items.map((f) => (
                      <div key={f.id} className="rounded-lg border border-subtle bg-surface-2 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-body-sm-medium text-primary">
                            {f.code ? <span className="font-mono text-tertiary">{f.code} </span> : null}
                            {f.title}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-caption-xs-regular text-tertiary">{f.status.replace("_", " ")}</span>
                          {f.remediation_issue ? (
                            <span className="inline-flex items-center gap-1 text-caption-xs-medium text-success-primary">
                              <CheckCircle2 className="size-3" /> Tracked
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={converting === f.id}
                              onClick={() => createRemediation(f)}
                              className="inline-flex items-center gap-1 rounded text-caption-xs-medium text-accent-primary hover:underline disabled:opacity-60"
                            >
                              <TicketPlus className="size-3" />
                              {converting === f.id ? "Creating…" : "Remediate"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
