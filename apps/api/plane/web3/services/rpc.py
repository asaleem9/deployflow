# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""JSON-RPC helpers via web3.py: transaction receipts (for deployment
confirmation) and eth_feeHistory-based gas (the fallback for chains without an
Etherscan gas oracle, e.g. OP-stack). The RPC URL comes from a per-chain env
override (WEB3_RPC_URL_<chain_id>) or the Network row's rpc_url."""

import os
import logging

from web3 import Web3

logger = logging.getLogger(__name__)


def rpc_url_for(chain_id: int, fallback: str = "") -> str:
    return os.environ.get(f"WEB3_RPC_URL_{chain_id}", "") or fallback


def _client(chain_id: int, fallback_url: str) -> Web3 | None:
    url = rpc_url_for(chain_id, fallback_url)
    if not url:
        return None
    try:
        return Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 15}))
    except Exception as e:  # noqa: BLE001
        logger.warning("rpc client init failed for chain %s: %s", chain_id, e)
        return None


def get_transaction_receipt(chain_id: int, tx_hash: str, fallback_url: str = "") -> dict | None:
    """Return the receipt for a mined tx, or None if pending/unavailable."""
    w3 = _client(chain_id, fallback_url)
    if not w3:
        return None
    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        return dict(receipt) if receipt else None
    except Exception:
        # Not yet mined, or transient RPC error — treat as "not ready".
        return None


def get_fee_history_gwei(chain_id: int, fallback_url: str = "") -> dict | None:
    """Approximate current gas from eth_feeHistory: the latest base fee plus a
    median priority-fee tip. Used where no Etherscan gas oracle exists."""
    w3 = _client(chain_id, fallback_url)
    if not w3:
        return None
    try:
        history = w3.eth.fee_history(5, "latest", [25, 50, 75])
        base_fees = history.get("baseFeePerGas") or []
        rewards = history.get("reward") or []
        if not base_fees:
            return None
        base_fee_wei = base_fees[-1]
        # median tip from the most recent block's reward percentiles
        tip_wei = rewards[-1][1] if rewards and len(rewards[-1]) > 1 else 0
        to_gwei = lambda wei: float(Web3.from_wei(wei, "gwei"))
        base = to_gwei(base_fee_wei)
        tip = to_gwei(tip_wei)
        return {"base_fee": base, "safe": base + tip, "propose": base + tip, "fast": base + tip * 1.5}
    except Exception as e:  # noqa: BLE001
        logger.warning("fee_history failed for chain %s: %s", chain_id, e)
        return None
