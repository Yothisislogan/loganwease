#!/usr/bin/env python3
"""
build.py — turns src/ + content/ into dist/.

    python3 build.py            # build into dist/
    python3 build.py --check    # build, then print a summary and exit non-zero on any problem

Design notes:
  * src/ is copied verbatim, except anything whose path component starts with "_"
    (those are partials and templates, not pages).
  * Pages opt into the shared chrome with <!--@include:header--> / <!--@include:footer-->.
    Existing hand-written pages that don't use the markers are left exactly as they are.
  * Local .css/.js references get ?v=<short git sha> so nginx can cache assets hard
    while HTML stays no-cache.
  * Markdown lives in content/. Front matter is a leading "---" block of key: value
    lines, parsed here — no extra dependency for it.
  * Any failure raises. The deploy webhook treats a non-zero exit as "do not rsync",
    which is what keeps a broken build from wiping the live site.
"""

from __future__ import annotations

import html as html_mod
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
CONTENT = ROOT / "content"
DIST = ROOT / "dist"
TMP = ROOT / ".dist.tmp"

PARTIALS = SRC / "_partials"
TEMPLATES = SRC / "_templates"

SITE_URL = "https://loganwease.com"
SITE_TITLE = "Logan Wease"

# Files we rewrite asset URLs inside of.
HTML_SUFFIXES = {".html"}

problems: list[str] = []


# --------------------------------------------------------------------------- utils


def fail(msg: str) -> None:
    raise SystemExit(f"build.py: {msg}")


def warn(msg: str) -> None:
    problems.append(msg)
    print(f"  ! {msg}", file=sys.stderr)


def git_version() -> str:
    """Short git sha for cache busting; falls back to a timestamp outside a repo."""
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=ROOT, capture_output=True, text=True, timeout=10,
        )
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        pass
    return datetime.now(timezone.utc).strftime("%Y%m%d%H%M")


def is_private(path: Path, base: Path) -> bool:
    """True for _partials, _templates, and anything else underscore-prefixed."""
    return any(part.startswith("_") for part in path.relative_to(base).parts)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


# ------------------------------------------------------------------- front matter


TRUTHY = {"true", "yes", "1"}
FALSY = {"false", "no", "0"}


def parse_front_matter(text: str) -> tuple[dict, str]:
    """Split a leading --- block of key: value lines off the body."""
    if not text.startswith("---"):
        return {}, text
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text
    meta: dict = {}
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return meta, "\n".join(lines[i + 1:]).lstrip("\n")
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        low = value.lower()
        if low in TRUTHY:
            meta[key] = True
        elif low in FALSY:
            meta[key] = False
        elif key == "tags":
            meta[key] = [t.strip() for t in value.split(",") if t.strip()]
        else:
            meta[key] = value
    fail("unterminated front matter block")
    return {}, text  # unreachable, keeps type checkers happy


# ---------------------------------------------------------------------- templating


def render(template: str, values: dict) -> str:
    """Dead-simple {{key}} substitution. Unknown keys become empty strings."""
    def sub(match: re.Match) -> str:
        key = match.group(1).strip()
        return str(values.get(key, ""))
    return re.sub(r"\{\{\s*([\w.-]+)\s*\}\}", sub, template)


def load_partials() -> dict[str, str]:
    parts: dict[str, str] = {}
    if PARTIALS.is_dir():
        for f in sorted(PARTIALS.glob("*.html")):
            parts[f.stem] = read(f).strip()
    return parts


INCLUDE_RE = re.compile(r"[ \t]*<!--@include:([\w-]+)-->[ \t]*\n?")


def inject_partials(text: str, parts: dict[str, str], where: str) -> str:
    def sub(match: re.Match) -> str:
        name = match.group(1)
        if name not in parts:
            warn(f"{where}: no partial named '{name}' in src/_partials/")
            return ""
        return parts[name] + "\n"
    return INCLUDE_RE.sub(sub, text)


# ------------------------------------------------------------------ asset versions


# href="foo.css" / src='/desk.js' — local only, no scheme, no protocol-relative, no query.
ASSET_RE = re.compile(
    r"""(?P<attr>\b(?:href|src)\s*=\s*)(?P<q>["'])(?P<url>(?!https?:|//|data:|mailto:|#)[^"'?#]+\.(?:css|js))(?P=q)""",
    re.IGNORECASE,
)


def version_assets(text: str, version: str) -> str:
    def sub(match: re.Match) -> str:
        return f'{match.group("attr")}{match.group("q")}{match.group("url")}?v={version}{match.group("q")}'
    return ASSET_RE.sub(sub, text)


# ----------------------------------------------------------------------- markdown


def markdown_renderer():
    try:
        import markdown  # noqa: PLC0415  (optional-at-import-time by design)
    except ImportError:
        fail(
            "python3-markdown is not installed.\n"
            "        server:  sudo apt install python3-markdown python3-pygments\n"
            "        local:   python3 -m pip install markdown"
        )
    extensions = ["extra", "sane_lists", "toc"]
    try:
        import pygments  # noqa: F401
        extensions.append("codehilite")
    except ImportError:
        extensions.append("fenced_code")
    return lambda text: markdown.markdown(text, extensions=extensions, output_format="html5")


