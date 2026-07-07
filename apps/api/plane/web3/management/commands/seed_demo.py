# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Seed the public demo: a shared, already-onboarded demo user with a workspace,
a project, and realistic Web3 mock data (contracts, deployments, audits,
findings, bounties, a token launch, and issues). Idempotent — safe to re-run.

    python manage.py seed_demo
"""

import uuid
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from plane.db.models import (
    User,
    Profile,
    Workspace,
    WorkspaceMember,
    Project,
    ProjectMember,
    State,
    StateGroup,
    DEFAULT_STATES,
    Issue,
)
from plane.web3.models import (
    Network,
    SmartContract,
    ContractDeployment,
    Audit,
    AuditFinding,
    TokenLaunch,
    Bounty,
)

DEMO_EMAIL = "demo@deployflow.app"
DEMO_WORKSPACE_SLUG = "acme-protocol"


class Command(BaseCommand):
    help = "Seed the shared public demo workspace with Web3 mock data (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Wipe the demo project's data (contracts, audits, bounties, launches, issues) and re-seed. "
            "Use to clear visitor drift from the shared sandbox.",
        )

    def handle(self, *args, **options):
        user = self._demo_user()
        workspace = self._workspace(user)
        project = self._project(user, workspace)
        if options.get("reset"):
            self._wipe(project)
        self._web3_data(user, project)
        self.stdout.write(
            self.style.SUCCESS(
                f"Demo ready: user={DEMO_EMAIL} workspace=/{workspace.slug} project={project.name}"
            )
        )

    def _wipe(self, project):
        """Delete the demo project's mock data so _web3_data re-seeds it fresh.

        Two Plane soft-delete quirks force an explicit, child-first hard delete:
        soft-delete is a bulk UPDATE that never cascades to children, and the
        default `objects` manager hides already-soft-deleted rows. So we go
        through `all_objects` (every row) and delete children before parents."""
        from plane.web3.models import Audit, ContractDeployment, TokenLaunch, Bounty
        from plane.db.models import Issue

        from django.utils import timezone
        from plane.db.models import Project

        AuditFinding.all_objects.filter(project=project).delete()
        Audit.all_objects.filter(project=project).delete()
        ContractDeployment.all_objects.filter(project=project).delete()
        Bounty.all_objects.filter(project=project).delete()
        TokenLaunch.all_objects.filter(project=project).delete()
        SmartContract.all_objects.filter(project=project).delete()
        Issue.all_objects.filter(project=project).delete()

        # The demo workspace is a shared, writable sandbox, so visitors accumulate
        # their own projects. Soft-delete everything except the curated Acme Vault
        # so a scheduled reset always restores a clean showcase (hidden from the UI;
        # Plane's own cleanup task hard-deletes them later).
        extra = Project.objects.filter(workspace=project.workspace).exclude(id=project.id)
        extra_count = extra.count()
        if extra_count:
            extra.update(deleted_at=timezone.now())
        self.stdout.write(f"  reset: cleared demo data + {extra_count} visitor project(s)")

    # -- account -----------------------------------------------------------

    def _demo_user(self) -> User:
        user, created = User.objects.get_or_create(
            email=DEMO_EMAIL,
            defaults={
                "username": uuid.uuid4().hex,
                "first_name": "Demo",
                "last_name": "Explorer",
                "display_name": "Demo Explorer",
                "is_password_autoset": True,
                "is_email_verified": True,
            },
        )
        if created:
            user.set_password(uuid.uuid4().hex)
            user.save()
        profile, _ = Profile.objects.get_or_create(user=user)
        if not profile.is_onboarded:
            profile.is_onboarded = True
            profile.save(update_fields=["is_onboarded"])
        return user

    def _workspace(self, user: User) -> Workspace:
        workspace, _ = Workspace.objects.get_or_create(
            slug=DEMO_WORKSPACE_SLUG,
            defaults={"name": "Acme Protocol", "owner": user, "organization_size": "2-10"},
        )
        WorkspaceMember.objects.get_or_create(
            workspace=workspace, member=user, defaults={"role": 20}
        )
        return workspace

    def _project(self, user: User, workspace: Workspace) -> Project:
        project, created = Project.objects.get_or_create(
            workspace=workspace,
            identifier="ACME",
            defaults={"name": "Acme Vault", "description": "The Acme lending vault protocol.", "created_by": user},
        )
        ProjectMember.objects.get_or_create(
            project=project, member=user, defaults={"role": 20}
        )
        if created or not State.objects.filter(project=project).exists():
            State.objects.bulk_create(
                [
                    State(
                        name=s["name"],
                        color=s["color"],
                        project=project,
                        workspace=workspace,
                        sequence=s["sequence"],
                        group=s["group"],
                        default=s.get("default", False),
                        created_by=user,
                    )
                    for s in DEFAULT_STATES
                    if s["group"] != StateGroup.TRIAGE.value
                ]
            )
        return project

    # -- web3 mock data ----------------------------------------------------

    @transaction.atomic
    def _web3_data(self, user, project):
        if SmartContract.objects.filter(project=project).exists():
            return  # already seeded

        base = Network.objects.get(slug="base")
        arbitrum = Network.objects.get(slug="arbitrum")
        sepolia = Network.objects.get(slug="sepolia")
        now = timezone.now()

        # contracts across the lifecycle
        vault = SmartContract.objects.create(
            project=project, name="VaultManager", language="solidity",
            lifecycle_stage="live", current_version="1.2.0",
            repo_url="https://github.com/acme/vault", created_by=user,
        )
        router = SmartContract.objects.create(
            project=project, name="SwapRouter", language="solidity",
            lifecycle_stage="audit_in_progress", current_version="0.9.0", created_by=user,
        )
        staking = SmartContract.objects.create(
            project=project, name="StakingRewards", language="solidity",
            lifecycle_stage="development", current_version="0.3.0", created_by=user,
        )

        ContractDeployment.objects.create(
            project=project, contract=vault, network=base,
            address="0x1F98431c8aD98523631AE4a59f267346ea31F984",
            deploy_tx_hash="0x9f2c" + "a" * 60, version="1.2.0",
            compiler_version="v0.8.24+commit.e11b9ed9",
            verification_status="verified", verified_at=now - timedelta(days=12),
            block_number=18234567, gas_used=1240000, is_current=True, created_by=user,
        )
        ContractDeployment.objects.create(
            project=project, contract=vault, network=arbitrum,
            address="0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
            version="1.2.0", verification_status="verified",
            verified_at=now - timedelta(days=10), block_number=201234567,
            is_current=True, created_by=user,
        )
        ContractDeployment.objects.create(
            project=project, contract=router, network=sepolia,
            address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            version="0.9.0", verification_status="pending",
            block_number=5123456, is_current=True, created_by=user,
        )

        # an audit with findings across severities
        audit = Audit.objects.create(
            project=project, contract=vault, auditor_firm="Trail of Bits",
            audit_type="external", status="remediation",
            started_at=now - timedelta(days=20), created_by=user,
        )
        findings = [
            ("C-01", "Reentrancy in withdraw()", "critical", "acknowledged"),
            ("H-01", "Unchecked return value on transfer", "high", "remediated"),
            ("M-01", "Missing zero-address check in setOwner", "medium", "open"),
            ("M-02", "Rounding loss favors the protocol", "medium", "open"),
            ("L-01", "Events not emitted on config change", "low", "open"),
            ("I-01", "Prefer custom errors over require strings", "informational", "wont_fix"),
        ]
        for code, title, sev, st in findings:
            AuditFinding.objects.create(
                project=project, audit=audit, code=code, title=title,
                severity=sev, status=st,
                description_html=f"<p>{title}. See the audit report for details.</p>",
                created_by=user,
            )

        # a couple of issues + a bounty
        default_state = State.objects.filter(project=project, group=StateGroup.UNSTARTED.value).first()
        issue = Issue.objects.create(
            project=project, workspace=project.workspace, name="Gas-optimize the vault deposit path",
            priority="high", state=default_state, created_by=user,
        )
        Bounty.objects.create(
            project=project, issue=issue, network=base,
            reward_amount="750", reward_token_symbol="USDC", status="open",
            deadline=now + timedelta(days=21), created_by=user,
        )
        issue2 = Issue.objects.create(
            project=project, workspace=project.workspace, name="Add Foundry invariant tests for StakingRewards",
            priority="medium", state=default_state, created_by=user,
        )
        Bounty.objects.create(
            project=project, issue=issue2, network=arbitrum,
            reward_amount="1200", reward_token_symbol="ARB", status="claimed",
            deadline=now + timedelta(days=14), created_by=user,
        )

        # a token launch with allocations
        TokenLaunch.objects.create(
            project=project, name="ACME Token Generation Event", token_symbol="ACME",
            launch_type="tge", status="planning", token_contract=vault,
            network=base, target_date=now + timedelta(days=45),
            total_supply="1000000000",
            allocations=[
                {"label": "Community", "pct": 45, "vesting": "none"},
                {"label": "Team", "pct": 20, "vesting": "4yr / 1yr cliff"},
                {"label": "Treasury", "pct": 20, "vesting": "linear 3yr"},
                {"label": "Investors", "pct": 15, "vesting": "2yr / 6mo cliff"},
            ],
            created_by=user,
        )
