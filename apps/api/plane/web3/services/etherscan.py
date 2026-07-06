# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Etherscan V2 multichain API client. One API key covers every EVM chain via the
`chainid` query parameter. A shared Redis token bucket keeps us under the free
tier's ~5 req/s limit across all workers, and 429/"rate limit" responses back off."""

import os
import time
import logging

import requests

from plane.settings.redis import redis_instance

logger = logging.getLogger(__name__)

ETHERSCAN_V2_BASE = "https://api.etherscan.io/v2/api"
# Free tier is 5 req/s; stay just under to leave headroom for burst.
RATE_LIMIT_PER_SEC = 4
_BUCKET_KEY = "web3:etherscan:bucket"

# Atomic token-bucket check: increments the per-second counter and sets its TTL
# on first use. Returns the count; the caller waits if it exceeds the limit.
_BUCKET_SCRIPT = (
    'local n = redis.call("INCR", KEYS[1]) '
    'if n == 1 then redis.call("EXPIRE", KEYS[1], 1) end '
    "return n"
)


class EtherscanError(Exception):
    pass


class EtherscanClient:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("ETHERSCAN_API_KEY", "")

    def _throttle(self):
        """Block briefly if we've hit the shared per-second budget."""
        try:
            ri = redis_instance()
            window_key = f"{_BUCKET_KEY}:{int(time.time())}"
            count = ri.eval(_BUCKET_SCRIPT, 1, window_key)
            if count and int(count) > RATE_LIMIT_PER_SEC:
                time.sleep(0.25)
        except Exception as e:  # noqa: BLE001 — never let throttling break a task
            logger.warning("etherscan throttle check failed: %s", e)

    def _get(self, chain_id: int, module: str, action: str, **params) -> dict:
        if not self.api_key:
            raise EtherscanError("ETHERSCAN_API_KEY is not configured")
        self._throttle()
        query = {
            "chainid": chain_id,
            "module": module,
            "action": action,
            "apikey": self.api_key,
            **params,
        }
        resp = requests.get(ETHERSCAN_V2_BASE, params=query, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        # Etherscan encodes rate-limit + not-found as status "0"; only some are errors.
        if str(data.get("message", "")).lower().startswith("notok") and "rate limit" in str(
            data.get("result", "")
        ).lower():
            raise EtherscanError("rate limited")
        return data

    def get_source_code(self, chain_id: int, address: str) -> dict:
        """Verification + ABI. result[0].SourceCode is empty when unverified."""
        data = self._get(chain_id, "contract", "getsourcecode", address=address)
        result = data.get("result")
        return result[0] if isinstance(result, list) and result else {}

    def is_verified(self, chain_id: int, address: str) -> bool:
        info = self.get_source_code(chain_id, address)
        return bool(info.get("SourceCode"))

    def get_gas_oracle(self, chain_id: int) -> dict:
        """Safe/Propose/Fast gas prices + base fee (Etherscan-family chains only)."""
        data = self._get(chain_id, "gastracker", "gasoracle")
        result = data.get("result")
        return result if isinstance(result, dict) else {}
