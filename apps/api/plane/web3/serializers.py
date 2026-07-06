# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework import serializers

from plane.app.serializers.base import BaseSerializer
from plane.web3.models import (
    Network,
    SmartContract,
    ContractDeployment,
    IssueContractLink,
    NetworkGasSnapshot,
    Audit,
    AuditChecklistItem,
    AuditFinding,
    WalletAddress,
    TokenLaunch,
    AirdropBatch,
    Bounty,
)
from plane.web3.utils.address import to_checksum_address, is_valid_address

# Fields every ProjectBaseModel row carries and that the client never sets.
PROJECT_READONLY = ("workspace", "project", "created_by", "updated_by", "created_at", "updated_at")


class NetworkSerializer(BaseSerializer):
    class Meta:
        model = Network
        fields = "__all__"


class SmartContractSerializer(BaseSerializer):
    deployment_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = SmartContract
        fields = "__all__"
        read_only_fields = PROJECT_READONLY


class ContractDeploymentSerializer(BaseSerializer):
    explorer_url = serializers.SerializerMethodField()

    class Meta:
        model = ContractDeployment
        fields = "__all__"
        # contract comes from the URL; on-chain fields are filled by Celery, not the client.
        read_only_fields = (
            *PROJECT_READONLY,
            "contract",
            "verification_status",
            "verified_at",
            "block_number",
            "gas_used",
        )

    def get_explorer_url(self, obj):
        if obj.network and obj.address:
            return f"{obj.network.explorer_base_url.rstrip('/')}/address/{obj.address}"
        return None

    def validate_address(self, value):
        if value and not is_valid_address(value):
            raise serializers.ValidationError("Not a valid EVM address.")
        return to_checksum_address(value) if value else value


class IssueContractLinkSerializer(BaseSerializer):
    class Meta:
        model = IssueContractLink
        fields = "__all__"
        # issue comes from the URL
        read_only_fields = (*PROJECT_READONLY, "issue")


class NetworkGasSnapshotSerializer(BaseSerializer):
    class Meta:
        model = NetworkGasSnapshot
        fields = "__all__"


class AuditChecklistItemSerializer(BaseSerializer):
    class Meta:
        model = AuditChecklistItem
        fields = "__all__"


class AuditFindingSerializer(BaseSerializer):
    class Meta:
        model = AuditFinding
        fields = "__all__"
        # audit comes from the URL
        read_only_fields = (*PROJECT_READONLY, "audit")


class AuditSerializer(BaseSerializer):
    findings_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Audit
        fields = "__all__"
        # contract comes from the URL (audits are created nested under a contract)
        read_only_fields = (*PROJECT_READONLY, "contract")


class WalletAddressSerializer(BaseSerializer):
    class Meta:
        model = WalletAddress
        fields = "__all__"
        read_only_fields = ("user", "verified_at", "created_by", "updated_by", "created_at", "updated_at")


class AirdropBatchSerializer(BaseSerializer):
    class Meta:
        model = AirdropBatch
        fields = "__all__"


class TokenLaunchSerializer(BaseSerializer):
    class Meta:
        model = TokenLaunch
        fields = "__all__"
        read_only_fields = PROJECT_READONLY


class BountySerializer(BaseSerializer):
    class Meta:
        model = Bounty
        fields = "__all__"
        read_only_fields = PROJECT_READONLY
