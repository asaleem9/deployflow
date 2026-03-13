# Django imports
from django.core.management.base import BaseCommand, CommandError

# Module imports
from plane.db.models import Workspace, Label


WEB3_LABELS = {
    # Parent labels with their children
    "Audit Severity": {
        "color": "#D4382C",
        "children": [
            {"name": "critical", "color": "#DC2626"},
            {"name": "high", "color": "#EA580C"},
            {"name": "medium", "color": "#F59E0B"},
            {"name": "low", "color": "#627EEA"},
            {"name": "informational", "color": "#9AA4BC"},
        ],
    },
    "Deployment": {
        "color": "#46A758",
        "children": [
            {"name": "testnet-only", "color": "#7B61FF"},
            {"name": "mainnet-ready", "color": "#46A758"},
            {"name": "cross-chain", "color": "#8FA8F8"},
        ],
    },
    "Requirements": {
        "color": "#E07C24",
        "children": [
            {"name": "gas-optimization", "color": "#F59E0B"},
            {"name": "multi-sig-required", "color": "#D4382C"},
            {"name": "governance-vote-needed", "color": "#7B61FF"},
        ],
    },
    "Chains": {
        "color": "#627EEA",
        "children": [
            {"name": "ethereum", "color": "#627EEA"},
            {"name": "polygon", "color": "#8247E5"},
            {"name": "arbitrum", "color": "#28A0F0"},
            {"name": "optimism", "color": "#FF0420"},
            {"name": "base", "color": "#0052FF"},
            {"name": "solana", "color": "#9945FF"},
        ],
    },
}


class Command(BaseCommand):
    help = "Seed web3 labels for a workspace"

    def add_arguments(self, parser):
        parser.add_argument("--workspace", type=str, required=True, help="Workspace slug")

    def handle(self, *args, **options):
        workspace_slug = options["workspace"]

        try:
            workspace = Workspace.objects.get(slug=workspace_slug)
        except Workspace.DoesNotExist:
            raise CommandError(f'Workspace "{workspace_slug}" does not exist')

        created_count = 0
        sort_order = 1000

        for parent_name, parent_data in WEB3_LABELS.items():
            parent_label, created = Label.objects.get_or_create(
                workspace=workspace,
                name=parent_name,
                project=None,
                defaults={
                    "color": parent_data["color"],
                    "sort_order": sort_order,
                },
            )
            if created:
                created_count += 1
            sort_order += 1000

            for child_data in parent_data["children"]:
                _, created = Label.objects.get_or_create(
                    workspace=workspace,
                    name=child_data["name"],
                    parent=parent_label,
                    project=None,
                    defaults={
                        "color": child_data["color"],
                        "sort_order": sort_order,
                    },
                )
                if created:
                    created_count += 1
                sort_order += 1000

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_count} web3 labels for workspace '{workspace_slug}'"
            )
        )
