# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Confirm bounty payouts on-chain. DeployFlow never moves funds itself — a
maintainer records the payout transaction hash, and this task verifies the tx was
actually mined before the bounty is treated as settled."""

import logging

from celery import shared_task

from plane.web3.models import Bounty
from plane.web3.services.rpc import get_transaction_receipt

logger = logging.getLogger(__name__)


@shared_task
def verify_bounty_payouts():
    """For bounties marked approved/paid that carry a payout tx hash but aren't
    yet confirmed, check the receipt and flip them to paid when the tx is mined."""
    # Approved bounties with a recorded payout tx that haven't been confirmed paid.
    candidates = (
        Bounty.objects.filter(status=Bounty.Status.APPROVED)
        .exclude(payout_tx_hash="")
        .select_related("network")[:200]
    )

    confirmed = 0
    for bounty in candidates:
        receipt = get_transaction_receipt(
            chain_id=bounty.network.chain_id, tx_hash=bounty.payout_tx_hash, fallback_url=bounty.network.rpc_url
        )
        if not receipt:
            continue
        # a successful receipt (status == 1) confirms the payout landed
        if receipt.get("status") == 1:
            bounty.status = Bounty.Status.PAID
            bounty.save(update_fields=["status", "updated_at"])
            confirmed += 1
    logger.info("verify_bounty_payouts: confirmed %s payouts", confirmed)
    return confirmed
