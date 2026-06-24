#!/bin/bash
# Migrate production data from SQLite to PostgreSQL.
#
# Usage:
#   ./migrate-sqlite-to-pg.sh [--dashboard-sqlite <path>] [--site-sqlite <path>]
#
# Environment variables (override defaults):
#   PG_HOST, PG_PORT, PG_USER, PG_PASSWORD
#
# Example (run on the server after starting postgres):
#   PG_PASSWORD=secret ./migrate-sqlite-to-pg.sh \
#     --dashboard-sqlite /root/marzban-dashboard/data/db.sqlite \
#     --site-sqlite /root/vpn-site/backend/data/db.sqlite

set -e

PG_HOST="${PG_HOST:-127.0.0.1}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-postgres}"
PG_DB_DASHBOARD="${PG_DB_DASHBOARD:-marzx_dashboard}"
PG_DB_SITE="${PG_DB_SITE:-marzx_site}"

SQLITE_DASHBOARD=""
SQLITE_SITE=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --dashboard-sqlite) SQLITE_DASHBOARD="$2"; shift ;;
    --site-sqlite)      SQLITE_SITE="$2"; shift ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

if [ -z "$SQLITE_DASHBOARD" ] && [ -z "$SQLITE_SITE" ]; then
  echo "Usage: $0 [--dashboard-sqlite <path>] [--site-sqlite <path>]"
  exit 1
fi

if ! command -v sqlite3 &>/dev/null; then
  echo "[X] sqlite3 not found. Install: apt install sqlite3"
  exit 1
fi

if ! command -v psql &>/dev/null; then
  echo "[X] psql not found. Install: apt install postgresql-client"
  exit 1
fi

export PGPASSWORD="$PG_PASSWORD"

run_psql() {
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$1" -c "$2"
}

copy_csv() {
  local db="$1" table="$2" file="$3"
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$db" \
    -c "\COPY \"$table\" FROM '$file' CSV NULL ''"
}

export_table() {
  local sqlite_file="$1" table="$2" out="$3"
  sqlite3 -csv "$sqlite_file" "SELECT * FROM \"$table\";" > "$out"
  local rows
  rows=$(wc -l < "$out")
  echo "  Exported $rows rows from $table"
}

# ── Dashboard ────────────────────────────────────────────────────────────────
if [ -n "$SQLITE_DASHBOARD" ]; then
  if [ ! -f "$SQLITE_DASHBOARD" ]; then
    echo "[X] Dashboard SQLite file not found: $SQLITE_DASHBOARD"
    exit 1
  fi

  echo ""
  echo "[DASHBOARD] Migrating $SQLITE_DASHBOARD → $PG_DB_DASHBOARD"
  TMP=$(mktemp -d)

  export_table "$SQLITE_DASHBOARD" "User"          "$TMP/users.csv"
  export_table "$SQLITE_DASHBOARD" "MarzbanConfig" "$TMP/marzban_configs.csv"

  # Disable FK checks temporarily
  run_psql "$PG_DB_DASHBOARD" "SET session_replication_role = replica;"

  copy_csv "$PG_DB_DASHBOARD" "User"          "$TMP/users.csv"
  copy_csv "$PG_DB_DASHBOARD" "MarzbanConfig" "$TMP/marzban_configs.csv"

  run_psql "$PG_DB_DASHBOARD" "SET session_replication_role = DEFAULT;"

  rm -rf "$TMP"
  echo "[OK] Dashboard data migrated."
fi

# ── Site ─────────────────────────────────────────────────────────────────────
if [ -n "$SQLITE_SITE" ]; then
  if [ ! -f "$SQLITE_SITE" ]; then
    echo "[X] Site SQLite file not found: $SQLITE_SITE"
    exit 1
  fi

  echo ""
  echo "[SITE] Migrating $SQLITE_SITE → $PG_DB_SITE"
  TMP=$(mktemp -d)

  export_table "$SQLITE_SITE" "User"         "$TMP/users.csv"
  export_table "$SQLITE_SITE" "MarzbanUser"  "$TMP/marzban_users.csv"
  export_table "$SQLITE_SITE" "Subscription" "$TMP/subscriptions.csv"
  export_table "$SQLITE_SITE" "Payment"      "$TMP/payments.csv"
  export_table "$SQLITE_SITE" "RefreshToken" "$TMP/refresh_tokens.csv"
  export_table "$SQLITE_SITE" "EmailToken"   "$TMP/email_tokens.csv"

  run_psql "$PG_DB_SITE" "SET session_replication_role = replica;"

  copy_csv "$PG_DB_SITE" "User"         "$TMP/users.csv"
  copy_csv "$PG_DB_SITE" "MarzbanUser"  "$TMP/marzban_users.csv"
  copy_csv "$PG_DB_SITE" "Subscription" "$TMP/subscriptions.csv"
  copy_csv "$PG_DB_SITE" "Payment"      "$TMP/payments.csv"
  copy_csv "$PG_DB_SITE" "RefreshToken" "$TMP/refresh_tokens.csv"
  copy_csv "$PG_DB_SITE" "EmailToken"   "$TMP/email_tokens.csv"

  run_psql "$PG_DB_SITE" "SET session_replication_role = DEFAULT;"

  rm -rf "$TMP"
  echo "[OK] Site data migrated."
fi

echo ""
echo "Migration complete."
