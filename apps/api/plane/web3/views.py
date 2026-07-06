# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db.models import Count

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from plane.app.permissions import ProjectEntityPermission
from plane.app.views.base import BaseViewSet, BaseAPIView
from plane.web3.models import (
    Network,
    SmartContract,
    ContractDeployment,
    IssueContractLink,
    Audit,
    AuditFinding,
    TokenLaunch,
    Bounty,
    WalletAddress,
)
from plane.web3.serializers import (
    NetworkSerializer,
    SmartContractSerializer,
    ContractDeploymentSerializer,
    IssueContractLinkSerializer,
    AuditSerializer,
    AuditFindingSerializer,
    TokenLaunchSerializer,
    BountySerializer,
    WalletAddressSerializer,
)


class ProjectScopedWeb3ViewSet(BaseViewSet):
    """Base for project-scoped web3 resources. Filters by the workspace slug and
    project_id in the URL, and stamps project_id on create (workspace is derived
    from the project by ProjectBaseModel.save)."""

    permission_classes = [ProjectEntityPermission]

    def get_queryset(self):
        return (
            self.model.objects.filter(
                workspace__slug=self.kwargs.get("slug"),
                project_id=self.kwargs.get("project_id"),
            )
            .select_related("project", "workspace")
        )

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs.get("project_id"))


class NetworkListEndpoint(BaseAPIView):
    """Read-only list of enabled chains for a workspace. Networks are global, so
    this is workspace-scoped only for URL symmetry and auth."""

    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        networks = Network.objects.filter(is_enabled=True)
        return Response(NetworkSerializer(networks, many=True).data, status=status.HTTP_200_OK)


class SmartContractViewSet(ProjectScopedWeb3ViewSet):
    model = SmartContract
    serializer_class = SmartContractSerializer
    search_fields = ["name"]

    def get_queryset(self):
        return super().get_queryset().annotate(deployment_count=Count("deployments"))


class ContractDeploymentViewSet(ProjectScopedWeb3ViewSet):
    model = ContractDeployment
    serializer_class = ContractDeploymentSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related("network", "contract")
        contract_id = self.kwargs.get("contract_id")
        if contract_id:
            qs = qs.filter(contract_id=contract_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs.get("project_id"),
            contract_id=self.kwargs.get("contract_id"),
        )


class DeploymentRefreshEndpoint(BaseAPIView):
    """Trigger an on-demand receipt + verification sync for a single deployment.
    Returns immediately; the async tasks update the row. Also flips status to
    'pending' so the UI reflects that a check is in flight."""

    permission_classes = [ProjectEntityPermission]

    def post(self, request, slug, project_id, pk):
        from plane.web3.bgtasks.explorer_sync import confirm_pending_deployments, sync_verification_status

        deployment = ContractDeployment.objects.filter(
            workspace__slug=slug, project_id=project_id, pk=pk
        ).first()
        if not deployment:
            return Response({"error": "deployment not found"}, status=status.HTTP_404_NOT_FOUND)

        if deployment.verification_status == ContractDeployment.Verification.UNVERIFIED:
            deployment.verification_status = ContractDeployment.Verification.PENDING
            deployment.save(update_fields=["verification_status", "updated_at"])

        # Kick the shared reconcilers; they pick up this row along with any others.
        confirm_pending_deployments.delay()
        sync_verification_status.delay()
        return Response({"status": "refresh queued"}, status=status.HTTP_202_ACCEPTED)


class IssueContractLinkViewSet(ProjectScopedWeb3ViewSet):
    model = IssueContractLink
    serializer_class = IssueContractLinkSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related("deployment")
        issue_id = self.kwargs.get("issue_id")
        if issue_id:
            qs = qs.filter(issue_id=issue_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs.get("project_id"),
            issue_id=self.kwargs.get("issue_id"),
        )


class AuditViewSet(ProjectScopedWeb3ViewSet):
    model = Audit
    serializer_class = AuditSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related("contract").annotate(findings_count=Count("findings"))
        contract_id = self.kwargs.get("contract_id")
        if contract_id:
            qs = qs.filter(contract_id=contract_id)
        return qs

    def perform_create(self, serializer):
        kwargs = {"project_id": self.kwargs.get("project_id")}
        if self.kwargs.get("contract_id"):
            kwargs["contract_id"] = self.kwargs.get("contract_id")
        serializer.save(**kwargs)


# Finding severity -> issue priority. Critical findings become urgent work.
SEVERITY_TO_PRIORITY = {
    "critical": "urgent",
    "high": "high",
    "medium": "medium",
    "low": "low",
    "informational": "none",
}


class AuditFindingViewSet(ProjectScopedWeb3ViewSet):
    model = AuditFinding
    serializer_class = AuditFindingSerializer
    search_fields = ["title", "code"]

    def get_queryset(self):
        qs = super().get_queryset().select_related("audit")
        audit_id = self.kwargs.get("audit_id")
        if audit_id:
            qs = qs.filter(audit_id=audit_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs.get("project_id"),
            audit_id=self.kwargs.get("audit_id"),
        )


