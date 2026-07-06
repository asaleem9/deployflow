# Copyright (c) 2023-present Plane Software, Inc. and contributors
# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Sign-In With Ethereum credential provider. The signature is verified in the
view via plane.web3.siwe; this adapter turns a verified wallet address into a
login or a synthetic-email signup, reusing the shared complete_login_or_signup
flow (Profile creation, deactivation checks, session stamping)."""

from django.utils import timezone

from plane.authentication.adapter.credential import CredentialAdapter
from plane.web3.models import WalletAddress
from plane.web3.utils.address import normalize_address

# Synthetic email domain for wallet-only accounts. These addresses are never
# deliverable, so email-sending tasks must skip them (guarded in email tasks).
WALLET_EMAIL_DOMAIN = "wallet.deployflow.xyz"


def short_address(address: str) -> str:
    return f"{address[:6]}…{address[-4:]}" if address and len(address) > 12 else address


class SIWEProvider(CredentialAdapter):
    provider = "siwe"

    def __init__(self, request, address, callback=None):
        super().__init__(request=request, provider=self.provider, callback=callback)
        self.address = address
        # remembers whether this authentication created a new account
        self.is_new_signup = False

    def set_user_data(self):
        addr_lower = normalize_address(self.address)
        existing = WalletAddress.objects.filter(address__iexact=self.address).select_related("user").first()

        if existing:
            # Returning wallet -> resolve to the linked user's email.
            email = existing.user.email
        else:
            # New wallet -> synthetic, non-deliverable email.
            email = f"{addr_lower}@{WALLET_EMAIL_DOMAIN}"
            self.is_new_signup = True

        super().set_user_data(
            {
                "email": email,
                "user": {
                    "avatar": "",
                    "first_name": short_address(self.address),
                    "last_name": "",
                    "provider_id": self.address,
                    "is_password_autoset": True,
                },
            }
        )

    def authenticate(self):
        self.set_user_data()
        user = self.complete_login_or_signup()
        self._link_wallet(user)
        return user

    def _link_wallet(self, user):
        """Ensure a WalletAddress row links this wallet to the user, and stamp
        login time. New wallet-only users get is_email_valid=False so onboarding
        can nudge them to attach a real email."""
        wallet, created = WalletAddress.objects.get_or_create(
            address=self.address,
            defaults={
                "user": user,
                "verified_at": timezone.now(),
                "is_primary": not user.wallets.exists(),
            },
        )
        if not created:
            wallet.last_login_at = timezone.now()
            wallet.save(update_fields=["last_login_at", "updated_at"])
        else:
            wallet.last_login_at = timezone.now()
            wallet.save(update_fields=["last_login_at", "updated_at"])

        # Mark wallet-only accounts as needing a real email + set a friendly name.
        updates = []
        if self.is_new_signup:
            if user.is_email_valid:
                user.is_email_valid = False
                updates.append("is_email_valid")
            display = short_address(self.address)
            if user.display_name != display:
                user.display_name = display
                updates.append("display_name")
        if user.last_login_medium != "siwe":
            user.last_login_medium = "siwe"
            updates.append("last_login_medium")
        if updates:
            user.save(update_fields=updates)
