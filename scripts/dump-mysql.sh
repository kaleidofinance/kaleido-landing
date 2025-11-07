#!/usr/bin/env bash
set -euo pipefail

# scripts/dump-mysql.sh
# Reads MySQL connection values from .env.local (repo root) or environment variables
# Writes a timestamped SQL dump into ./dumps (relative to repo root) by default
# Usage:
#   ./scripts/dump-mysql.sh           # uses values from .env.local or env vars
#   ./scripts/dump-mysql.sh --output-dir ./backups
#   ./scripts/dump-mysql.sh --prompt  # prompts for password interactively

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.local"
OUTPUT_DIR="$REPO_ROOT/dumps"
PROMPT_PASS=false

# Simple arg parse
while [[ $# -gt 0 ]]; do
  case "$1" in
    --output-dir|-o)
      shift
      OUTPUT_DIR="$1"
      ;;
    --prompt|-p)
      PROMPT_PASS=true
      ;;
    --env-file)
      shift
      ENV_FILE="$1"
      ;;
    --help|-h)
      sed -n '1,120p' "$SCRIPT_DIR/$(basename "$0")" | sed -n '1,120p'
      exit 0
      ;;
    *)
      echo "Unknown arg: $1"
      exit 1
      ;;
  esac
  shift
done

# Read .env.local if exists
HOST=""
USER=""
PASS=""
DB=""
PORT=""

if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key val; do
    # strip whitespace
    key="$(echo "$key" | tr -d ' \t')"
    # skip comments and empty
    if [[ -z "$key" || "$key" == \#* ]]; then
      continue
    fi
    # only consider MYSQL_ keys
    case "$key" in
      MYSQL_HOST)
        HOST="${val%\"}"; HOST="${HOST#\"}";;
      MYSQL_USER)
        USER="${val%\"}"; USER="${USER#\"}";;
      MYSQL_PASSWORD)
        PASS="${val%\"}"; PASS="${PASS#\"}";;
      MYSQL_DATABASE)
        DB="${val%\"}"; DB="${DB#\"}";;
      MYSQL_PORT)
        PORT="${val%\"}"; PORT="${PORT#\"}";;
    esac
  done < <(grep -E '^MYSQL_' "$ENV_FILE" || true)
fi

# Fallback to environment variables
HOST="${HOST:-${MYSQL_HOST:-127.0.0.1}}"
USER="${USER:-${MYSQL_USER:-}}"
PASS="${PASS:-${MYSQL_PASSWORD:-}}"
DB="${DB:-${MYSQL_DATABASE:-}}"
PORT="${PORT:-${MYSQL_PORT:-3306}}"

if [[ -z "$USER" || -z "$DB" ]]; then
  echo "Error: MYSQL_USER and MYSQL_DATABASE must be set in $ENV_FILE or environment variables."
  exit 2
fi

# If prompting requested, read from stdin
if [[ "$PROMPT_PASS" = true ]]; then
  read -s -p "MySQL password for $USER: " PASS
  echo
fi

mkdir -p "$OUTPUT_DIR"
OUTFILE="$OUTPUT_DIR/${DB}_$(date +%Y%m%d_%H%M%S).sql"

# Check for mysqldump in PATH
if ! command -v mysqldump >/dev/null 2>&1; then
  echo "Error: 'mysqldump' not found in PATH. Install MySQL client tools (apt/yum/dnf) or ensure mysqldump is available." >&2
  exit 3
fi

echo "Dumping database '$DB' from $HOST:$PORT as user '$USER' to:\n  $OUTFILE\n"

# Use MYSQL_PWD env var when password is available to avoid exposing it in command args
if [[ -n "$PASS" ]]; then
  export MYSQL_PWD="$PASS"
  set +x
  if mysqldump --host="$HOST" --port="$PORT" --user="$USER" --routines --events --single-transaction --quick --skip-lock-tables "$DB" > "$OUTFILE"; then
    echo "Dump completed: $OUTFILE"
    # unset MYSQL_PWD for safety
    unset MYSQL_PWD
    exit 0
  else
    echo "mysqldump failed with exit code $?" >&2
    unset MYSQL_PWD
    exit 4
  fi
else
  # No password provided: mysqldump will prompt interactively
  if mysqldump --host="$HOST" --port="$PORT" --user="$USER" --routines --events --single-transaction --quick --skip-lock-tables --databases "$DB" > "$OUTFILE"; then
    echo "Dump completed: $OUTFILE"
    exit 0
  else
    echo "mysqldump failed with exit code $?" >&2
    exit 4
  fi
fi
