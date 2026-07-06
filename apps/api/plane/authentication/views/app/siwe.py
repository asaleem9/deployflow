# Copyright (c) 2023-present Plane Software, Inc. and contributors
# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Sign-In With Ethereum endpoints. A JSON API (not the form-redirect flow used
by email auth) because the wallet handshake is driven by client-side JavaScript:
the browser requests a nonce, the wallet signs it, and the browser posts the
signature back."""

import os

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from plane.authentication.adapter.error import (
    AUTHENTICATION_ERROR_CODES,
    AuthenticationException,
)
from plane.authentication.provider.credentials.siwe import SIWEProvider
from plane.authentication.rate_limit import AuthenticationThrottle
from plane.authentication.utils.login import user_login
from plane.license.models import Instance
from plane.web3.siwe import issue_nonce, verify_signature


def _siwe_enabled() -> bool:
    return os.environ.get("ENABLE_SIWE", "1") == "1"


class SIWENonceEndpoint(APIView):
    """POST {address, chain_id} -> {message}. Composes the full EIP-4361 message
    server-side and stores a single-use nonce."""

    permission_classes = [AllowAny]
    throttle_classes = [AuthenticationThrottle]

    def post(self, request):
        if not _siwe_enabled():
            return Response({"error": "SIWE is disabled"}, status=status.HTTP_400_BAD_REQUEST)

        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INSTANCE_NOT_CONFIGURED"],
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            return Response(exc.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)

        address = str(request.data.get("address", "")).strip()
        chain_id = request.data.get("chain_id", 1)
        uri = request.data.get("uri") or request.build_absolute_uri("/")

        try:
            message = issue_nonce(address=address, chain_id=int(chain_id), uri=uri)
        except (ValueError, TypeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": message}, status=status.HTTP_200_OK)


class SIWEVerifyEndpoint(APIView):
    """POST {message, signature} -> establishes a session. Verifies the signature
    and single-use nonce, then logs in (or signs up) the wallet's user."""

    permission_classes = [AllowAny]
    throttle_classes = [AuthenticationThrottle]

    def post(self, request):
        if not _siwe_enabled():
            return Response({"error": "SIWE is disabled"}, status=status.HTTP_400_BAD_REQUEST)

        message = request.data.get("message", "")
        signature = request.data.get("signature", "")
        if not message or not signature:
            return Response(
                {"error": "message and signature are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # 1. verify the signature + single-use nonce -> recovered address
        try:
            address = verify_signature(message=message, signature=signature)
        except Exception as e:  # noqa: BLE001 — surface all verification failures uniformly
            return Response({"error": f"verification failed: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

        # 2. resolve/create the user and link the wallet
        try:
            provider = SIWEProvider(request=request, address=address)
            user = provider.authenticate()
        except AuthenticationException as e:
            return Response(e.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)

        # 3. establish the session
        user_login(request=request, user=user, is_app=True)
        return Response(
            {
                "success": True,
                "address": address,
                "is_email_valid": user.is_email_valid,
                "onboarded": bool(getattr(getattr(user, "profile", None), "is_onboarded", False)),
            },
            status=status.HTTP_200_OK,
        )
