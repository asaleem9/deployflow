<!--
Copyright (c) 2026 DeployFlow contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

# Deploying DeployFlow

DeployFlow runs as one self-contained Docker stack (Postgres, Valkey, RabbitMQ,
MinIO, and the app services), so a single small VM hosts everything. This keeps
cost at or near zero for low-traffic instances. Prices below are approximate as
of July 2026.

## Host options (cheapest first)

| Option | Cost | Notes |
|---|---|---|
| **Oracle Cloud Always Free** (ARM Ampere, 2 OCPU / 12 GB) | **$0/mo** | Best value. 3× Plane's minimum RAM. Watch idle-reclaim (below). |
| **Hetzner CX22** (2 vCPU / 4 GB) | ~$4.60/mo | Rock-solid fallback; no reclaim games. Add 2 GB swap. |
| **GCE e2-medium** (Spot) | ~$12–13/mo | $0 for 90 days on the $300 credit, then most expensive. |

Not viable: Vercel (can't run the backend; Hobby forbids commercial use),
Supabase (managed DB, not a host), GCP always-free e2-micro / Cloud Run (can't
run an always-on 4 GB multi-service stack).

## First-time setup

1. **Create the public repo** (required for AGPL §13 — the source must be
   offered to users). From the repo root:
   ```
   gh repo create deployflow --public --source . --remote origin --push
   ```
2. **Provision the VM** (Oracle: upgrade the account to Pay-As-You-Go — still
   free within limits — to be exempt from idle reclaim and get capacity priority).
3. **Bootstrap it** — copy `deploy/` to the VM and run:
   ```
   sudo APP_DIR=/opt/deployflow deploy/setup-vm.sh
   ```
   This installs Docker, adds swap, and enables the keep-alive timer.
4. **Clone + configure**:
   ```
   git clone https://github.com/<you>/deployflow /opt/deployflow
   cd /opt/deployflow
   cp .env.example .env && cp apps/api/.env.example apps/api/.env
   # set production secrets: SECRET_KEY, DB/RabbitMQ/MinIO creds, WEB_URL,
   # CORS_ALLOWED_ORIGINS/CSRF_TRUSTED_ORIGINS, COOKIE_DOMAIN, ETHERSCAN_API_KEY,
   # WEB3_RPC_URL_<chain_id> (your Alchemy/Infura endpoints), SIWE_DOMAIN, ENABLE_SIWE
   ```
5. **Start**:
   ```
   docker compose -f docker-compose.yml up -d
   ```
   The one-shot `migrator` service runs migrations before the API and workers
   start. Create the first instance admin at `/god-mode`.
6. **TLS/CDN**: put Cloudflare (free tier) in front — proxied DNS + origin cert
   on the nginx `proxy` service. One registrable domain for app and API.

## Oracle idle-reclaim guard

Oracle reclaims Always-Free VMs whose 95th-percentile CPU is under 20% over a
7-day window. Two defenses, use both:

- **Primary**: upgrade to Pay-As-You-Go (card on file, $0 within free limits) —
  PAYG accounts are exempt from reclaim.
- **Belt-and-suspenders**: `deploy/keepalive.{service,timer}` run a low-priority
  (`nice 19`) CPU load twice daily (~17.5 h/week above 20%, double the threshold).
  After the first week, confirm the OCI console CPU chart shows 95th-percentile
  ≥ 20%.

## CI/CD

`.github/workflows/deploy.yml` builds multi-arch images (ARM64 for Oracle + x86),
pushes them to GHCR, and deploys over SSH — **triggered only by version tags**, so
the deployed version always matches published source (AGPL §13). Set these repo
secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`. Ship a release:
```
git tag v2026.07.01 && git push origin v2026.07.01
```

## Backups

`deploy/backup.sh` dumps Postgres (`pg_dump | zstd`) and syncs the dump plus
MinIO uploads to an off-box bucket (Cloudflare R2 or GCS free tier) via `rclone`.
Configure `deploy/backup.env` and run nightly from cron:
```
0 7 * * * /opt/deployflow/deploy/backup.sh >> /var/log/deployflow-backup.log 2>&1
```

**Restore drill** (do this once): on a scratch VM, `docker compose up -d plane-db`,
then `zstd -d < pg_<stamp>.sql.zst | docker compose exec -T plane-db psql -U plane plane`,
restore the uploads into the MinIO volume, bring up the rest, and confirm login +
data. Object storage can move to Cloudflare R2 (S3-compatible, zero egress) later.

## Monitoring

UptimeRobot (free) on `/auth/get-csrf-token/`. Plane ships OpenTelemetry — point
OTLP at a free Grafana Cloud or GCP Ops endpoint if you want metrics.

## AGPL compliance checklist

- `LICENSE.txt` (AGPL-3.0) and `NOTICE` (fork attribution + trademark disclaimer)
  retained; upstream SPDX headers kept, new files carry DeployFlow copyright.
- Public repo published; deploy only from tags pushed to it.
- "Source code" link surfaced in the app footer/about pointing at the repo.
- `scripts/brand-lint.sh` and `scripts/compliance-check.sh` run in CI.
