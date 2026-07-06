# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Periodic gas telemetry per enabled network. Uses the Etherscan gas oracle where
available, and falls back to RPC eth_feeHistory for chains without one (OP-stack).
Old snapshots are pruned to bound table growth."""

import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from plane.web3.models import Network, NetworkGasSnapshot
from plane.web3.services.etherscan import EtherscanClient, EtherscanError
from plane.web3.services.rpc import get_fee_history_gwei

logger = logging.getLogger(__name__)

SNAPSHOT_RETENTION_DAYS = 30


def _to_decimal(value):
    try:
        return round(float(value), 9) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


@shared_task
def snapshot_gas_prices():
    """Capture one gas snapshot per enabled network."""
    client = EtherscanClient()
    captured = 0
    for network in Network.objects.filter(is_enabled=True):
        base = safe = propose = fast = None
        source = NetworkGasSnapshot.Source.RPC_FEE_HISTORY

        if network.supports_gas_oracle:
            try:
                oracle = client.get_gas_oracle(network.chain_id)
                if oracle:
                    base = _to_decimal(oracle.get("suggestBaseFee"))
                    safe = _to_decimal(oracle.get("SafeGasPrice"))
                    propose = _to_decimal(oracle.get("ProposeGasPrice"))
                    fast = _to_decimal(oracle.get("FastGasPrice"))
                    source = NetworkGasSnapshot.Source.ETHERSCAN_ORACLE
            except EtherscanError as e:
                logger.warning("gas oracle failed for %s: %s", network.slug, e)
            except Exception as e:  # noqa: BLE001
                logger.warning("gas oracle error for %s: %s", network.slug, e)

        if safe is None:
            fee = get_fee_history_gwei(network.chain_id, fallback_url=network.rpc_url)
            if fee:
                base = _to_decimal(fee.get("base_fee"))
                safe = _to_decimal(fee.get("safe"))
                propose = _to_decimal(fee.get("propose"))
                fast = _to_decimal(fee.get("fast"))

        if safe is None and base is None:
            continue

        NetworkGasSnapshot.objects.create(
            network=network,
            captured_at=timezone.now(),
            base_fee_gwei=base,
            safe_gwei=safe,
            propose_gwei=propose,
            fast_gwei=fast,
            source=source,
        )
        captured += 1

    logger.info("snapshot_gas_prices: captured %s snapshots", captured)
    return captured


@shared_task
def prune_gas_snapshots():
    """Delete gas snapshots older than the retention window."""
    cutoff = timezone.now() - timedelta(days=SNAPSHOT_RETENTION_DAYS)
    deleted, _ = NetworkGasSnapshot.objects.filter(captured_at__lt=cutoff).delete()
    logger.info("prune_gas_snapshots: deleted %s", deleted)
    return deleted
