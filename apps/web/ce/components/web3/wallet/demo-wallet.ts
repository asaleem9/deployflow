/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { PrivateKeyAccount } from "viem";

const DEMO_KEY = "deployflow:demo-wallet-pk";

/**
 * An in-browser burner wallet for trying the wallet flows without a real
 * extension. It's a genuine viem keypair — it signs real EIP-191 messages that
 * the backend verifies normally — so it's a convenience, not a security bypass.
 * The key is kept in sessionStorage so the same demo wallet persists across a
 * session (and evaporates when the tab closes).
 */
export function getDemoAccount(): PrivateKeyAccount {
  let pk = typeof window !== "undefined" ? window.sessionStorage.getItem(DEMO_KEY) : null;
  if (!pk) {
    pk = generatePrivateKey();
    try {
      window.sessionStorage.setItem(DEMO_KEY, pk);
    } catch {
      // sessionStorage unavailable — fall back to an ephemeral key
    }
  }
  return privateKeyToAccount(pk as `0x${string}`);
}

/** Discard the current demo wallet so the next call mints a fresh one. */
export function resetDemoAccount(): void {
  try {
    window.sessionStorage.removeItem(DEMO_KEY);
  } catch {
    // ignore
  }
}
