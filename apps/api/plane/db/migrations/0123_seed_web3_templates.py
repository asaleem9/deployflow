# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import migrations


WEB3_TEMPLATES = [
    {
        "name": "Smart Contract Development",
        "description": "Full lifecycle smart contract project with audit and deployment tracking",
        "icon": "code",
        "sort_order": 1000,
        "states_config": [
            {"name": "Specification/Design", "color": "#627EEA", "group": "backlog", "default": True},
            {"name": "Development", "color": "#F59E0B", "group": "started"},
            {"name": "Internal Testing", "color": "#F59E0B", "group": "started"},
            {"name": "Audit Readiness", "color": "#E07C24", "group": "started"},
            {"name": "Under Audit", "color": "#D4382C", "group": "started"},
            {"name": "Audit Review", "color": "#E07C24", "group": "started"},
            {"name": "Testnet Staging", "color": "#7B61FF", "group": "started"},
            {"name": "Mainnet Ready", "color": "#46A758", "group": "completed"},
            {"name": "Mainnet Deployed", "color": "#46A758", "group": "completed"},
            {"name": "Post-Launch Monitoring", "color": "#46A758", "group": "completed"},
        ],
        "labels_config": [
            {"name": "Audit Severity", "color": "#D4382C", "children": [
                {"name": "critical", "color": "#DC2626"},
                {"name": "high", "color": "#EA580C"},
                {"name": "medium", "color": "#F59E0B"},
                {"name": "low", "color": "#627EEA"},
            ]},
            {"name": "Requirements", "color": "#E07C24", "children": [
                {"name": "gas-optimization", "color": "#F59E0B"},
                {"name": "multi-sig-required", "color": "#D4382C"},
            ]},
        ],
        "issue_types_config": [
            {"name": "Smart Contract Implementation"},
            {"name": "Audit Finding"},
            {"name": "Gas Optimization"},
        ],
    },
    {
        "name": "DeFi Protocol",
        "description": "DeFi protocol development with tokenomics and liquidity management",
        "icon": "trending-up",
        "sort_order": 2000,
        "states_config": [
            {"name": "Specification/Design", "color": "#627EEA", "group": "backlog", "default": True},
            {"name": "Governance Review", "color": "#8FA8F8", "group": "unstarted"},
            {"name": "Development", "color": "#F59E0B", "group": "started"},
            {"name": "Internal Testing", "color": "#F59E0B", "group": "started"},
            {"name": "Under Audit", "color": "#D4382C", "group": "started"},
            {"name": "Testnet Staging", "color": "#7B61FF", "group": "started"},
            {"name": "Community Testing", "color": "#7B61FF", "group": "started"},
            {"name": "Mainnet Ready", "color": "#46A758", "group": "completed"},
            {"name": "Mainnet Deployed", "color": "#46A758", "group": "completed"},
            {"name": "Post-Launch Monitoring", "color": "#46A758", "group": "completed"},
        ],
        "labels_config": [
            {"name": "Audit Severity", "color": "#D4382C", "children": [
                {"name": "critical", "color": "#DC2626"},
                {"name": "high", "color": "#EA580C"},
                {"name": "medium", "color": "#F59E0B"},
                {"name": "low", "color": "#627EEA"},
            ]},
            {"name": "Deployment", "color": "#46A758", "children": [
                {"name": "testnet-only", "color": "#7B61FF"},
                {"name": "mainnet-ready", "color": "#46A758"},
            ]},
        ],
        "issue_types_config": [
            {"name": "Smart Contract Implementation"},
            {"name": "Tokenomics Design"},
            {"name": "Audit Finding"},
            {"name": "Gas Optimization"},
        ],
    },
    {
        "name": "DAO/Governance",
        "description": "DAO governance framework with proposal tracking and voting mechanisms",
        "icon": "vote",
        "sort_order": 3000,
        "states_config": [
            {"name": "Specification/Design", "color": "#627EEA", "group": "backlog", "default": True},
            {"name": "Governance Review", "color": "#8FA8F8", "group": "unstarted"},
            {"name": "Development", "color": "#F59E0B", "group": "started"},
            {"name": "Community Testing", "color": "#7B61FF", "group": "started"},
            {"name": "Mainnet Ready", "color": "#46A758", "group": "completed"},
            {"name": "Mainnet Deployed", "color": "#46A758", "group": "completed"},
        ],
        "labels_config": [
            {"name": "Requirements", "color": "#E07C24", "children": [
                {"name": "governance-vote-needed", "color": "#7B61FF"},
                {"name": "multi-sig-required", "color": "#D4382C"},
            ]},
        ],
        "issue_types_config": [
            {"name": "Governance/Proposal"},
            {"name": "Smart Contract Implementation"},
        ],
    },
    {
        "name": "NFT Project",
        "description": "NFT collection or marketplace with minting and metadata management",
        "icon": "image",
        "sort_order": 4000,
        "states_config": [
            {"name": "Specification/Design", "color": "#627EEA", "group": "backlog", "default": True},
            {"name": "Development", "color": "#F59E0B", "group": "started"},
            {"name": "Internal Testing", "color": "#F59E0B", "group": "started"},
            {"name": "Testnet Staging", "color": "#7B61FF", "group": "started"},
            {"name": "Community Testing", "color": "#7B61FF", "group": "started"},
            {"name": "Mainnet Ready", "color": "#46A758", "group": "completed"},
            {"name": "Mainnet Deployed", "color": "#46A758", "group": "completed"},
        ],
        "labels_config": [
            {"name": "Chains", "color": "#627EEA", "children": [
                {"name": "ethereum", "color": "#627EEA"},
                {"name": "polygon", "color": "#8247E5"},
                {"name": "base", "color": "#0052FF"},
            ]},
        ],
        "issue_types_config": [
            {"name": "Smart Contract Implementation"},
            {"name": "Gas Optimization"},
        ],
    },
    {
        "name": "Cross-Chain Bridge",
        "description": "Cross-chain bridge development with multi-network deployment",
        "icon": "link",
        "sort_order": 5000,
        "states_config": [
            {"name": "Specification/Design", "color": "#627EEA", "group": "backlog", "default": True},
            {"name": "Development", "color": "#F59E0B", "group": "started"},
            {"name": "Internal Testing", "color": "#F59E0B", "group": "started"},
            {"name": "Audit Readiness", "color": "#E07C24", "group": "started"},
            {"name": "Under Audit", "color": "#D4382C", "group": "started"},
            {"name": "Audit Review", "color": "#E07C24", "group": "started"},
            {"name": "Testnet Staging", "color": "#7B61FF", "group": "started"},
            {"name": "Mainnet Ready", "color": "#46A758", "group": "completed"},
            {"name": "Mainnet Deployed", "color": "#46A758", "group": "completed"},
            {"name": "Post-Launch Monitoring", "color": "#46A758", "group": "completed"},
        ],
        "labels_config": [
            {"name": "Chains", "color": "#627EEA", "children": [
                {"name": "ethereum", "color": "#627EEA"},
                {"name": "polygon", "color": "#8247E5"},
                {"name": "arbitrum", "color": "#28A0F0"},
                {"name": "optimism", "color": "#FF0420"},
                {"name": "base", "color": "#0052FF"},
            ]},
            {"name": "Deployment", "color": "#46A758", "children": [
                {"name": "testnet-only", "color": "#7B61FF"},
                {"name": "mainnet-ready", "color": "#46A758"},
                {"name": "cross-chain", "color": "#8FA8F8"},
            ]},
        ],
        "issue_types_config": [
            {"name": "Smart Contract Implementation"},
            {"name": "Cross-Chain Integration"},
            {"name": "Multi-Chain Deployment"},
            {"name": "Audit Finding"},
        ],
    },
]


def seed_templates(apps, schema_editor):
    ProjectTemplate = apps.get_model("db", "ProjectTemplate")
    for template_data in WEB3_TEMPLATES:
        ProjectTemplate.objects.get_or_create(
            name=template_data["name"],
            defaults={
                "description": template_data["description"],
                "icon": template_data["icon"],
                "sort_order": template_data["sort_order"],
                "states_config": template_data["states_config"],
                "labels_config": template_data["labels_config"],
                "issue_types_config": template_data["issue_types_config"],
            },
        )


def remove_templates(apps, schema_editor):
    ProjectTemplate = apps.get_model("db", "ProjectTemplate")
    names = [t["name"] for t in WEB3_TEMPLATES]
    ProjectTemplate.objects.filter(name__in=names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0122_projecttemplate"),
    ]

    operations = [
        migrations.RunPython(seed_templates, remove_templates),
    ]
