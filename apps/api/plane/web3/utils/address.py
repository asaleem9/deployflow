# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Thin wrappers over eth_utils so address handling stays consistent (and easy
to stub in tests) across serializers, the SIWE provider, and Celery tasks."""

from eth_utils import is_address, to_checksum_address as _to_checksum


def is_valid_address(value: str) -> bool:
    try:
        return bool(value) and is_address(value)
    except Exception:
        return False


def to_checksum_address(value: str) -> str:
    """Return the EIP-55 checksummed form. Raises ValueError on invalid input."""
    return _to_checksum(value)


def normalize_address(value: str) -> str:
    """Lowercase form for case-insensitive comparisons/lookups."""
    return value.lower() if value else value