class FindingCreateWithAuditEndpoint(BaseAPIView):
    """Create a finding against a contract, opening (or reusing) an audit for that
    contract in one call — so the findings board can add a finding without a
    separate audit-setup step."""

    permission_classes = [ProjectEntityPermission]

    def post(self, request, slug, project_id):
        contract_id = request.data.get("contract")
        title = (request.data.get("title") or "").strip()
        if not contract_id or not title:
            return Response({"error": "contract and title are required"}, status=status.HTTP_400_BAD_REQUEST)

        contract = SmartContract.objects.filter(project_id=project_id, pk=contract_id).first()
        if not contract:
            return Response({"error": "contract not found"}, status=status.HTTP_404_NOT_FOUND)

        # reuse an in-progress audit for this contract, or open a new internal one
        audit = (
            Audit.objects.filter(project_id=project_id, contract=contract)
            .exclude(status=Audit.Status.SIGNED_OFF)
            .order_by("-created_at")
            .first()
        )
        if not audit:
            audit = Audit.objects.create(
                project_id=project_id,
                contract=contract,
                audit_type=Audit.AuditType.INTERNAL,
                status=Audit.Status.IN_PROGRESS,
            )

        finding = AuditFinding.objects.create(
            project_id=project_id,
            audit=audit,
            code=request.data.get("code", ""),
            title=title[:500],
            severity=request.data.get("severity", AuditFinding.Severity.MEDIUM),
            description_html=request.data.get("description_html", "<p></p>"),
        )
        return Response(AuditFindingSerializer(finding).data, status=status.HTTP_201_CREATED)


class FindingRemediationIssueEndpoint(BaseAPIView):
    """Create a real Plane work item to track remediation of a finding, carrying
    severity across to priority, and link it back on the finding. Idempotent: if a
    remediation issue already exists, it is returned rather than duplicated."""

    permission_classes = [ProjectEntityPermission]

    def post(self, request, slug, project_id, pk):
        from plane.db.models import Issue, Project

        finding = (
            AuditFinding.objects.filter(workspace__slug=slug, project_id=project_id, pk=pk)
            .select_related("remediation_issue")
            .first()
        )
        if not finding:
            return Response({"error": "finding not found"}, status=status.HTTP_404_NOT_FOUND)

        if finding.remediation_issue_id:
            return Response(
                {"issue_id": str(finding.remediation_issue_id), "created": False}, status=status.HTTP_200_OK
            )

        project = Project.objects.get(id=project_id)
        code = f"{finding.code} " if finding.code else ""
        issue = Issue.objects.create(
            project=project,
            workspace=project.workspace,
            name=f"Remediate {code}{finding.title}"[:255],
            description_html=finding.description_html or "<p></p>",
            priority=SEVERITY_TO_PRIORITY.get(finding.severity, "medium"),
        )
        finding.remediation_issue = issue
        finding.status = AuditFinding.Status.ACKNOWLEDGED
        finding.save(update_fields=["remediation_issue", "status", "updated_at"])
        return Response(
            {"issue_id": str(issue.id), "sequence_id": issue.sequence_id, "created": True},
            status=status.HTTP_201_CREATED,
        )


class TokenLaunchViewSet(ProjectScopedWeb3ViewSet):
    model = TokenLaunch
    serializer_class = TokenLaunchSerializer
    search_fields = ["name", "token_symbol"]


class BountyViewSet(ProjectScopedWeb3ViewSet):
    model = Bounty
    serializer_class = BountySerializer


class BountyCreateWithIssueEndpoint(BaseAPIView):
    """Create a bounty and its backing work item in one call, so the board can
    open a bounty from a title + reward without a separate issue-picker step."""

    permission_classes = [ProjectEntityPermission]

    def post(self, request, slug, project_id):
        from plane.db.models import Issue, Project

        title = (request.data.get("title") or "").strip()
        network_id = request.data.get("network")
        if not title or not network_id:
            return Response(
                {"error": "title and network are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        project = Project.objects.get(id=project_id)
        issue = Issue.objects.create(
            project=project,
            workspace=project.workspace,
            name=title[:255],
            priority=request.data.get("priority", "medium"),
        )
        bounty = Bounty.objects.create(
            project=project,
            issue=issue,
            network_id=network_id,
            reward_amount=str(request.data.get("reward_amount", "")),
            reward_token_symbol=request.data.get("reward_token_symbol", ""),
            status=Bounty.Status.OPEN,
        )
        return Response(BountySerializer(bounty).data, status=status.HTTP_201_CREATED)


class UserWalletViewSet(BaseViewSet):
    """A user's linked wallets. Not project-scoped — wallets belong to the user.
    Creation goes through the wallet-link verify flow (proves ownership), so this
    viewset only lists and unlinks."""

    model = WalletAddress
    serializer_class = WalletAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WalletAddress.objects.filter(user=self.request.user)


class WalletLinkVerifyEndpoint(BaseAPIView):
    """Link a wallet to the signed-in user. The client requests a nonce from
    /auth/siwe/nonce/ and signs it; this endpoint verifies the signature (proving
    ownership) and attaches the address to request.user rather than logging in.
    Reuses the same single-use-nonce verification as SIWE login."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        from plane.web3.siwe import verify_signature
        from django.utils import timezone

        message = request.data.get("message", "")
        signature = request.data.get("signature", "")
        if not message or not signature:
            return Response({"error": "message and signature are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            address = verify_signature(message=message, signature=signature)
        except Exception as e:  # noqa: BLE001
            return Response({"error": f"verification failed: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

        existing = WalletAddress.objects.filter(address__iexact=address).select_related("user").first()
        if existing and existing.user_id != request.user.id:
            return Response(
                {"error": "This wallet is already linked to another account."}, status=status.HTTP_409_CONFLICT
            )

        wallet, _ = WalletAddress.objects.get_or_create(
            address=address,
            defaults={"user": request.user, "is_primary": not request.user.wallets.exists()},
        )
        wallet.verified_at = timezone.now()
        wallet.save(update_fields=["verified_at", "updated_at"])
        return Response(WalletAddressSerializer(wallet).data, status=status.HTTP_200_OK)
