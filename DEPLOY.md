# Deploying loganwease.com

Static site. Push to `main` → GitHub webhook → build on the server → rsync to the webroot.
No Node toolchain; the build is Python stdlib plus `python3-markdown`.

---

## Repo layout

```
src/                 hand-written pages, css, js, images, fonts  →  copied verbatim to dist/
  _partials/         head.html, header.html, footer.html         →  injected, never copied
  _templates/        page.html, log-post.html, log-index.html    →  used by build.py, never copied
  assets/            fonts, images, site.css, og-card, PDFs
content/             projects.json, uses.md, log/*.md            →  rendered by build.py
build.py             content/ + src/  →  dist/
server/              reference copies of server-side files (not served)
dist/                build output — gitignored, never committed
```

Anything under `src/` whose path contains a component starting with `_` is treated as
build input, not a page, and is not copied to `dist/`.

---

## Build

```bash
python3 build.py            # build into dist/
python3 build.py --check    # same, but exit non-zero if anything looked wrong
```

Requires `python3-markdown` (and optionally `python3-pygments` for code highlighting):

```bash
sudo apt install python3-markdown python3-pygments
```

What it does:

1. **Copies `src/` → `dist/`** verbatim, skipping `_`-prefixed paths.
2. **Renders markdown.** `content/*.md` → `/<slug>/`, `content/log/*.md` → `/log/<slug>/`,
   plus a generated `/log/` index and `/log/feed.xml` (RSS 2.0). Posts with
   `draft: true` are skipped entirely — they never reach `dist/`.
3. **Injects partials.** Any HTML containing `<!--@include:header-->` gets
   `src/_partials/header.html` spliced in. Existing hand-written pages that don't use
   the markers are passed through untouched.
4. **Stamps asset versions.** Local `.css`/`.js` references get `?v=<short git sha>`,
   so nginx can cache assets hard while HTML stays `no-cache`.
5. **Writes `dist/ask/knowledge.txt`** from `projects.json` + `uses.md` + log summaries
   (the Ask Logan context block). Warns if it exceeds ~2,500 tokens.

**Front matter** is a leading `---` block of `key: value` lines, parsed in `build.py` —
no dependency for it. `true`/`false` become booleans; `tags` splits on commas.
Every front-matter key is available to the template as `{{key}}`.

**Failure behavior (important):** the build assembles into `.dist.tmp/` and only swaps it
into place once every step has succeeded. Any error — bad front matter, invalid
`projects.json`, missing dependency — raises and exits non-zero, leaving the previous
`dist/` byte-identical. Verified: malformed front matter and invalid JSON both exit 1
with `dist/` unchanged.

---

## Webhook

`/opt/gh-webhook/webhook.py` — Flask, port 8099, systemd. nginx proxies
`loganwease.com/gh-webhook-a8f3d2xyz` → 8099. GitHub sends `application/json`;
the handler verifies HMAC-SHA256 against `/opt/gh-webhook/secret`.

On push to `main`:

```
git fetch --prune origin main
git reset --hard origin/main
python3 build.py                 # non-zero  →  abort, log, return 500, keep live site
rsync -a --delete --exclude travel/data.json  /opt/loganwease/dist/  /var/www/loganwease/
```

The deploy half is written out in [`server/webhook-deploy.py`](server/webhook-deploy.py) —
splice it into the existing handler and keep the signature check exactly as it is.

- `--delete` removes files dropped from the repo.
- `--exclude travel/data.json` protects the travel dashboard's runtime data, which is
  written by `travel-fetch.service` and never committed.
- **Never add `--delete-excluded`** — it would delete the file the exclude protects.

Test it with an empty commit and watch the unit:

```bash
git commit --allow-empty -m "deploy test" && git push
journalctl -u gh-webhook -f     # (use the actual unit name)
```

### One-time cutover to the new pipeline

The webroot layout does not change — URLs are identical before and after — but the
**rsync source moves from the repo root to `dist/`**. Apply the webhook change *before*
merging the restructure to `main`, or the first deploy will rsync a repo root that no
longer has `index.html` at the top level.

```bash
cp -a /var/www/loganwease /var/www/loganwease.bak-$(date +%F)   # backup first
sudo apt install python3-markdown python3-pygments
cd /opt/loganwease && git fetch origin && git checkout <this-branch> && python3 build.py
ls dist/                                                        # sanity check
# then patch webhook.py, restart it, and merge to main
```

---

## nginx

Serve HTML with `no-cache` and hash-versioned assets with a long max-age:

```nginx
location ~* \.html$ { expires -1; add_header Cache-Control "no-cache"; }
location = /        { expires -1; add_header Cache-Control "no-cache"; }
location /assets/   { expires 30d; add_header Cache-Control "public, max-age=2592000"; }
error_page 404 /404.html;
```

Run `nginx -t` before every reload, and `curl -I` the affected URLs after.

> **Check this:** the brief says HTML is served `no-cache`, but a `curl -I` on
> 2026-08-03 returned `Cache-Control: max-age=604800, public` — a 7-day HTML cache,
> which makes deploys look like they never landed. Worth confirming which is live.

---

## Secrets

Never in the repo. Server-side `.env` files, `chmod 600`, loaded via systemd
`EnvironmentFile=`.

| File | Used by | Contains |
| --- | --- | --- |
| `/opt/gh-webhook/secret` | webhook | GitHub HMAC secret (existing) |
| `/opt/gh-webhook/.env` | contact form (Task 3) | `SENDGRID_API_KEY` |
| `/opt/travel-fetch/.env` | travel fetcher (Task 4) | `SERPAPI_KEY`, `GOWILD_WORKER_URL`, Amtrak creds |

---

## Coming in later tasks

Recorded here as they land. Two items need lead time and can start now:

- **Task 3 — SendGrid sender.** Decision made: authenticate `loganwease.com` rather than
  reusing the WIT sender. That needs sender authentication set up in SendGrid and the
  CNAME records it issues added at Squarespace. **A records only — no AAAA**, an AAAA
  record breaks certbot on this host. DNS takes time, so starting early helps.
- **Task 9 — analytics.** Needs an A record for `stats.loganwease.com` (again, no AAAA)
  before certbot can issue.

Not yet written: `travel-fetch.service`/`.timer`, `/api/contact`, `/api/ask`,
`/api/radio/status`, and the `stats.` vhost.
