# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Celery tasks that reconcile deployment rows with on-chain reality: confirm
pending transactions (receipts) and refresh verification status from Etherscan."""

import logging

from celery import shared_task
from django.utils import timezone

from plane.web3.models import ContractDeployment
from plane.web3.services.etherscan import EtherscanClient, EtherscanError
from plane.web3.services.rpc import get_transaction_receipt

logger = logging.getLogger(__name__)


@shared_task
def confirm_pending_deployments():
    """For deployments that have a tx hash but no block number yet, fetch the
    receipt and fill block number, gas used, and effective gas price."""
    pending = ContractDeployment.objects.filter(block_number__isnull=True).exclude(deploy_tx_hash="").select_related(
        "network"
    )[:200]

    updated = 0
    for dep in pending:
        receipt = get_transaction_receipt(
            chain_id=dep.network.chain_id, tx_hash=dep.deploy_tx_hash, fallback_url=dep.network.rpc_url
        )
        if not receipt:
            continue
        dep.block_number = receipt.get("blockNumber")
        dep.gas_used = receipt.get("gasUsed")
        egp = receipt.get("effectiveGasPrice")
        if egp is not None:
            dep.effective_gas_price_wei = egp
        if not dep.deployed_at:
            dep.deployed_at = timezone.now()
        dep.save(
            update_fields=[
                "block_number",
                "gas_used",
                "effective_gas_price_wei",
                "deployed_at",
                "updated_at",
            ]
        )
        updated += 1
    logger.info("confirm_pending_deployments: updated %s deployments", updated)
    return updated


@shared_task
def sync_verification_status():
    """Refresh verification status for deployments that aren't yet verified,
    capturing the ABI when a contract becomes verified."""
    client = EtherscanClient()
    pending = ContractDeployment.objects.filter(
        verification_status__in=[ContractDeployment.Verification.UNVERIFIED, ContractDeployment.Verification.PENDING]
    ).select_related("network")[:100]

    updated = 0
    for dep in pending:
        try:
            info = client.get_source_code(dep.network.chain_id, dep.address)
        except EtherscanError as e:
            logger.warning("verification sync skipped for %s: %s", dep.address, e)
            continue
        except Exception as e:  # noqa: BLE001
            logger.warning("verification sync error for %s: %s", dep.address, e)
            continue

        if info.get("SourceCode"):
            dep.verification_status = ContractDeployment.Verification.VERIFIED
            dep.verified_at = timezone.now()
            if info.get("ABI") and info["ABI"] != "Contract source code not verified":
                dep.metadata = {**(dep.metadata or {}), "abi_source": "etherscan"}
            if info.get("CompilerVersion"):
                dep.compiler_version = info["CompilerVersion"]
            dep.save(update_fields=["verification_status", "verified_at", "compiler_version", "metadata", "updated_at"])
            updated += 1
    logger.info("sync_verification_status: verified %s deployments", updated)
    return updated
