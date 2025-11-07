This folder contains helper scripts for MySQL dumps.

Dump script: `dump-mysql.ps1` (Windows/PowerShell) or `dump-mysql.sh` (Linux/bash)

## Windows PowerShell usage

- From the repository root (FrontPage):

  .\scripts\dump-mysql.ps1

- To write to a specific directory:

  .\scripts\dump-mysql.ps1 -OutputDir .\backups

## Linux / VPS (bash) usage

- From the repository root:

  ./scripts/dump-mysql.sh

- To prompt for the password instead of reading `.env.local`:

  ./scripts/dump-mysql.sh --prompt

- To specify an output dir:

  ./scripts/dump-mysql.sh --output-dir ./backups

Notes:
- The script reads MySQL connection values from `.env.local` in the repository root.
- It passes the password to `mysqldump` on the command line for convenience; on multi-user systems prefer using a `~/.my.cnf` file or omit the password to be prompted interactively.
- Requires `mysqldump` to be available in PATH (MySQL client tools).
- The bash script reads `.env.local` for `MYSQL_*` values but falls back to environment variables if not present.
- When a password is provided via `.env.local` or env var, the script uses `MYSQL_PWD` to avoid placing the password in the process argument list.
