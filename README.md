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
