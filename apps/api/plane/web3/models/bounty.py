# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models

from plane.db.models.project import ProjectBaseModel


class Bounty(ProjectBaseModel):
    """A bounty is an Issue plus reward metadata (one-to-one with the work item).
    The reward amount is kept both as a canonical string (exact, for uint256) and
    a display decimal. Payouts are recorded by tx hash and receipt-verified by a
    Celery task — DeployFlow never moves funds itself."""

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLAIMED = "claimed", "Claimed"
        IN_REVIEW = "in_review", "In review"
        APPROVED = "approved", "Approved"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    issue = models.OneToOneField("db.Issue", on_delete=models.CASCADE, related_name="bounty")
    reward_amount = models.CharField(max_length=80, blank=True, default="")
    reward_amount_display = models.DecimalField(max_digits=38, decimal_places=18, null=True, blank=True)
    reward_token_symbol = models.CharField(max_length=32, blank=True, default="")
    # blank = native token
    reward_token_address = models.CharField(max_length=42, blank=True, default="")
    network = models.ForeignKey("web3.Network", on_delete=models.PROTECT, related_name="bounties")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    claimant = models.ForeignKey(
        "db.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="web3_claimed_bounties"
    )
    payout_wallet = models.ForeignKey(
        "web3.WalletAddress", on_delete=models.SET_NULL, null=True, blank=True, related_name="bounty_payouts"
    )
    payout_tx_hash = models.CharField(max_length=66, blank=True, default="")
    deadline = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Bounty"
        verbose_name_plural = "Bounties"
        db_table = "web3_bounties"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Bounty: {self.reward_amount} {self.reward_token_symbol}"
