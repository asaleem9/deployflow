# Copyright (c) 2023-present Plane Software, Inc. and contributors
# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Anonymous demo sign-in. A single shared, already-onboarded demo user lets
visitors explore a populated workspace without creating an account. Changes
persist (intentionally — it's a sandbox everyone shares). Gated by ENABLE_DEMO."""

import os

from django.core.management import call_command

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from plane.authentication.rate_limit import AuthenticationThrottle
from plane.authentication.utils.login import user_login
from plane.db.models import User, WorkspaceMember


def _demo_enabled() -> bool:
    return os.environ.get("ENABLE_DEMO", "1") == "1"


class DemoLoginEndpoint(APIView):
    """POST -> logs the visitor into the shared demo user and returns the demo
    workspace slug to redirect into. Seeds the demo lazily on first use."""

    permission_classes = [AllowAny]
    throttle_classes = [AuthenticationThrottle]

    def post(self, request):
        if not _demo_enabled():
            return Response({"error": "demo is disabled"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=_demo_user_email()).first()
        if user is None:
            # first visitor — seed the demo workspace + mock data, then retry
            call_command("seed_demo")
            user = User.objects.filter(email=_demo_user_email()).first()
            if user is None:
                return Response({"error": "demo unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        user_login(request=request, user=user, is_app=True)

        membership = (
            WorkspaceMember.objects.filter(member=user, is_active=True)
            .select_related("workspace")
            .first()
        )
        workspace_slug = membership.workspace.slug if membership else None
        return Response(
            {"success": True, "workspace_slug": workspace_slug, "demo": True},
            status=status.HTTP_200_OK,
        )


def _demo_user_email() -> str:
    return os.environ.get("DEMO_EMAIL", "demo@deployflow.app")
