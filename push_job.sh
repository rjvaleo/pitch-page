#!/usr/bin/env bash
# push_job.sh <slug>
#
# Validates a job config against the pitch.js schema, commits and pushes it,
# then actually verifies it's live (never assumes CDN propagation) and
# auto-remediates the known GitHub Actions "duplicate artifact" deploy bug
# if it recurs, instead of requiring a human to notice and manually retry.
#
# Background: actions/upload-pages-artifact can time out waiting for upload
# confirmation, retry, and create a second "github-pages" artifact for the
# same run — which makes actions/deploy-pages refuse to deploy with
# "Multiple artifacts named github-pages... Artifact count is 2." This is an
# open, unresolved upstream bug (no version pin fixes it as of 2026-07-05,
# see actions/upload-pages-artifact#97). The only known remediation is a
# fresh full re-run, so this script does that automatically once before
# giving up and asking for manual investigation.

set -e
SLUG="$1"
if [ -z "$SLUG" ]; then
  echo "Usage: $0 <slug>"
  exit 1
fi

cd "$(dirname "$0")"

JSON="jobs/$SLUG.json"
if [ ! -f "$JSON" ]; then
  echo "✗ $JSON does not exist"
  exit 1
fi

echo "Validating $JSON against pitch.js schema..."
python3 validate_job_config.py "$JSON"

git add "$JSON"
if ! git diff --cached --quiet; then
  git commit -m "Create/update $SLUG.json"
else
  echo "No staged changes for $SLUG.json — pushing current state anyway."
fi
git push

URL="https://rjvaleo.github.io/pitch-page/jobs/$SLUG.json"

check_live() {
  curl -s -o /dev/null -w "%{http_code}" "$URL"
}

echo "Waiting ~30s for deploy, then verifying $URL ..."
sleep 30
CODE=$(check_live)

if [ "$CODE" = "200" ]; then
  echo "✓ LIVE: $URL"
  exit 0
fi

echo "Not live yet (HTTP $CODE). Could be normal lag or the known duplicate-artifact bug."
echo "Triggering one automatic full re-run to remediate..."
git commit --allow-empty -m "Trigger fresh deploy retry (auto-remediation for duplicate-artifact bug)"
git push

echo "Waiting ~30s for retry deploy, then re-checking ..."
sleep 30
CODE=$(check_live)

if [ "$CODE" = "200" ]; then
  echo "✓ LIVE after automatic retry: $URL"
  exit 0
fi

echo "✗ Still not live after one automatic retry (HTTP $CODE)."
echo "Do not assume propagation delay at this point — check the actual run log:"
echo "  https://github.com/rjvaleo/pitch-page/actions"
exit 1
