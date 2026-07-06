# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models

from plane.db.models.base import BaseModel


class WalletAddress(BaseModel):
    """A wallet linked to a user. Consumed by the SIWE auth provider (sign-in and
    account linking). Addresses are stored EIP-55 checksummed but compared
    case-insensitively, and are globally unique so one wallet maps to one user."""

    user = models.ForeignKey("db.User", on_delete=models.CASCADE, related_name="wallets")
    address = models.CharField(max_length=42, unique=True)
    label = models.CharField(max_length=120, blank=True, default="")
    is_primary = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    # CAIP-2 namespace; "eip155" for all EVM chains
    chain_namespace = models.CharField(max_length=32, default="eip155")
    last_login_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Wallet Address"
        verbose_name_plural = "Wallet Addresses"
        db_table = "web3_wallet_addresses"
        ordering = ("-created_at",)

    def __str__(self):
        return self.address
