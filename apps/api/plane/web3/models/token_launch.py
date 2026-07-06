# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models

from plane.db.models.base import BaseModel
from plane.db.models.project import ProjectBaseModel


class TokenLaunch(ProjectBaseModel):
    """A token generation / distribution event. Reuses Plane Modules to group the
    launch's work items. Total supply is stored as a canonical string because a
    uint256 exceeds Decimal's comfort range."""

    class LaunchType(models.TextChoices):
        TGE = "tge", "Token generation event"
        AIRDROP = "airdrop", "Airdrop"
        IDO = "ido", "IDO"
        LIQUIDITY_EVENT = "liquidity_event", "Liquidity event"

    class Status(models.TextChoices):
        PLANNING = "planning", "Planning"
        SCHEDULED = "scheduled", "Scheduled"
        EXECUTED = "executed", "Executed"
        CANCELLED = "cancelled", "Cancelled"

    name = models.CharField(max_length=255)
    token_symbol = models.CharField(max_length=32, blank=True, default="")
    token_contract = models.ForeignKey(
        "web3.SmartContract", on_delete=models.SET_NULL, null=True, blank=True, related_name="token_launches"
    )
    launch_type = models.CharField(max_length=20, choices=LaunchType.choices, default=LaunchType.TGE)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PLANNING)
    target_date = models.DateTimeField(null=True, blank=True)
    network = models.ForeignKey(
        "web3.Network", on_delete=models.SET_NULL, null=True, blank=True, related_name="token_launches"
    )
    total_supply = models.CharField(max_length=80, blank=True, default="")
    # list of {label, pct, vesting}
    allocations = models.JSONField(default=list, blank=True)
    module = models.ForeignKey(
        "db.Module", on_delete=models.SET_NULL, null=True, blank=True, related_name="web3_token_launches"
    )

    class Meta:
        verbose_name = "Token Launch"
        verbose_name_plural = "Token Launches"
        db_table = "web3_token_launches"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.name} ({self.token_symbol})"


class AirdropBatch(BaseModel):
    """A single airdrop distribution batch under a launch: snapshot, merkle root,
    recipient CSV (via FileAsset), and the distribution transaction."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SNAPSHOT_TAKEN = "snapshot_taken", "Snapshot taken"
        ROOT_PUBLISHED = "root_published", "Merkle root published"
        DISTRIBUTING = "distributing", "Distributing"
        COMPLETE = "complete", "Complete"

    token_launch = models.ForeignKey(TokenLaunch, on_delete=models.CASCADE, related_name="airdrop_batches")
    network = models.ForeignKey("web3.Network", on_delete=models.PROTECT, related_name="airdrop_batches")
    snapshot_block = models.BigIntegerField(null=True, blank=True)
    merkle_root = models.CharField(max_length=66, blank=True, default="")
    recipients_asset = models.ForeignKey(
        "db.FileAsset", on_delete=models.SET_NULL, null=True, blank=True, related_name="web3_airdrop_recipients"
    )
    recipient_count = models.PositiveIntegerField(default=0)
    distributor_address = models.CharField(max_length=42, blank=True, default="")
    distribution_tx_hash = models.CharField(max_length=66, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    class Meta:
        verbose_name = "Airdrop Batch"
        verbose_name_plural = "Airdrop Batches"
        db_table = "web3_airdrop_batches"
        ordering = ("-created_at",)
