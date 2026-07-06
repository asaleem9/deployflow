# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""Email backend that drops non-deliverable synthetic recipients before sending.

SIWE wallet-only accounts get a synthetic address (`<addr>@wallet.deployflow.xyz`)
so they satisfy the email-required signup path. Those addresses never resolve, so
this backend strips them from every outgoing message and skips a message that has
no real recipients left. Because the bgtasks build their SMTP connection via
`get_connection()` without naming a backend, they use `settings.EMAIL_BACKEND` —
so pointing that at this class guards every send from one place."""

from django.core.mail.backends.smtp import EmailBackend as SMTPBackend

# Kept in sync with WALLET_EMAIL_DOMAIN in the SIWE provider.
SYNTHETIC_EMAIL_SUFFIXES = ("@wallet.deployflow.xyz",)


def is_synthetic_email(address: str) -> bool:
    a = (address or "").lower()
    return any(a.endswith(suffix) for suffix in SYNTHETIC_EMAIL_SUFFIXES)


def _strip(addresses):
    return [a for a in (addresses or []) if not is_synthetic_email(a)]


class FilteredSMTPEmailBackend(SMTPBackend):
    def send_messages(self, email_messages):
        deliverable = []
        for msg in email_messages:
            msg.to = _strip(msg.to)
            msg.cc = _strip(msg.cc)
            msg.bcc = _strip(msg.bcc)
            if msg.to or msg.cc or msg.bcc:
                deliverable.append(msg)
        if not deliverable:
            return 0
        return super().send_messages(deliverable)
