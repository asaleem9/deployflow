/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TLifecycleStage, TVerificationStatus, TSeverity } from "@/plane-web/types/web3";

/** Ordered contract lifecycle pipeline, with display metadata. */
export const LIFECYCLE_STAGES: { key: TLifecycleStage; label: string }[] = [
  { key: "development", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "audit_pending", label: "Audit pending" },
  { key: "audit_in_progress", label: "In audit" },
  { key: "deployment", label: "Deployment" },
  { key: "verification", label: "Verification" },
  { key: "live", label: "Live" },
];

export const LIFECYCLE_LABEL: Record<TLifecycleStage, string> = {
  development: "Development",
  testing: "Testing",
  audit_pending: "Audit pending",
  audit_in_progress: "In audit",
  deployment: "Deployment",
  verification: "Verification",
  live: "Live",
  deprecated: "Deprecated",
};

/** Verification badge styling — token-driven so it stays theme-correct. */
export const VERIFICATION_META: Record<TVerificationStatus, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-success-subtle text-success-primary" },
  pending: { label: "Pending", className: "bg-warning-subtle text-warning-primary" },
  unverified: { label: "Unverified", className: "bg-layer-1 text-tertiary" },
  failed: { label: "Failed", className: "bg-danger-subtle text-danger-primary" },
};

/** Severity columns for the findings board. The gradient headers are the one place
 * the board leans expressive; the finding rows themselves stay calm. */
export const SEVERITY_ORDER: TSeverity[] = ["critical", "high", "medium", "low", "informational"];

export const SEVERITY_META: Record<TSeverity, { label: string; gradient: string; dot: string }> = {
  critical: { label: "Critical", gradient: "bg-gradient-severity-critical", dot: "bg-danger-primary" },
  high: { label: "High", gradient: "bg-gradient-severity-high", dot: "bg-warning-primary" },
  medium: { label: "Medium", gradient: "bg-gradient-severity-medium", dot: "bg-warning-primary" },
  low: { label: "Low", gradient: "bg-gradient-severity-low", dot: "bg-accent-primary" },
  informational: { label: "Informational", gradient: "bg-layer-2", dot: "bg-tertiary" },
};
