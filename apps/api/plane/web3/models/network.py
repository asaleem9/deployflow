# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models

from plane.db.models.base import BaseModel


class Network(BaseModel):
    """A supported EVM chain. Global registry, seeded by a data migration and
    tunable via the admin. Contracts and deployments reference these rows so the
    supported-chain set is data, not code."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=60, unique=True)
    chain_id = models.BigIntegerField(unique=True)
    is_testnet = models.BooleanField(default=False)
    native_symbol = models.CharField(max_length=12, default="ETH")
    # e.g. https://basescan.org — used to build explorer links at serialization time
    explorer_base_url = models.URLField()
    # public RPC endpoint; an env override (WEB3_RPC_URL_<chain_id>) wins at runtime
    rpc_url = models.TextField(blank=True, default="")
    # Etherscan-family gas oracle is only available on some chains (not OP-stack)
    supports_gas_oracle = models.BooleanField(default=False)
    is_enabled = models.BooleanField(default=True)
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Network"
        verbose_name_plural = "Networks"
        db_table = "web3_networks"
        ordering = ("sort_order", "chain_id")

    def __str__(self):
        return f"{self.name} ({self.chain_id})"
