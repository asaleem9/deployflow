/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TLifecycleStage =
  | "development"
  | "testing"
  | "audit_pending"
  | "audit_in_progress"
  | "deployment"
  | "verification"
  | "live"
  | "deprecated";

export type TVerificationStatus = "unverified" | "pending" | "verified" | "failed";

export interface INetwork {
  id: string;
  name: string;
  slug: string;
  chain_id: number;
  is_testnet: boolean;
  native_symbol: string;
  explorer_base_url: string;
  supports_gas_oracle: boolean;
  is_enabled: boolean;
}

export interface ISmartContract {
  id: string;
  name: string;
  description_html: string;
  language: "solidity" | "vyper";
  repo_url: string;
  source_path: string;
  lifecycle_stage: TLifecycleStage;
  current_version: string;
  issue: string | null;
  deployment_count?: number;
  project: string;
  workspace: string;
  created_at: string;
  updated_at: string;
}

export interface IContractDeployment {
  id: string;
  contract: string;
  network: string;
  address: string;
  deploy_tx_hash: string;
  version: string;
  compiler_version: string;
  block_number: number | null;
  gas_used: number | null;
  verification_status: TVerificationStatus;
  verified_at: string | null;
  is_current: boolean;
  is_proxy: boolean;
  explorer_url: string | null;
  created_at: string;
}

export type TSeverity = "critical" | "high" | "medium" | "low" | "informational";
export type TFindingStatus = "open" | "acknowledged" | "remediated" | "wont_fix" | "verified_fixed";

export interface IAudit {
  id: string;
  contract: string;
  auditor_name: string;
  auditor_firm: string;
  audit_type: "internal" | "external" | "contest";
  status: string;
  findings_count?: number;
  created_at: string;
}

export interface IAuditFinding {
  id: string;
  audit: string;
  code: string;
  title: string;
  description_html: string;
  severity: TSeverity;
  status: TFindingStatus;
  remediation_issue: string | null;
  created_at: string;
}

export type TBountyStatus = "open" | "claimed" | "in_review" | "approved" | "paid" | "cancelled";

export interface IBounty {
  id: string;
  issue: string;
  reward_amount: string;
  reward_token_symbol: string;
  network: string;
  status: TBountyStatus;
  payout_tx_hash: string;
  deadline: string | null;
  created_at: string;
}

export interface ITokenAllocation {
  label: string;
  pct: number;
  vesting?: string;
}

export interface ITokenLaunch {
  id: string;
  name: string;
  token_symbol: string;
  launch_type: "tge" | "airdrop" | "ido" | "liquidity_event";
  status: "planning" | "scheduled" | "executed" | "cancelled";
  target_date: string | null;
  network: string | null;
  total_supply: string;
  allocations: ITokenAllocation[];
  created_at: string;
}
