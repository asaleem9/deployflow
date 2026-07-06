/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { Wallet, Sparkles } from "lucide-react";
import { performSiweLogin } from "./siwe-flow";
import { getDemoAccount } from "./demo-wallet";

/** Minimal EIP-1193 provider surface for the injected-wallet path. */
type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum ?? null;
}

type Props = {
  nextPath?: string;
  /** Show the "demo wallet" option (no extension needed). */
  showDemoWallet?: boolean;
};

/**
 * Sign in with Ethereum. Two paths:
 *  - a real injected wallet (MetaMask, Rabby, Coinbase) over EIP-1193, and
 *  - an in-browser demo wallet (a viem burner keypair) so anyone can try the
 *    full flow with no extension. Both go through the same tested SIWE endpoints.
 */
export function SiweButton({ nextPath = "/", showDemoWallet = true }: Props) {
  const [busy, setBusy] = useState<"wallet" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInInjected = async () => {
    setError(null);
    const provider = getInjectedProvider();
    if (!provider) {
      setError("No Ethereum wallet detected. Try the demo wallet, or install MetaMask.");
      return;
    }
    setBusy("wallet");
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const address = accounts?.[0];
      if (!address) throw new Error("No account selected");
      const chainIdHex = (await provider.request({ method: "eth_chainId" })) as string;
      await performSiweLogin({
        address,
        chainId: parseInt(chainIdHex, 16),
        nextPath,
        sign: (message) => provider.request({ method: "personal_sign", params: [message, address] }) as Promise<string>,
      });
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const signInDemo = async () => {
    setError(null);
    setBusy("demo");
    try {
      const account = getDemoAccount();
      await performSiweLogin({
        address: account.address,
        chainId: 8453, // Base — arbitrary; the demo wallet isn't on-chain
        nextPath,
        sign: (message) => account.signMessage({ message }),
      });
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "Wallet sign-in failed";
    setError(/reject|denied|4001/i.test(msg) ? null : msg);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={signInInjected}
        disabled={busy !== null}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-strong bg-layer-1 px-4 py-2.5 text-body-md-medium text-primary transition-colors hover:bg-layer-1-hover disabled:opacity-60"
      >
        <Wallet className="size-4" />
        {busy === "wallet" ? "Check your wallet…" : "Sign in with Ethereum"}
      </button>

      {showDemoWallet ? (
        <button
          type="button"
          onClick={signInDemo}
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-accent-subtle bg-accent-subtle/30 px-4 py-2 text-body-sm-medium text-accent-primary transition-colors hover:bg-accent-subtle disabled:opacity-60"
          title="A throwaway in-browser wallet — no extension needed"
        >
          <Sparkles className="size-4" />
          {busy === "demo" ? "Signing…" : "Use a demo wallet (no extension)"}
        </button>
      ) : null}

      {error ? <span className="text-caption-sm-regular text-danger-primary">{error}</span> : null}
    </div>
  );
}
