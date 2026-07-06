# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models

from plane.db.models.base import BaseModel
from plane.db.models.project import ProjectBaseModel


class Audit(ProjectBaseModel):
    """A security review of a contract (optionally a specific build). Reports ride
    Plane's existing FileAsset/S3 machinery."""

    class AuditType(models.TextChoices):
        INTERNAL = "internal", "Internal"
        EXTERNAL = "external", "External"
        CONTEST = "contest", "Contest"

    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        IN_PROGRESS = "in_progress", "In progress"
        REPORT_DELIVERED = "report_delivered", "Report delivered"
        REMEDIATION = "remediation", "Remediation"
        VERIFIED = "verified", "Verified"
        SIGNED_OFF = "signed_off", "Signed off"

    contract = models.ForeignKey(
        "web3.SmartContract", on_delete=models.CASCADE, related_name="audits"
    )
    deployment = models.ForeignKey(
        "web3.ContractDeployment", on_delete=models.SET_NULL, null=True, blank=True, related_name="audits"
    )
    auditor_name = models.CharField(max_length=255, blank=True, default="")
    auditor_firm = models.CharField(max_length=255, blank=True, default="")
    audit_type = models.CharField(max_length=20, choices=AuditType.choices, default=AuditType.EXTERNAL)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PLANNED)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    report_asset = models.ForeignKey(
        "db.FileAsset", on_delete=models.SET_NULL, null=True, blank=True, related_name="web3_audit_reports"
    )
    commit_hash = models.CharField(max_length=64, blank=True, default="")
    scope_description = models.TextField(blank=True, default="")
    summary_html = models.TextField(blank=True, default="<p></p>")

    class Meta:
        verbose_name = "Audit"
        verbose_name_plural = "Audits"
        db_table = "web3_audits"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Audit of {self.contract.name} ({self.get_status_display()})"


class AuditChecklistItem(BaseModel):
    """A single review checklist entry, seeded per audit from a template."""

    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name="checklist_items")
    category = models.CharField(max_length=64, blank=True, default="")
    title = models.CharField(max_length=500)
    is_checked = models.BooleanField(default=False)
    checked_by = models.ForeignKey(
        "db.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="web3_checked_items"
    )
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Audit Checklist Item"
        verbose_name_plural = "Audit Checklist Items"
        db_table = "web3_audit_checklist_items"
        ordering = ("sort_order",)


class AuditFinding(ProjectBaseModel):
    """A finding with a severity. Remediation is tracked as a real Plane work item
    via remediation_issue — one click creates the issue, carrying severity across
    to priority."""

    class Severity(models.TextChoices):
        CRITICAL = "critical", "Critical"
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"
        INFORMATIONAL = "informational", "Informational"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"
        REMEDIATED = "remediated", "Remediated"
        WONT_FIX = "wont_fix", "Won't fix"
        VERIFIED_FIXED = "verified_fixed", "Verified fixed"

    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name="findings")
    code = models.CharField(max_length=16, blank=True, default="")
    title = models.CharField(max_length=500)
    description_html = models.TextField(blank=True, default="<p></p>")
    severity = models.CharField(max_length=16, choices=Severity.choices, default=Severity.MEDIUM)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    remediation_issue = models.ForeignKey(
        "db.Issue", on_delete=models.SET_NULL, null=True, blank=True, related_name="web3_remediation_findings"
    )
    fixed_in_deployment = models.ForeignKey(
        "web3.ContractDeployment", on_delete=models.SET_NULL, null=True, blank=True, related_name="fixed_findings"
    )
    resolution_notes = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Audit Finding"
        verbose_name_plural = "Audit Findings"
        db_table = "web3_audit_findings"
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["audit", "severity", "status"]),
        ]

    def __str__(self):
        return f"{self.code or '?'} {self.title} ({self.severity})"