def load_template(name: str) -> str | None:
    path = TEMPLATES / f"{name}.html"
    if not path.is_file():
        return None
    return read(path)


# --------------------------------------------------------------------- build steps


def copy_src(out: Path) -> int:
    """Copy src/ verbatim, minus underscore-prefixed paths."""
    if not SRC.is_dir():
        fail("src/ does not exist — nothing to build")
    count = 0
    for path in sorted(SRC.rglob("*")):
        if is_private(path, SRC):
            continue
        rel = path.relative_to(SRC)
        target = out / rel
        if path.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            count += 1
    return count


def process_html(out: Path, parts: dict[str, str], version: str) -> int:
    """Inject partials and stamp asset versions across every built HTML file."""
    count = 0
    for path in sorted(out.rglob("*")):
        if path.suffix.lower() not in HTML_SUFFIXES or not path.is_file():
            continue
        rel = path.relative_to(out)
        text = read(path)
        text = inject_partials(text, parts, str(rel))
        text = version_assets(text, version)
        path.write_text(text, encoding="utf-8")
        count += 1
    return count


def build_pages(out: Path, md, parts: dict[str, str], version: str) -> int:
    """content/*.md -> dist/<slug>/index.html"""
    if not CONTENT.is_dir():
        return 0
    template = load_template("page")
    count = 0
    for path in sorted(CONTENT.glob("*.md")):
        meta, body = parse_front_matter(read(path))
        slug = meta.get("slug") or path.stem
        if not template:
            warn(f"content/{path.name}: no src/_templates/page.html — skipped")
            continue
        page = render(template, {
            # front matter first so any extra key (kicker, etc.) reaches the template,
            # then the computed values win.
            **{k: (", ".join(v) if isinstance(v, list) else v) for k, v in meta.items()},
            "title": meta.get("title", slug),
            "description": meta.get("description", ""),
            "slug": slug,
            "content": md(body),
            "canonical": f"{SITE_URL}/{slug}/",
        })
        page = version_assets(inject_partials(page, parts, f"content/{path.name}"), version)
        write(out / slug / "index.html", page)
        count += 1
    return count


def build_log(out: Path, md, parts: dict[str, str], version: str) -> int:
    """content/log/*.md -> dist/log/<slug>/, plus the index and RSS feed."""
    log_dir = CONTENT / "log"
    if not log_dir.is_dir():
        return 0
    post_tpl = load_template("log-post")
    index_tpl = load_template("log-index")
    posts = []
    for path in sorted(log_dir.glob("*.md")):
        meta, body = parse_front_matter(read(path))
        if meta.get("draft"):
            print(f"  · skipping draft {path.name}")
            continue
        # 2026-08-05-some-slug.md -> some-slug
        stem = path.stem
        m = re.match(r"^(\d{4}-\d{2}-\d{2})-(.+)$", stem)
        date_str = meta.get("date") or (m.group(1) if m else "")
        slug = meta.get("slug") or (m.group(2) if m else stem)
        if not date_str:
            warn(f"content/log/{path.name}: no date in front matter or filename")
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            warn(f"content/log/{path.name}: unparseable date {date_str!r}")
            dt = datetime.now(timezone.utc)
        posts.append({
            "slug": slug,
            "title": meta.get("title", slug),
            "summary": meta.get("summary", ""),
            "tags": meta.get("tags", []),
            "date": date_str,
            "dt": dt,
            "pretty_date": dt.strftime("%b %-d, %Y") if os.name != "nt" else dt.strftime("%b %d, %Y"),
            "html": md(body),
        })
    posts.sort(key=lambda p: p["dt"], reverse=True)

    if not post_tpl or not index_tpl:
        if posts:
            warn("content/log/ has posts but src/_templates/log-post.html or log-index.html is missing")
        return 0

    for post in posts:
        page = render(post_tpl, {
            **post,
            "tag_list": ", ".join(post["tags"]),
            "content": post["html"],
            "canonical": f"{SITE_URL}/log/{post['slug']}/",
        })
        page = version_assets(inject_partials(page, parts, f"log/{post['slug']}"), version)
        write(out / "log" / post["slug"] / "index.html", page)

    items = "\n".join(
        '        <li class="log-item"><a href="/log/{slug}/">'
        '<time datetime="{date}">{pretty}</time>'
        "<h2>{title}</h2><p>{summary}</p></a></li>".format(
            slug=p["slug"], date=p["date"], pretty=p["pretty_date"],
            title=html_mod.escape(p["title"]), summary=html_mod.escape(p["summary"]),
        )
        for p in posts
    )
    index = render(index_tpl, {
        "items": items or '        <li class="log-item"><p>Nothing published yet.</p></li>',
        "count": len(posts),
        "canonical": f"{SITE_URL}/log/",
    })
    index = version_assets(inject_partials(index, parts, "log/index"), version)
    write(out / "log" / "index.html", index)
    write(out / "log" / "feed.xml", build_feed(posts))
    return len(posts)


