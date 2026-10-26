#!/bin/sh
# ./kirim.sh <slug>: cek naskah, commit, push -> GitHub Actions render
set -e
[ -n "$1" ] || { echo "pakai: kirim.sh <slug>"; exit 1; }
D=$(dirname "$0")
python3 "$D/cek.py" "$D/video/$1"
git -C "$D" remote get-url origin >/dev/null 2>&1 || { echo "repo blm dibikin, liat CHECKLIST-ORING.md"; exit 1; }
git -C "$D" add "video/$1"
git -C "$D" commit -m "video: $1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C "$D" push
echo "terkirim. render: https://github.com/oktayudha05/solusibu/actions"
