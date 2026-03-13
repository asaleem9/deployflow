# Django imports
from django.db import models

# Module imports
from .base import BaseModel


class ProjectTemplate(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="")
    states_config = models.JSONField(default=list, blank=True)
    labels_config = models.JSONField(default=list, blank=True)
    issue_types_config = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Project Template"
        verbose_name_plural = "Project Templates"
        db_table = "project_templates"
        ordering = ("sort_order",)

    def __str__(self):
        return self.name
