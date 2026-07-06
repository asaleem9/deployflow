<!--
Copyright (c) 2026 DeployFlow contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

# DeployFlow — core-functionality test plan

Verifies the live deployment (`http://170.9.28.190`) end to end. Each test lists
how it's checked (API = curl against the API, UI = browser) and the pass bar.
Results are recorded in the **Status** column after execution.

## A. Availability & infrastructure

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| A1 | Landing responds | API | `GET /` → 200, HTML | |
| A2 | API healthy | API | `GET /api/instances/` → 200, `is_setup_done: true`, name `DeployFlow` | |
| A3 | All containers up | SSH | 11 services `Up`, migrator `Exited (0)` | |
| A4 | Keepalive armed | SSH | `keepalive.timer` active (Oracle reclaim guard) | |

## B. Marketing landing

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| B1 | Landing renders | UI | Hero "Ship contracts, not chaos.", 6 feature cards, "Try live demo" | |
| B2 | Clean console | UI | **0 console errors** (hydration fix) | |
| B3 | Logged-out nav | UI | "Sign in" + "Try live demo" shown | |
| B4 | Public to authed users | UI | Signed-in visitor to `/` sees the landing with "Open app", not a redirect | |

## C. Authentication

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| C1 | Email/password sign-up | API | New account creates + logs in | |
| C2 | Email/password sign-in | API | Existing account logs in | |
| C3 | Demo wallet SIWE (no extension) | UI | "Use a demo wallet" → signs in, creates `0x…@wallet.deployflow.xyz` | |
| C4 | Injected-wallet button renders | UI | "Sign in with Ethereum" present (real-wallet path; MetaMask connect needs a human) | |
| C5 | Wrong SIWE signature rejected | API | Bad signature → 401 | |

## D. Demo mode

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| D1 | Try live demo | UI | Landing "Try live demo" → `/acme-protocol` workspace loads | |
| D2 | Seeded data present | API | 10 networks; contracts SwapRouter/VaultManager/StakingRewards | |

## E. Workspace & project

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| E1 | Create project (clean) | UI | Create a project with the default cover → **no error toast**, project opens | |
| E2 | Cover image attaches | API | Created project has a `cover_image` set (bulk-asset fix) | |
| E3 | Project list | API | New project appears in the workspace project list | |

## F. Work items (issues)

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| F1 | Create issue | API/UI | Issue created in a project, appears in the list | |
| F2 | Update issue state | API/UI | State/priority change persists | |

## G. Web3 module

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| G1 | Networks seeded | API | `…/networks/` → 10 EVM networks | |
| G2 | Contracts list | API | Demo project contracts return with lifecycle stages | |
| G3 | Create contract | API | New contract persists (EIP-55 address) | |
| G4 | Audits / findings | API | Findings board data returns | |
| G5 | Bounties / launches | API | Bounty + launch boards return | |
| G6 | Live gas snapshot | API | Gas prices present for a covered chain (Etherscan/RPC) | |

## H. Paid-removal (must find NOTHING)

| # | Test | How | Expected | Status |
|---|------|-----|----------|--------|
| H1 | No "Community" edition badge | UI | Sidebar has no "Community" button | |
| H2 | No "PRO" pills | UI | No "PRO" upsell badges anywhere | |
| H3 | No billing settings entry | UI | Workspace settings has no "Billing & Plans" | |
| H4 | No paywall modal reachable | UI | No path opens the paid-plan upgrade modal | |
| H5 | No upgrade banners / cards | UI | No "Upgrade to …" banners or contact-sales link | |

Legend: ✅ pass · ❌ fail · ⚠️ partial/needs-human
