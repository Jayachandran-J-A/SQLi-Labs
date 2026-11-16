#!/usr/bin/env bash
# Wipe every database and rebuild the lab from scratch (use after you break something with stacked queries).
set -e
cd "$(dirname "$0")"
docker compose down -v
docker compose up -d --build
echo "Lab restarting - give MSSQL ~40s to initialise. Open http://<host-ip>:9000"
