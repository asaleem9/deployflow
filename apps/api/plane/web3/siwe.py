# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Sign-In With Ethereum (EIP-4361) helpers: server-side nonce issuance and
signature verification. The full message is composed server-side so the client
can't tamper with the domain or expiry, and nonces are single-use (Redis GETDEL)
with a short TTL to prevent replay."""

import os
import json
import secrets
import datetime

from siwe import SiweMessage

from plane.settings.redis import redis_instance
from plane.web3.utils.address import to_checksum_address, is_valid_address, normalize_address

# Nonce TTL. Short enough to bound replay, long enough for a human to sign.
NONCE_TTL_SECONDS = 300


def _nonce_key(address: str) -> str:
    return f"siwe_nonce:{normalize_address(address)}"


def siwe_domain() -> str:
    return os.environ.get("SIWE_DOMAIN", "localhost:3001")


def issue_nonce(address: str, chain_id: int, uri: str) -> str:
    """Compose a full EIP-4361 message for the given wallet, store the nonce in
    Redis keyed by address, and return the message string for the wallet to sign.
    Raises ValueError on an invalid address."""
    if not is_valid_address(address):
        raise ValueError("invalid address")

    checksum = to_checksum_address(address)
    nonce = secrets.token_urlsafe(16)
    issued_at = datetime.datetime.now(datetime.timezone.utc)
    expiration = issued_at + datetime.timedelta(seconds=NONCE_TTL_SECONDS)
    domain = siwe_domain()

    message = SiweMessage(
        domain=domain,
        address=checksum,
        statement="Sign in to DeployFlow with your Ethereum wallet.",
        uri=uri,
        version="1",
        chain_id=int(chain_id),
        nonce=nonce,
        issued_at=issued_at.isoformat(),
        expiration_time=expiration.isoformat(),
    )

    ri = redis_instance()
    ri.set(
        _nonce_key(checksum),
        json.dumps({"nonce": nonce, "chain_id": int(chain_id)}),
        ex=NONCE_TTL_SECONDS,
    )
    return message.prepare_message()


def verify_signature(message: str, signature: str) -> str:
    """Verify a signed SIWE message: parse it, check the domain and single-use
    nonce, and recover/validate the signature (siwe-py enforces expiry). Consumes
    the nonce atomically. Returns the checksummed signer address on success;
    raises ValueError on any failure."""
    try:
        siwe_message = SiweMessage.from_message(message)
    except Exception as exc:  # noqa: BLE001 — normalize parse errors
        raise ValueError(f"malformed SIWE message: {exc}")

    checksum = to_checksum_address(siwe_message.address)

    # Domain binding: reject messages minted for a different origin.
    if siwe_message.domain != siwe_domain():
        raise ValueError("domain mismatch")

    ri = redis_instance()
    # Atomic read-and-delete so a nonce can only be spent once.
    raw = ri.getdel(_nonce_key(checksum))
    if not raw:
        raise ValueError("nonce not found or already used")
    stored = json.loads(raw)

    if stored.get("nonce") != siwe_message.nonce:
        raise ValueError("nonce mismatch")

    # siwe-py verifies EIP-191 signature recovery, nonce, domain, and expiry.
    siwe_message.verify(signature, nonce=stored["nonce"], domain=siwe_domain())
    return checksum
