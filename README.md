# LoganWease.com creative rebuild

This is version 002 of the Logan Wease personal founder site.

Concept: a working file / operator desk rather than a standard founder template.

Files:
- index.html
- thank-you.html
- logan-wease-short-bio.txt
- assets/

The contact form is Netlify-ready using `data-netlify="true"`.


Version 003 adds Open Tabs, Now Building, Receipts, Field Logs, and a visible media kit. The more sensitive tool category discussed separately is intentionally left out for now.

Version 004 (fixes pass):
- Images moved into `assets/` so the HTML paths actually resolve, and compressed (~3.4MB down to ~280KB total).
- Hero photo recropped via `object-position` so Logan is in frame.
- Hero headline capped so the lede and buttons fit above the fold on desktop.
- Reveal-on-scroll no longer hides content if JS fails; reduced-motion and no-IntersectionObserver fallbacks included.
- Fixed "WeInsureShit.com" overflowing its Now Building tile.
- Mobile hero collage repositioned so the status note no longer covers the operator-desk tab.
- Added `favicon.svg` (LW stamp), canonical URL, absolute `og:image`, Twitter card, theme-color, and Person JSON-LD.
- Award photos now have real captions and accurate alt text; images lazy-load with explicit dimensions.
- Mobile menu closes on Escape and outside tap; visible keyboard focus styles.
- Added an in-universe `404.html` (Netlify picks it up automatically); thank-you and 404 pages are noindex.

Version 005 (real numbers pass, sourced from the previous loganwease.com site):
- Receipts section now leads with a hard-number stat row ($2.8M→$7.6M, 15%→27% close rate, top-3% Allstate ranking, ~1,300-agent keynote) and specific proof chips.
- Build map rebuilt with the real career timeline: retail/ops (2001–2012, Aramark), State Farm and life production (2012–2014), Wease Financial (2014–2021, grown and sold), We Insure Things, current experiments.
- Short bio expanded with the Wease Financial track record; JSON-LD gains alumniOf.

Version 006 (thoughts page):
- New `/thoughts/` section — Substack-clean reading layout (680px measure, serif body, minimal chrome) that still lives in the working-file universe (LW stamp, mono labels, sticky-note draft chips).
- `thoughts/index.html`: post list with one published field log and five drafts, plus a Netlify email-subscribe form (`thoughts-subscribe`).
- `thoughts/insurance-is-emotional.html`: first essay ("Insurance is emotional before it is technical") — a starter draft assembled from positions already published on the site; Logan should edit before treating it as final.
- Homepage: "Thoughts" nav link; Field Logs section reordered with the published log linking out and a CTA to the thoughts page.

Version 007 (seven changes pass):
1. Merged the redundant Open Tabs / Now Building / Case Files sections into one Case Files board with status stamps (Active / Experiment / Building / Idea folder). Nav is now Case files / Build map / Thoughts / Contact.
2. The hero "operating log" is a real terminal: help, projects, thoughts, bio, contact, claim, coffee, sudo, clear.
3. The contact form slams a red RECEIVED stamp on submit before posting (skipped under prefers-reduced-motion).
4. The hero status note is dated ("On the desk · Aug 3, 2026") — edit it by hand when things ship.
5. New `bio.html` — clean printable bio with headshot, fast facts, and a print-to-PDF button; replaces the raw .txt downloads (txt still linked from the bio page).
6. Community proof added to Receipts: Daily Press disaster-recovery kits and Allstate Foundation grants, as a taped-in note.
7. Desk details: coffee ring on Case Files, pencil scribble in Field Notes, photo-strip hover straighten, and a footer link row (version bumped to 004 in the footer).

Version 008 (bold pass):
- After-hours mode: a desk-lamp toggle (every page) drops the site into a dark "lights off" theme — the desk goes dark, the paper stays lit. Follows system dark mode by default, remembered in localStorage (`lw-theme`), and the terminal accepts `lights`.
- Case files open: every case card's "Open the file" button swings open a manila-folder dialog with the full story, a status stamp, a "next on this file" sticky note, and links.
- Branded social share card at `assets/og-card.jpg` (1200x630), used as og:image on the homepage, bio, and thoughts index. Regenerate from scratch by re-rendering the card HTML at 1200x630 if the branding changes.

Version 009 (performance pass — Lighthouse mobile was 84 with FCP/LCP at 3.4s):
- Self-hosted all fonts in `assets/fonts/` (Fraunces variable, Inter variable, IBM Plex Mono 400/500/700 — ~213KB total, latin subset). The render-blocking Google Fonts request chain (~2.5s est. savings on Slow 4G) is gone, along with both third-party origins. Declarations are inlined per page with `font-display: swap`; the two variable fonts are preloaded.
- Hero photo now uses `srcset` (800w/1200w) so phones download the 35KB version instead of 64KB.
- Note: the 404 page references fonts with root-absolute paths (`/assets/fonts/...`) since it can be served at any URL.

