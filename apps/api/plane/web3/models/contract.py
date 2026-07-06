# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models

from plane.db.models.base import BaseModel
from plane.db.models.project import ProjectBaseModel

from .network import Network


class SmartContract(ProjectBaseModel):
    """A smart contract as a first-class work item. Its ordered lifecycle stage
    lives here (source of truth) because Plane's per-project States can't
    guarantee the develop -> verify pipeline. An optional companion Issue gives
    it comments, assignees, relations, and activity for free."""

    class Language(models.TextChoices):
        SOLIDITY = "solidity", "Solidity"
        VYPER = "vyper", "Vyper"

    class Lifecycle(models.TextChoices):
        DEVELOPMENT = "development", "Development"
        TESTING = "testing", "Testing"
        AUDIT_PENDING = "audit_pending", "Audit pending"
        AUDIT_IN_PROGRESS = "audit_in_progress", "Audit in progress"
        DEPLOYMENT = "deployment", "Deployment"
        VERIFICATION = "verification", "Verification"
        LIVE = "live", "Live"
        DEPRECATED = "deprecated", "Deprecated"

    name = models.CharField(max_length=255)
    description_html = models.TextField(blank=True, default="<p></p>")
    language = models.CharField(max_length=20, choices=Language.choices, default=Language.SOLIDITY)
    repo_url = models.URLField(blank=True, default="")
    source_path = models.CharField(max_length=500, blank=True, default="")
    lifecycle_stage = models.CharField(max_length=32, choices=Lifecycle.choices, default=Lifecycle.DEVELOPMENT)
    current_version = models.CharField(max_length=60, blank=True, default="")
    # companion work item — SET_NULL so deleting the issue doesn't drop the contract
    issue = models.ForeignKey(
        "db.Issue", on_delete=models.SET_NULL, null=True, blank=True, related_name="smart_contracts"
    )
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Smart Contract"
        verbose_name_plural = "Smart Contracts"
        db_table = "web3_smart_contracts"
        ordering = ("sort_order", "-created_at")

    def __str__(self):
        return self.name


class ContractDeployment(ProjectBaseModel):
    """One deployment of a contract to a specific network + version. The address
    is stored EIP-55 checksummed and is unique per (network, address)."""

    class Verification(models.TextChoices):
        UNVERIFIED = "unverified", "Unverified"
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        FAILED = "failed", "Failed"

    contract = models.ForeignKey(SmartContract, on_delete=models.CASCADE, related_name="deployments")
    network = models.ForeignKey(Network, on_delete=models.PROTECT, related_name="deployments")
    address = models.CharField(max_length=42)
    deploy_tx_hash = models.CharField(max_length=66, blank=True, default="")
    deployer_address = models.CharField(max_length=42, blank=True, default="")
    version = models.CharField(max_length=60, blank=True, default="")
    compiler_version = models.CharField(max_length=60, blank=True, default="")
    abi = models.JSONField(null=True, blank=True)
    constructor_args = models.TextField(blank=True, default="")
    block_number = models.BigIntegerField(null=True, blank=True)
    deployed_at = models.DateTimeField(null=True, blank=True)
    gas_used = models.BigIntegerField(null=True, blank=True)
    effective_gas_price_wei = models.DecimalField(max_digits=38, decimal_places=0, null=True, blank=True)
    verification_status = models.CharField(
        max_length=20, choices=Verification.choices, default=Verification.UNVERIFIED
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    is_current = models.BooleanField(default=True)
    is_proxy = models.BooleanField(default=False)
    implementation_address = models.CharField(max_length=42, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Contract Deployment"
        verbose_name_plural = "Contract Deployments"
        db_table = "web3_contract_deployments"
        ordering = ("-created_at",)
        constraints = [
            # Scope uniqueness to live rows so a soft-deleted deployment doesn't
            # block re-creating the same address (matches Plane's soft-delete
            # convention).
            models.UniqueConstraint(
                fields=["network", "address"],
                condition=models.Q(deleted_at__isnull=True),
                name="uniq_deployment_network_address",
            ),
        ]
        indexes = [
            models.Index(fields=["contract", "network", "is_current"]),
        ]

    def __str__(self):
        return f"{self.contract.name} @ {self.address} ({self.network.slug})"


class IssueContractLink(ProjectBaseModel):
    """Links an Issue to a deployment or on-chain transaction — the join that
    surfaces contract/tx context on the issue detail view."""

    class LinkType(models.TextChoices):
        DEPLOYMENT = "deployment", "Deployment"
        UPGRADE = "upgrade", "Upgrade"
        CONFIGURATION = "configuration", "Configuration"
        INCIDENT = "incident", "Incident"
        REFERENCE = "reference", "Reference"

    issue = models.ForeignKey("db.Issue", on_delete=models.CASCADE, related_name="contract_links")
    deployment = models.ForeignKey(
        ContractDeployment, on_delete=models.CASCADE, null=True, blank=True, related_name="issue_links"
    )
    tx_hash = models.CharField(max_length=66, blank=True, default="")
    link_type = models.CharField(max_length=20, choices=LinkType.choices, default=LinkType.REFERENCE)
    title = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Issue Contract Link"
        verbose_name_plural = "Issue Contract Links"
        db_table = "web3_issue_contract_links"
        ordering = ("-created_at",)


class NetworkGasSnapshot(BaseModel):
    """Periodic gas telemetry per network. Old rows are pruned by a cleanup task."""

    class Source(models.TextChoices):
        ETHERSCAN_ORACLE = "etherscan_oracle", "Etherscan oracle"
        RPC_FEE_HISTORY = "rpc_fee_history", "RPC fee history"

    network = models.ForeignKey(Network, on_delete=models.CASCADE, related_name="gas_snapshots")
    captured_at = models.DateTimeField()
    base_fee_gwei = models.DecimalField(max_digits=20, decimal_places=9, null=True, blank=True)
    safe_gwei = models.DecimalField(max_digits=20, decimal_places=9, null=True, blank=True)
    propose_gwei = models.DecimalField(max_digits=20, decimal_places=9, null=True, blank=True)
    fast_gwei = models.DecimalField(max_digits=20, decimal_places=9, null=True, blank=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.RPC_FEE_HISTORY)

    class Meta:
        verbose_name = "Network Gas Snapshot"
        verbose_name_plural = "Network Gas Snapshots"
        db_table = "web3_network_gas_snapshots"
        ordering = ("-captured_at",)
        indexes = [
            models.Index(fields=["network", "-captured_at"]),
        ]
