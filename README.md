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