Version 010 (links + idea folder):
- Case-file dialogs now link out: weinsureshit.com, learn.weinsurethings.com, radio.weinsurethings.com (title corrected to "WiT Radio").
- New `ideas.html` — The Idea Folder: featured RIC Rail Connector Initiative (intro packet at `assets/ric-rail-connector-intro-packet.pdf`), the graduated disaster-recovery-kits card, sealed placeholder notes, and a "start a file" CTA. Dark mode + self-hosted fonts included.
- Local Ideas case file links to the folder page and the PDF; footer gains an Ideas link; terminal gains an `ideas` command.

Version 011 (three bold, non-insurance features):
1. LW-FM (`fm.html`) — an after-hours desk radio generated live with the Web
   Audio API: rain, typewriter bursts, tape hiss + crackle, and a warm chord
   loop (Fmaj7/Am7/Dm7/Bbmaj7) from detuned oscillators. Four channel sliders,
   presets, live VU meter. No audio files, nothing downloaded or tracked.
2. The desk is real — on desktop, the hero collage objects (tab, status note,
   polaroid, console) are draggable with momentum and edge-bounce; positions
   persist in localStorage (`lw-desk`, "reset desk" appears once moved). The
   polaroid flips (button or double-click) to reveal a note on the back.
3. The Drawer — a site-wide hunt (`drawer.js` + `drawer.html`, noindex). Five
   objects are hidden across the site: paperclip (Receipts), pen (thoughts),
   coffee bean (bio), stamp (ideas), brass key (the 404 page). Finds persist
   in localStorage (`lw-drawer`); a progress chip appears after the first
   find; all five unlock the bottom-drawer page. Terminal gains `fm` and
   `drawer` commands; footer gains LW-FM.

Version 012 (three more: desk.js on every page):
1. Screensaver — after 90s idle, the page dims and the LW stamp bounces
   DVD-style with a live clock; any input dismisses. Disabled under
   prefers-reduced-motion.
2. Command palette — Cmd/Ctrl+K or "/" opens an index-card palette with every
   page, section, tool, and a lamp-toggle action; type to filter, arrows +
   enter to jump. Root-absolute paths so it works from any page.
3. The desk cat — lives on the bottom edge of every page, wanders
   occasionally (more active after hours, gold eyes in the dark), pettable
   (hearts + purr bubble, count persists in lw-cat-pets). Name it from the
   home terminal: `cat name <name>`. Terminal also gains `cat` and `palette`.
All three live in the shared `desk.js`, included on all pages including the
working-file/playbooks/tools pages.

Version 013 (three more bold ones):
1. The Tour — the site drives itself: a ghost cursor opens a case file,
   shows the receipts, flips the polaroid, types `lights` into the terminal,
   pets the cat, and lands on contact, narrating each stop. Started from the
   hero post-it, the terminal (`tour`), or the palette; any real input hands
   control back. Restores the lamp state it borrowed.
2. The Wastebasket (`wastebasket.html`) — desk sports: crumple terrible
   draft ideas into paper balls and flick them into the bin. Gravity,
   wall/floor bounces, bank shots score double, streak + best persist
   (`lw-toss-best`). Press T for an unaimed auto-toss. The 404 page offers
   "crumple this page instead."
3. Commentary mode — a director's-commentary track for the homepage: pencil
   margin notes annotate a dozen spots ("the coffee ring is not a bug").
   Toggle via terminal `commentary` or the palette; persists (`lw-comm`).
Palette gains entries for all three; terminal gains `tour`, `toss`,
`commentary`; wastebasket added to the sitemap.

HOSTING NOTE (nginx): the live site is served by nginx, not Netlify. Two forms
(`logan-contact` on index.html, `thoughts-subscribe` on thoughts/) use Netlify
form attributes and will NOT submit on plain nginx — POSTs to static files
return 405. Options: point them at a form endpoint (e.g. Formspree/Web3Forms)
or add a tiny handler on the server. Suggested nginx config additions:
  error_page 404 /404.html;
  # HTML: revalidate every visit so webhook deploys appear immediately
  # (repeat views are cheap 304s via ETag/Last-Modified)
  location ~* \.html$ { expires -1; add_header Cache-Control "no-cache"; }
  # Fonts, images, PDFs: cache long
  location /assets/ { expires 30d; add_header Cache-Control "public, max-age=2592000"; }
CACHE WARNING: as of Aug 2026 the live server sends
"Cache-Control: max-age=604800, public" on HTML — browsers hold the old page
for up to 7 days without re-requesting, which makes webhook deploys look like
they never happened. Remove the 7-day expires/add_header for HTML (grep
/etc/nginx for "expires") and reload nginx. Visitors who cached the old page
before the fix will age out within a week; hard-refresh to verify sooner.
