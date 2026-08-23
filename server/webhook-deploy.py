# Reference snippet — NOT imported by the site.
#
# This is the deploy half of /opt/gh-webhook/webhook.py after Task 0.
# Splice the body of `run_deploy()` into the existing handler, keeping the
# HMAC-SHA256 signature check exactly as it is today.
#
# What changed vs. the old flow:
#   old:  git fetch + reset --hard  ->  rsync REPO ROOT  -> /var/www/loganwease
#   new:  git fetch + reset --hard  ->  python3 build.py -> rsync dist/ -> /var/www/loganwease
#
# The build gate is the point: if build.py exits non-zero we return 500 without
# touching /var/www, so GitHub shows a red X and the live site keeps serving the
# last good deploy.

import logging
import subprocess

REPO = "/opt/loganwease"
WEBROOT = "/var/www/loganwease"
BUILD_TIMEOUT = 180

log = logging.getLogger("gh-webhook")


def run_deploy():
    """Returns (status_code, message). Caller does the HMAC check first."""

    # 1. Sync the repo to origin/main.
    for cmd in (
        ["git", "fetch", "--prune", "origin", "main"],
        ["git", "reset", "--hard", "origin/main"],
    ):
        proc = subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0:
            log.error("deploy: %s failed: %s", " ".join(cmd), proc.stderr.strip())
            return 500, f"git step failed: {proc.stderr.strip()[:400]}"

    # 2. Build. A failure here aborts the deploy and leaves /var/www untouched.
    build = subprocess.run(
        ["python3", "build.py"],
        cwd=REPO, capture_output=True, text=True, timeout=BUILD_TIMEOUT,
    )
    if build.returncode != 0:
        log.error(
            "deploy: BUILD FAILED (rc=%s), keeping previous site\nstdout:\n%s\nstderr:\n%s",
            build.returncode, build.stdout.strip(), build.stderr.strip(),
        )
        return 500, f"build failed: {build.stderr.strip()[:600]}"
    log.info("deploy: build ok\n%s", build.stdout.strip())

    # 3. Publish dist/ only.
    #    --delete removes files dropped from the repo.
    #    --exclude protects the travel dashboard's runtime data (written by
    #    travel-fetch.service, never committed). Do NOT add --delete-excluded:
    #    that would delete the very file the exclude is protecting.
    rsync = subprocess.run(
        [
            "rsync", "-a", "--delete",
            "--exclude", "travel/data.json",
            f"{REPO}/dist/", f"{WEBROOT}/",
        ],
        capture_output=True, text=True, timeout=120,
    )
    if rsync.returncode != 0:
        log.error("deploy: rsync failed: %s", rsync.stderr.strip())
        return 500, f"rsync failed: {rsync.stderr.strip()[:400]}"

    log.info("deploy: published to %s", WEBROOT)
    return 200, "deployed"
