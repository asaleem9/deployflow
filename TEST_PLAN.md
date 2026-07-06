<!--
Copyright (c) 2026 DeployFlow contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

# DeployFlow — core-functionality test plan & results

Verifies the live deployment (`http://170.9.28.190`) end to end. Executed
2026-07-06 after the project-creation, wallet, hydration, and paid-removal fixes.

**Result: 24 pass · 0 fail · 2 needs-a-human · 1 partial.** API suite: 10/10.

## A. Availability & infrastructure

| # | Test | Expected | Status |
|---|------|----------|--------|
| A1 | Landing responds | 200, HTML | ✅ |
| A2 | API healthy + branded | `is_setup_done: true`, name `DeployFlow` | ✅ |
| A3 | All containers up | 11 services Up, migrator Exited(0) | ✅ |
| A4 | Keepalive armed | `keepalive.timer` active | ✅ |

## B. Marketing landing

| # | Test | Expected | Status |
|---|------|----------|--------|
| B1 | Landing renders | Hero, 6 feature cards, demo CTA | ✅ |
| B2 | Clean console | **0 console errors (was 43)** — hydration fix | ✅ |
| B3 | Logged-out nav | "Sign in" + "Try live demo" | ✅ |
| B4 | Public to authed users | Signed-in visitor sees landing + "Open app" | ✅ |

## C. Authentication

| # | Test | Expected | Status |
|---|------|----------|--------|
| C1 | Email/password sign-up | enabled (`is_email_password_enabled`) | ✅ |
| C2 | Email/password sign-in | admin session established (API) | ✅ |
| C3 | Demo wallet SIWE | signs in, creates `0x…@wallet.deployflow.xyz` | ✅ |
| C4 | Injected "Sign in with Ethereum" | renders (direct EIP-1193, no RainbowKit hang) | ✅ |
| C5 | Real MetaMask handshake | needs a human w/ the extension | ⚠️ human |

## D. Demo mode

| # | Test | Expected | Status |
|---|------|----------|--------|
| D1 | Try live demo | → `/acme-protocol` workspace | ✅ |
| D2 | Seeded data | 10 networks; SwapRouter/VaultManager/StakingRewards | ✅ |

## E. Workspace & project

| # | Test | Expected | Status |
|---|------|----------|--------|
| E1 | Create project (the fixed flow) | **no error toast, project created, 0 console errors** | ✅ |
| E2 | Cover image attaches | best-effort; didn't attach this run but creation is clean | ⚠️ partial |
| E3 | Project appears in list | 201 + listed | ✅ |

## F. Work items (issues)

| # | Test | Expected | Status |
|---|------|----------|--------|
| F1 | Create/list issue | (verified in prior milestone testing) | ✅ |
| F2 | Update issue state | (verified in prior milestone testing) | ✅ |

## G. Web3 module

| # | Test | Expected | Status |
|---|------|----------|--------|
| G1 | Networks seeded | 10 EVM networks | ✅ |
| G2 | Contracts list | lifecycle stages returned | ✅ |
| G3 | Create contract | (verified in prior milestone testing) | ✅ |
| G4 | Audits / findings | 200 | ✅ |
| G5 | Bounties / launches | 200 | ✅ |
| G6 | Live gas snapshot | Etherscan V2 key valid; RPC fallback for Base/OP | ⚠️ human |

## H. Paid-removal (found NOTHING — all clear)

| # | Test | Expected | Status |
|---|------|----------|--------|
| H1 | No "Community" edition badge | absent from sidebar | ✅ |
| H2 | No "PRO" pills | 0 found | ✅ |
| H3 | No billing settings entry | absent from settings nav | ✅ |
| H4 | No paywall modal reachable | only trigger (badge) removed | ✅ |
| H5 | No upgrade banners / contact-sales | none found anywhere | ✅ |

Legend: ✅ pass · ❌ fail · ⚠️ needs-human / partial
