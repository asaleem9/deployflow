/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";

/** The shared demo account (matches the backend seed / DEMO_EMAIL default). */
export const DEMO_USER_EMAIL = "demo@deployflow.app";

/** True when the signed-in user is the shared demo account. */
export function isDemoUser(user?: { email?: string | null } | null): boolean {
  return !!user?.email && user.email.toLowerCase() === DEMO_USER_EMAIL;
}

/**
 * Leave the demo cleanly: drop the shared session and land wherever we choose —
 * the marketing home ("/") to exit, or "/sign-in" to create a real account.
 * Uses a controlled fetch (not the default form-submit sign-out) so we decide
 * the destination instead of the backend's redirect.
 */
export async function exitDemoTo(destination: string): Promise<void> {
  try {
    const csrf = (await (await fetch(`${API_BASE_URL}/auth/get-csrf-token/`, { credentials: "include" })).json())
      ?.csrf_token;
    await fetch(`${API_BASE_URL}/auth/sign-out/`, {
      method: "POST",
      credentials: "include",
      redirect: "manual",
      headers: { "X-CSRFToken": csrf ?? "", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfmiddlewaretoken: csrf ?? "" }),
    });
  } catch {
    // even if sign-out hiccups, still navigate away
  }
  window.location.href = destination;
}
