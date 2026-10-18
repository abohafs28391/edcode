#!/bin/bash
# Sync the latest tool build from the workspace into this Vercel copy.
#
# Use AFTER rebuilding the tool in the workspace:
#   cd /home/z/my-project/scripts && python3 build_ed_code_assist.py
# then, from THIS folder:
#   ./sync-from-workspace.sh
#
# Never edit public/ed-code-assist.html by hand — always rebuild from
# scripts/ed_code_assist_template.html so both versions stay byte-identical.
set -e
cd "$(dirname "$0")"
W="${1:-../download}"     # workspace download/ (override: ./sync-from-workspace.sh /path/to/download)

for f in ed-code-assist.html PROMPT.md LOGIC.md README.md; do
  if [ -f "$W/$f" ]; then cp "$W/$f" "public/$f"; else echo "MISSING: $W/$f (pass the download/ path as \$1)"; exit 1; fi
done
echo "synced from $W:"
md5sum public/ed-code-assist.html
echo "next: vercel --prod   (or git push, if you deployed via GitHub)"
