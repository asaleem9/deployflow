/**
 * Copyright (c) 2026 DeployFlow contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { mainnet, base, arbitrum, optimism, polygon, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// WalletConnect needs a project id for the mobile/QR path. Injected and Coinbase
// still work without one; set VITE_WALLETCONNECT_PROJECT_ID to enable WC.
const projectId =
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.VITE_WALLETCONNECT_PROJECT_ID) ||
  "deployflow";

const config = getDefaultConfig({
  appName: "DeployFlow",
  projectId,
  chains: [mainnet, base, arbitrum, optimism, polygon, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

/**
 * Scoped wallet-stack provider. Mount it only around the surfaces that need
 * wallet connectors (the auth screen, wallet settings) so the rest of the app —
 * which uses SWR, not react-query — is untouched. Themed to the brand accent.
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#7C5CFF", borderRadius: "medium" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
