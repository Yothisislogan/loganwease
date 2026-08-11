/* The Drawer — a site-wide lost-and-found hunt.
   Include with: <script defer src="drawer.js" data-root="./"></script>
   (data-root is the path prefix back to the site root from the current page.) */
(function () {
  var ROOT = (document.currentScript && document.currentScript.dataset.root) || './';
  var KEY = 'lw-drawer';
  var ITEMS = { paperclip: 'Paperclip', pen: 'Pen', bean: 'Coffee bean', stamp: 'Lost stamp', key: 'Brass key' };
  var TOTAL = 5;

  function load() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { return new Set(); }
  }
  function save(found) {
    try { localStorage.setItem(KEY, JSON.stringify([].concat.apply([], [Array.from(found)]))); } catch (e) {}
  }
  var found = load();

  var css = [
    '.lw-lost{background:none;border:none;padding:6px;margin:0;cursor:pointer;color:rgba(17,20,25,.5);opacity:.75;transition:.2s ease;line-height:0}',
    '.lw-lost:hover{opacity:1;transform:scale(1.15) rotate(-6deg)}',
    'html.dark .lw-lost{color:rgba(236,229,214,.55)}',
    '.lw-drawer-chip{position:fixed;left:14px;bottom:14px;z-index:900;display:inline-flex;align-items:center;gap:8px;border:2px solid #111419;border-radius:999px;background:#fff8e9;color:#111419;padding:9px 15px;font-family:"IBM Plex Mono",monospace;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;box-shadow:4px 4px 0 rgba(17,20,25,.2);text-decoration:none}',
    '.lw-drawer-chip:hover{transform:translate(-1px,-1px)}',
    '.lw-drawer-chip.open{background:#f0c452;box-shadow:4px 4px 0 rgba(17,20,25,.3),0 0 18px rgba(240,196,82,.55)}',
    'html.dark .lw-drawer-chip{border-color:rgba(255,248,233,.5)}',
    '.lw-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) rotate(-1deg);z-index:950;border:2px solid #111419;background:#fff071;color:#111419;padding:13px 20px;font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;box-shadow:6px 7px 0 rgba(17,20,25,.25);animation:lwToastIn .3s cubic-bezier(.2,1.4,.4,1)}',
    '@keyframes lwToastIn{from{transform:translateX(-50%) rotate(-1deg) translateY(18px);opacity:0}to{transform:translateX(-50%) rotate(-1deg);opacity:1}}',
    '@media print{.lw-drawer-chip,.lw-lost{display:none}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var chip = null;
  function renderChip() {
    if (found.size === 0) { if (chip) chip.remove(); chip = null; return; }
    if (!chip) {
      chip = document.createElement('a');
      chip.className = 'lw-drawer-chip';
      chip.href = ROOT + 'drawer.html';
      document.body.appendChild(chip);
    }
    if (found.size >= TOTAL) {
      chip.classList.add('open');
      chip.textContent = '→ drawer unlocked';
      chip.setAttribute('aria-label', 'The drawer is unlocked — open it');
    } else {
      chip.textContent = 'drawer ' + found.size + '/' + TOTAL;
      chip.setAttribute('aria-label', 'Lost and found: ' + found.size + ' of ' + TOTAL + ' items — what is this?');
    }
  }

  var toastTimer = null;
  function toast(msg) {
    var t = document.querySelector('.lw-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.className = 'lw-toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 3400);
  }

  function bind() {
    document.querySelectorAll('.lw-lost').forEach(function (el) {
      var item = el.dataset.item;
      if (!ITEMS[item]) return;
      if (found.has(item)) { el.remove(); return; }
      el.addEventListener('click', function () {
        if (found.has(item)) return;
        found.add(item);
        save(found);
        el.remove();
        renderChip();
        if (found.size >= TOTAL) {
          toast('✓ ' + ITEMS[item] + ' found · THE DRAWER IS UNLOCKED');
        } else if (found.size === 1) {
          toast('✓ ' + ITEMS[item] + ' found · 1/' + TOTAL + ' — 4 more are lost around this site');
        } else {
          toast('✓ ' + ITEMS[item] + ' found · ' + found.size + '/' + TOTAL);
        }
      });
    });
    renderChip();
  }

  window.lwDrawer = {
    count: function () { return found.size; },
    total: TOTAL,
    unlocked: function () { return found.size >= TOTAL; },
    has: function (item) { return found.has(item); },
    reset: function () { found = new Set(); save(found); renderChip(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
