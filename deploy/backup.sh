#!/usr/bin/env bash
#
# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
#
# Nightly backup: dump Postgres and sync object storage to an off-box bucket
# (Cloudflare R2 or GCS — both have free tiers). Run from cron or a systemd timer
# on the VM. Compresses with zstd; keeps the load inside the keep-alive window if
# you schedule it there. Restore drill lives in DEPLOY.md.
#
# Env (put in deploy/backup.env, chmod 600):
#   COMPOSE_FILE   path to the production docker-compose.yml
#   DB_SERVICE     compose service name for Postgres (default: plane-db)
#   PGUSER PGDB    Postgres user + database
#   BACKUP_DIR     local staging dir (default: /var/backups/deployflow)
#   RCLONE_REMOTE  rclone remote:bucket for the off-box copy (e.g. r2:deployflow-backups)
#   RETAIN_DAYS    local retention (default: 7)

set -euo pipefail
cd "$(dirname "$0")"
[ -f backup.env ] && set -a && . ./backup.env && set +a

COMPOSE_FILE="${COMPOSE_FILE:-../docker-compose.yml}"
DB_SERVICE="${DB_SERVICE:-plane-db}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/deployflow}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"
DUMP="$BACKUP_DIR/pg_${STAMP}.sql.zst"

echo "[backup] dumping Postgres -> $DUMP"
docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
  pg_dump -U "${PGUSER:-plane}" "${PGDB:-plane}" | zstd -19 -q -o "$DUMP"

if [ -n "${RCLONE_REMOTE:-}" ]; then
  echo "[backup] syncing dump + uploads to $RCLONE_REMOTE"
  rclone copy "$DUMP" "$RCLONE_REMOTE/db/" --quiet || echo "[backup] WARN: rclone db copy failed"
  # MinIO uploads volume (mounted at /export in the minio container image)
  docker compose -f "$COMPOSE_FILE" cp plane-minio:/export "$BACKUP_DIR/uploads_${STAMP}" 2>/dev/null || true
  [ -d "$BACKUP_DIR/uploads_${STAMP}" ] && \
    rclone copy "$BACKUP_DIR/uploads_${STAMP}" "$RCLONE_REMOTE/uploads/${STAMP}/" --quiet || true
  rm -rf "$BACKUP_DIR/uploads_${STAMP}"
fi

echo "[backup] pruning local backups older than ${RETAIN_DAYS}d"
find "$BACKUP_DIR" -name 'pg_*.sql.zst' -mtime "+${RETAIN_DAYS}" -delete
echo "[backup] done"