def build_feed(posts: list[dict]) -> str:
    """Hand-rolled RSS 2.0 — no dependency, and the shape is fixed."""
    now = format_datetime(datetime.now(timezone.utc))
    entries = []
    for p in posts[:20]:
        entries.append(
            "    <item>\n"
            f"      <title>{html_mod.escape(p['title'])}</title>\n"
            f"      <link>{SITE_URL}/log/{p['slug']}/</link>\n"
            f"      <guid isPermaLink=\"true\">{SITE_URL}/log/{p['slug']}/</guid>\n"
            f"      <pubDate>{format_datetime(p['dt'])}</pubDate>\n"
            f"      <description>{html_mod.escape(p['summary'])}</description>\n"
            "    </item>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        f"    <title>{SITE_TITLE} — build log</title>\n"
        f"    <link>{SITE_URL}/log/</link>\n"
        "    <description>Notes on what I'm building and what broke.</description>\n"
        "    <language>en-us</language>\n"
        f"    <lastBuildDate>{now}</lastBuildDate>\n"
        f'    <atom:link href="{SITE_URL}/log/feed.xml" rel="self" type="application/rss+xml" />\n'
        + "\n".join(entries) + ("\n" if entries else "")
        + "  </channel>\n</rss>\n"
    )


def build_knowledge(out: Path) -> bool:
    """dist/ask/knowledge.txt — the Ask Logan context block (Task 8 consumes it)."""
    projects_path = CONTENT / "projects.json"
    if not projects_path.is_file():
        return False
    try:
        projects = json.loads(read(projects_path))
    except json.JSONDecodeError as e:
        fail(f"content/projects.json is not valid JSON: {e}")
    lines = ["ABOUT LOGAN WEASE'S SITE", ""]
    lines.append("PROJECTS")
    for p in projects:
        if p.get("private"):
            continue
        bits = [f"- {p.get('name', '?')} ({p.get('status', '?')}, {p.get('year', '')})".rstrip(", ")]
        if p.get("tagline"):
            bits.append(f"  {p['tagline']}")
        if p.get("description"):
            bits.append(f"  {p['description']}")
        if p.get("stack"):
            bits.append(f"  Stack: {', '.join(p['stack'])}")
        if p.get("url"):
            bits.append(f"  URL: {p['url']}")
        lines.extend(bits)
    uses = CONTENT / "uses.md"
    if uses.is_file():
        _, body = parse_front_matter(read(uses))
        lines += ["", "TOOLS AND STACK", body.strip()]
    log_dir = CONTENT / "log"
    if log_dir.is_dir():
        summaries = []
        for path in sorted(log_dir.glob("*.md"), reverse=True):
            meta, _ = parse_front_matter(read(path))
            if meta.get("draft"):
                continue
            if meta.get("summary"):
                summaries.append(f"- {meta.get('title', '')}: {meta['summary']}")
        if summaries:
            lines += ["", "RECENT WRITING"] + summaries
    text = "\n".join(lines).strip() + "\n"
    # 8B model, small context: keep it well under the budget.
    approx_tokens = len(text) // 4
    if approx_tokens > 2500:
        warn(f"ask/knowledge.txt is ~{approx_tokens} tokens (budget 2500) — trim projects.json or summaries")
    write(out / "ask" / "knowledge.txt", text)
    return True


# ---------------------------------------------------------------------------- main


def main() -> int:
    check_only = "--check" in sys.argv
    version = git_version()
    print(f"build.py: version {version}")

    md = markdown_renderer()
    parts = load_partials()
    print(f"  partials: {', '.join(sorted(parts)) or 'none'}")

    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir(parents=True)

    copied = copy_src(TMP)
    pages = build_pages(TMP, md, parts, version)
    logs = build_log(TMP, md, parts, version)
    processed = process_html(TMP, parts, version)
    knowledge = build_knowledge(TMP)

    # Swap in the new tree only once everything above succeeded.
    if DIST.exists():
        shutil.rmtree(DIST)
    TMP.rename(DIST)

    print(f"  copied   {copied} file(s) from src/")
    print(f"  rendered {pages} markdown page(s), {logs} log post(s)")
    print(f"  stamped  {processed} html file(s) with ?v={version}")
    print(f"  ask knowledge block: {'written' if knowledge else 'skipped (no projects.json)'}")

    if problems:
        print(f"build.py: {len(problems)} problem(s)", file=sys.stderr)
        if check_only:
            return 1
    print("build.py: ok")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as exc:  # noqa: BLE001 — deploy needs a non-zero exit, not a traceback swallow
        print(f"build.py: FAILED — {exc.__class__.__name__}: {exc}", file=sys.stderr)
        raise
