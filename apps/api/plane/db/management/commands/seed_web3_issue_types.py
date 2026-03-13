# Django imports
from django.core.management.base import BaseCommand, CommandError

# Module imports
from plane.db.models import Workspace, IssueType


WEB3_ISSUE_TYPES = [
    {
        "name": "Smart Contract Implementation",
        "description": "Development of new smart contracts or modifications to existing ones",
        "logo_props": {"icon": {"name": "code", "color": "#627EEA"}},
        "is_default": True,
        "level": 0,
    },
    {
        "name": "Audit Finding",
        "description": "Issues discovered during security audits that need resolution",
        "logo_props": {"icon": {"name": "shield", "color": "#D4382C"}},
        "is_default": False,
        "level": 0,
    },
    {
        "name": "Tokenomics Design",
        "description": "Token economic model design, supply mechanics, and distribution planning",
        "logo_props": {"icon": {"name": "pie-chart", "color": "#F59E0B"}},
        "is_default": False,
        "level": 0,
    },
    {
        "name": "Governance/Proposal",
        "description": "DAO governance proposals, voting mechanisms, and governance framework changes",
        "logo_props": {"icon": {"name": "vote", "color": "#7B61FF"}},
        "is_default": False,
        "level": 0,
    },
    {
        "name": "Multi-Chain Deployment",
        "description": "Deploying contracts across multiple blockchain networks",
        "logo_props": {"icon": {"name": "layers", "color": "#46A758"}},
        "is_default": False,
        "level": 0,
    },
    {
        "name": "Gas Optimization",
        "description": "Optimizing smart contract gas consumption and transaction costs",
        "logo_props": {"icon": {"name": "zap", "color": "#E07C24"}},
        "is_default": False,
        "level": 0,
    },
    {
        "name": "Cross-Chain Integration",
        "description": "Bridge integrations, cross-chain messaging, and interoperability work",
        "logo_props": {"icon": {"name": "link", "color": "#8FA8F8"}},
        "is_default": False,
        "level": 0,
    },
]


class Command(BaseCommand):
    help = "Seed web3 issue types for a workspace"

    def add_arguments(self, parser):
        parser.add_argument("--workspace", type=str, required=True, help="Workspace slug")

    def handle(self, *args, **options):
        workspace_slug = options["workspace"]

        try:
            workspace = Workspace.objects.get(slug=workspace_slug)
        except Workspace.DoesNotExist:
            raise CommandError(f'Workspace "{workspace_slug}" does not exist')

        created_count = 0
        for issue_type_data in WEB3_ISSUE_TYPES:
            _, created = IssueType.objects.get_or_create(
                workspace=workspace,
                name=issue_type_data["name"],
                defaults={
                    "description": issue_type_data["description"],
                    "logo_props": issue_type_data["logo_props"],
                    "is_default": issue_type_data["is_default"],
                    "level": issue_type_data["level"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_count} web3 issue types for workspace '{workspace_slug}'"
            )
        )
