/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";

type SiweOptions = {
  address: string;
  chainId: number;
  /** Sign the EIP-4361 message and return the 0x signature. */
  sign: (message: string) => Promise<string>;
  /** Where to go after a successful sign-in. */
  nextPath?: string;
};

/**
 * The Sign-In With Ethereum handshake, parameterized by a signer so both a real
 * injected wallet and the in-browser demo wallet share one path: ask the server
 * for a nonce + full message, sign it, post the signature, and navigate on
 * success. Anonymous, so no CSRF token is needed for these auth endpoints.
 */
export async function performSiweLogin({ address, chainId, sign, nextPath = "/" }: SiweOptions): Promise<void> {
  const nonceRes = await fetch(`${API_BASE_URL}/auth/siwe/nonce/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, chain_id: chainId, uri: window.location.origin }),
  });
  if (!nonceRes.ok) throw new Error("Could not start wallet sign-in");
  const { message } = await nonceRes.json();

  const signature = await sign(message);

  const verifyRes = await fetch(`${API_BASE_URL}/auth/siwe/verify/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (!verifyRes.ok) {
    const body = await verifyRes.json().catch(() => ({}));
    throw new Error(body?.error || "Wallet verification failed");
  }
  window.location.href = nextPath;
}
