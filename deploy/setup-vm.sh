#!/usr/bin/env bash
#
# Copyright (c) 2026 DeployFlow contributors
# SPDX-License-Identifier: AGPL-3.0-only
#
# One-time bootstrap for a fresh Ubuntu/Debian ARM64 or x86 VM (Oracle Always
# Free, Hetzner, or GCE). Installs Docker, adds swap, installs the keep-alive
# timer, and prepares the app directory. Run as root (or with sudo). Idempotent.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/deployflow}"
SWAP_GB="${SWAP_GB:-2}"

echo "== 1. base packages =="
apt-get update -y
apt-get install -y ca-certificates curl git zstd stress-ng rclone

echo "== 2. Docker (official convenience script) =="
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "== 3. swap (${SWAP_GB}G) — headroom on a 4GB box =="
if [ ! -f /swapfile ]; then
  fallocate -l "${SWAP_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== 3.5 open 80/443 in the local firewall (Oracle Ubuntu images block them) =="
# Oracle's stock Ubuntu image has an iptables INPUT chain that REJECTs everything
# past SSH, so the OCI security list alone isn't enough — punch 80/443 through the
# instance's own netfilter rules, ahead of the REJECT, and persist them.
if command -v iptables >/dev/null; then
  for PORT in 80 443; do
    if ! iptables -C INPUT -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT 2>/dev/null; then
      # insert just before the trailing REJECT rule if there is one, else append
      REJECT_LINE="$(iptables -L INPUT --line-numbers -n 2>/dev/null | awk '/REJECT/{print $1; exit}')"
      if [ -n "$REJECT_LINE" ]; then
        iptables -I INPUT "$REJECT_LINE" -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT
      else
        iptables -A INPUT -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT
      fi
    fi
  done
  # persist across reboots (Oracle images ship netfilter-persistent)
  if command -v netfilter-persistent >/dev/null; then
    netfilter-persistent save
  else
    DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
    netfilter-persistent save 2>/dev/null || true
  fi
fi

echo "== 4. app directory =="
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  echo "   clone your fork into $APP_DIR, e.g.:"
  echo "     git clone https://github.com/asaleem9/deployflow $APP_DIR"
fi

echo "== 5. keep-alive timer (Oracle idle-reclaim guard) =="
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/keepalive.service" ]; then
  cp "$SCRIPT_DIR/keepalive.service" "$SCRIPT_DIR/keepalive.timer" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now keepalive.timer
  echo "   keepalive.timer enabled; check with: systemctl list-timers keepalive.timer"
fi

echo "== done. Next: create $APP_DIR/apps/api/.env and root .env from the examples,"
echo "   set production secrets, then: docker compose -f docker-compose.yml up -d =="
