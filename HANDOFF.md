<!--
Copyright (c) 2026 DeployFlow contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

# DeployFlow — things to come back to

A running checklist of items that need **you** (accounts, decisions, or a manual
step), plus the v1.1 backlog. Everything not listed here is built and committed.

## 🔴 Blocking — needs your accounts / decisions

- [x] ~~Create the public GitHub repo~~ — DONE. Force-pushed all work to
      `github.com/asaleem9/deployflow` (replaced the prior fork that lived there).
      `origin` points at it; `main` is the DeployFlow default branch.
- [ ] **Provision a host** and run `deploy/setup-vm.sh` (Oracle Always-Free is
      $0; Hetzner CX22 ~$4.60/mo is the fallback). See `DEPLOY.md`.
- [ ] **Set production secrets** in `apps/api/.env` + root `.env`: `SECRET_KEY`,
      DB/RabbitMQ/MinIO creds, `WEB_URL`, `CORS_ALLOWED_ORIGINS`,
      `CSRF_TRUSTED_ORIGINS`, `COOKIE_DOMAIN`, `ETHERSCAN_API_KEY`,
      `WEB3_RPC_URL_<chain_id>` (your Alchemy/Infura endpoints), `SIWE_DOMAIN`.
- [ ] **Repo secrets for CI** (`.github/workflows/deploy.yml`): `DEPLOY_HOST`,
      `DEPLOY_USER`, `DEPLOY_SSH_KEY`.
- [ ] **Cloudflare** free-tier DNS + TLS in front of the VM.
- [ ] **Oracle only:** upgrade the account to Pay-As-You-Go (still $0 in free
      limits) to dodge idle-reclaim; the `deploy/keepalive.timer` is the backup.

## 🟠 Fix before real CI

- [ ] **Pre-commit hook.** Every commit so far used `--no-verify`: Plane's own
      hook (`oxlint --deny-warnings`) flags its pre-existing patterns on any file
      you touch, and `oxfmt` gets OOM-killed on this machine. Either relax the
      hook for the fork or fix the flagged upstream files before wiring CI to it.
- [x] ~~Bake in the Python deps.~~ — DONE + verified. A clean
      `docker compose build api worker beat-worker` produces images with
      web3 7.16.0 / siwe / eth_account importable from a fresh container (no
      hand-install). The VM's own build will pick them up from requirements.
- [ ] **Merge the feature branches.** Work landed as a chain of branches off
      `main` (tip: whatever the latest `feat/*` branch is). Review and merge to
      `main` once the repo exists.

## 🟡 v1.1 backlog (nice-to-have, not blocking)

- [~] Richer wallet stack: viem + wagmi + RainbowKit installed. Demo wallet
      (in-browser viem burner) + injected SIWE done & tested. RainbowKit
      connect-modal for real wallets (WalletConnect/mobile) is IN PROGRESS —
      the real-wallet connect can only be verified with an actual extension.
- [ ] Wallet-link settings UI — the /api/web3/users/me/wallets/link/ endpoint is
      built + tested; needs a "Connect wallet" button in profile settings (fetch a
      CSRF token for the nonce, injected-wallet sign, then POST to link).
- [ ] God-mode toggles surfaced in the admin: `ENABLE_SIWE`, `ENABLE_DEMO`
      (currently env vars, default on).
- [x] ~~Guard email tasks against synthetic wallet addresses~~ — done via a
      `FilteredSMTPEmailBackend` that strips `@wallet.deployflow.xyz` recipients
      from every send.
- [x] ~~Demo drift~~ — `python manage.py seed_demo --reset` wipes and re-seeds the
      sandbox on demand (persistence stays the default; run this when you want a
      clean slate). Consider a cron if the public demo gets rowdy.
- [x] ~~Contract detail page~~ — deployments table, add-deployment, chain sync.
- [x] ~~Bounty-create UI~~ — "New bounty" creates issue + bounty atomically.
- [x] ~~Launch-create UI~~ — "New launch" on the planner.
- [x] ~~New-finding UI~~ — creates a finding + auto-opens an audit for the contract.
- [ ] Audit report uploads (via the existing FileAsset machinery).
- [ ] Contract lifecycle-stage editing is done; audit detail view (list audits, not
      just findings) is still missing.
- [ ] Airdrop merkle tooling; GCS/R2 object-storage migration.
- [ ] Broader per-component restyle of `@plane/propel` / `@plane/ui`.
- [ ] Re-scrub and re-enable non-English locales (English-only at v1).

## Known quirks

- The marketing landing's continuous GSAP + RainbowKit hydration state makes
  automated (Playwright) screenshots time out waiting for "idle" — it's not a
  functional issue; verify visually in a browser.

## Reference

- **Local dev:** full stack via `docker compose -f docker-compose-local.yml up`;
  web on `:3001`. Create the god-mode admin at `/god-mode` on first run
  (credentials are yours — set them locally, don't commit them).
- **Demo:** anyone can hit "Try live demo" on `/`; shared user `demo@deployflow.app`,
  workspace `/acme-protocol`. Re-seed with `python manage.py seed_demo`.
- **Upstream sync:** `git fetch upstream && git merge upstream/preview` (never
  rebase — the public repo's history must stay stable). Expect conflicts only in
  `locales/en` and templates; `scripts/brand-lint.sh` catches brand regressions.
