#!/bin/bash
#
# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
#
# Restore the shared public demo workspace to a clean, curated showcase.
# The demo is a writable sandbox, so visitors accumulate their own projects and
# edits; this wipes those and re-seeds Acme Vault + the Web3 mock data.
#
# Installed as a root cron entry on the VM (every 6 hours):
#   0 */6 * * * /opt/deployflow/deploy/demo-reset.sh
set -euo pipefail

cd /opt/deployflow
docker compose -f docker-compose.yml exec -T api python manage.py seed_demo --reset >> /var/log/deployflow-demo-reset.log 2>&1
echo "$(date -u +%FT%TZ) demo reset run" >> /var/log/deployflow-demo-reset.log
