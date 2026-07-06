/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { ArrowRight } from "lucide-react";
import { performSiweLogin } from "./siwe-flow";

/**
 * Real-wallet sign-in via RainbowKit: connect (injected, WalletConnect, or
 * Coinbase), then sign the SIWE message through wagmi and hand off to the shared
 * verify flow. Must render inside <Web3Provider>.
 */
export function RainbowConnect({ nextPath = "/" }: { nextPath?: string }) {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      await performSiweLogin({
        address,
        chainId: chainId ?? 1,
        nextPath,
        sign: (message) => signMessageAsync({ message }),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet sign-in failed";
      setError(/reject|denied|4001/i.test(msg) ? null : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <ConnectButton.Custom>
        {({ account, openConnectModal, openAccountModal, mounted }) => (
          <button
            type="button"
            onClick={account ? openAccountModal : openConnectModal}
            disabled={!mounted}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-strong bg-layer-1 px-4 py-2.5 text-body-md-medium text-primary transition-colors hover:bg-layer-1-hover"
          >
            {account ? account.displayName : "Connect a wallet"}
          </button>
        )}
      </ConnectButton.Custom>

      {isConnected ? (
        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-cta px-4 py-2.5 text-body-md-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.02] disabled:opacity-70"
        >
          {busy ? "Check your wallet…" : "Sign in with this wallet"}
          <ArrowRight className="size-4" />
        </button>
      ) : null}

      {error ? <span className="text-caption-sm-regular text-danger-primary">{error}</span> : null}
    </div>
  );
}
