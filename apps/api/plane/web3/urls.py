# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path

from plane.web3.views import (
    NetworkListEndpoint,
    SmartContractViewSet,
    ContractDeploymentViewSet,
    DeploymentRefreshEndpoint,
    IssueContractLinkViewSet,
    AuditViewSet,
    AuditFindingViewSet,
    FindingCreateWithAuditEndpoint,
    FindingRemediationIssueEndpoint,
    TokenLaunchViewSet,
    BountyViewSet,
    BountyCreateWithIssueEndpoint,
    UserWalletViewSet,
    WalletLinkVerifyEndpoint,
)

WS = "workspaces/<str:slug>"
PROJ = f"{WS}/projects/<uuid:project_id>"

list_create = {"get": "list", "post": "create"}
detail = {"get": "retrieve", "patch": "partial_update", "put": "update", "delete": "destroy"}

urlpatterns = [
    # networks (workspace-scoped, read-only)
    path(f"{WS}/networks/", NetworkListEndpoint.as_view(), name="web3-networks"),
    # smart contracts
    path(f"{PROJ}/contracts/", SmartContractViewSet.as_view(list_create), name="web3-contracts"),
    path(f"{PROJ}/contracts/<uuid:pk>/", SmartContractViewSet.as_view(detail), name="web3-contract-detail"),
    # deployments (nested under a contract, and flat for refresh/detail)
    path(
        f"{PROJ}/contracts/<uuid:contract_id>/deployments/",
        ContractDeploymentViewSet.as_view(list_create),
        name="web3-contract-deployments",
    ),
    path(
        f"{PROJ}/deployments/<uuid:pk>/",
        ContractDeploymentViewSet.as_view(detail),
        name="web3-deployment-detail",
    ),
    path(
        f"{PROJ}/deployments/<uuid:pk>/refresh/",
        DeploymentRefreshEndpoint.as_view(),
        name="web3-deployment-refresh",
    ),
    # issue <-> contract links
    path(
        f"{PROJ}/issues/<uuid:issue_id>/contract-links/",
        IssueContractLinkViewSet.as_view(list_create),
        name="web3-issue-contract-links",
    ),
    path(
        f"{PROJ}/contract-links/<uuid:pk>/",
        IssueContractLinkViewSet.as_view(detail),
        name="web3-issue-contract-link-detail",
    ),
    # audits + findings
    path(
        f"{PROJ}/contracts/<uuid:contract_id>/audits/",
        AuditViewSet.as_view(list_create),
        name="web3-contract-audits",
    ),
    path(f"{PROJ}/audits/", AuditViewSet.as_view({"get": "list"}), name="web3-audits"),
    path(f"{PROJ}/audits/<uuid:pk>/", AuditViewSet.as_view(detail), name="web3-audit-detail"),
    path(
        f"{PROJ}/audits/<uuid:audit_id>/findings/",
        AuditFindingViewSet.as_view(list_create),
        name="web3-audit-findings",
    ),
    path(f"{PROJ}/findings/", AuditFindingViewSet.as_view({"get": "list"}), name="web3-findings"),
    path(
        f"{PROJ}/findings/create-with-audit/",
        FindingCreateWithAuditEndpoint.as_view(),
        name="web3-finding-create-with-audit",
    ),
    path(f"{PROJ}/findings/<uuid:pk>/", AuditFindingViewSet.as_view(detail), name="web3-finding-detail"),
    path(
        f"{PROJ}/findings/<uuid:pk>/remediation-issue/",
        FindingRemediationIssueEndpoint.as_view(),
        name="web3-finding-remediation",
    ),
    # token launches
    path(f"{PROJ}/token-launches/", TokenLaunchViewSet.as_view(list_create), name="web3-token-launches"),
    path(f"{PROJ}/token-launches/<uuid:pk>/", TokenLaunchViewSet.as_view(detail), name="web3-token-launch-detail"),
    # bounties
    path(f"{PROJ}/bounties/", BountyViewSet.as_view(list_create), name="web3-bounties"),
    path(
        f"{PROJ}/bounties/create-with-issue/",
        BountyCreateWithIssueEndpoint.as_view(),
        name="web3-bounty-create-with-issue",
    ),
    path(f"{PROJ}/bounties/<uuid:pk>/", BountyViewSet.as_view(detail), name="web3-bounty-detail"),
    # user wallets
    path("users/me/wallets/", UserWalletViewSet.as_view({"get": "list"}), name="web3-user-wallets"),
    path("users/me/wallets/<uuid:pk>/", UserWalletViewSet.as_view({"delete": "destroy"}), name="web3-user-wallet-detail"),
    path("users/me/wallets/link/", WalletLinkVerifyEndpoint.as_view(), name="web3-wallet-link"),
]
