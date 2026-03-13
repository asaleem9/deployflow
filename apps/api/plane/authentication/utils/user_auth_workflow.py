# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from plane.license.models import Instance, InstanceAdmin
from .workspace_project_join import process_workspace_project_invitations


def post_user_auth_workflow(user, is_signup, request):
    process_workspace_project_invitations(user=user)
    # Auto-promote the first user to instance admin
    if is_signup:
        instance = Instance.objects.first()
        if instance and not InstanceAdmin.objects.filter(instance=instance).exists():
            InstanceAdmin.objects.create(
                user=user,
                instance=instance,
                role=20,
            )
