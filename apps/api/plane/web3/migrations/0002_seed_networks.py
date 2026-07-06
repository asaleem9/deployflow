# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import migrations

# EVM chains supported at launch: Ethereum + Base/Arbitrum/Optimism/Polygon and
# their testnets. Etherscan V2 uses one API key across all chains; only the
# Etherscan-family chains expose a gas oracle (OP-stack chains fall back to RPC
# eth_feeHistory).
NETWORKS = [
    # (name, slug, chain_id, is_testnet, symbol, explorer, rpc, gas_oracle, sort)
    ("Ethereum", "ethereum", 1, False, "ETH", "https://etherscan.io", "https://eth.llamarpc.com", True, 10),
    ("Sepolia", "sepolia", 11155111, True, "ETH", "https://sepolia.etherscan.io", "https://ethereum-sepolia-rpc.publicnode.com", True, 11),
    ("Base", "base", 8453, False, "ETH", "https://basescan.org", "https://mainnet.base.org", False, 20),
    ("Base Sepolia", "base-sepolia", 84532, True, "ETH", "https://sepolia.basescan.org", "https://sepolia.base.org", False, 21),
    ("Arbitrum One", "arbitrum", 42161, False, "ETH", "https://arbiscan.io", "https://arb1.arbitrum.io/rpc", False, 30),
    ("Arbitrum Sepolia", "arbitrum-sepolia", 421614, True, "ETH", "https://sepolia.arbiscan.io", "https://sepolia-rollup.arbitrum.io/rpc", False, 31),
    ("OP Mainnet", "optimism", 10, False, "ETH", "https://optimistic.etherscan.io", "https://mainnet.optimism.io", False, 40),
    ("OP Sepolia", "optimism-sepolia", 11155420, True, "ETH", "https://sepolia-optimism.etherscan.io", "https://sepolia.optimism.io", False, 41),
    ("Polygon PoS", "polygon", 137, False, "POL", "https://polygonscan.com", "https://polygon-rpc.com", True, 50),
    ("Polygon Amoy", "polygon-amoy", 80002, True, "POL", "https://amoy.polygonscan.com", "https://rpc-amoy.polygon.technology", True, 51),
]


def seed_networks(apps, schema_editor):
    Network = apps.get_model("web3", "Network")
    for name, slug, chain_id, is_testnet, symbol, explorer, rpc, gas_oracle, sort in NETWORKS:
        Network.objects.update_or_create(
            chain_id=chain_id,
            defaults={
                "name": name,
                "slug": slug,
                "is_testnet": is_testnet,
                "native_symbol": symbol,
                "explorer_base_url": explorer,
                "rpc_url": rpc,
                "supports_gas_oracle": gas_oracle,
                "is_enabled": True,
                "sort_order": sort,
            },
        )


def unseed_networks(apps, schema_editor):
    Network = apps.get_model("web3", "Network")
    Network.objects.filter(chain_id__in=[c[2] for c in NETWORKS]).delete()


class Migration(migrations.Migration):
    dependencies = [("web3", "0001_initial")]
    operations = [migrations.RunPython(seed_networks, unseed_networks)]
