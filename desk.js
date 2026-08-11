/* desk.js — three desk-wide features: the screensaver, the command palette,
   and the desk cat. Include on any page with: <script defer src="/desk.js"></script> */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var css = [
    /* ---- screensaver ---- */
    '.lw-saver{position:fixed;inset:0;z-index:10001;background:#060d16;opacity:0;transition:opacity .8s ease;cursor:none}',
    '.lw-saver.on{opacity:1}',
    '.lw-saver .lw-dvd{position:absolute;width:120px;height:120px;border:4px solid #111419;border-radius:16px;background:#fff8e9;display:grid;place-items:center;font-family:Georgia,serif;font-weight:900;font-size:52px;letter-spacing:-.05em;color:#111419;transform:rotate(-4deg);box-shadow:10px 10px 0 #00AEEF;will-change:left,top}',
    '.lw-saver .lw-clock{position:absolute;left:0;right:0;bottom:9vh;text-align:center;font-family:"IBM Plex Mono",monospace;font-size:13px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:rgba(157,233,255,.5)}',
    /* ---- palette ---- */
    '.lw-pal{position:fixed;inset:0;z-index:10002;display:grid;place-items:start center;padding-top:14vh;background:rgba(7,12,20,.55);backdrop-filter:blur(3px)}',
    '.lw-pal-card{width:min(560px,92vw);background:#fff8e9;border:2px solid #111419;border-radius:16px;box-shadow:12px 14px 0 rgba(0,0,0,.35);overflow:hidden;transform:rotate(-.4deg)}',
    '.lw-pal-card input{width:100%;border:none;outline:none;background:transparent;padding:18px 20px;font:600 17px Inter,system-ui,sans-serif;color:#111419;border-bottom:2px solid rgba(17,20,25,.15)}',
    '.lw-pal-list{max-height:46vh;overflow-y:auto;padding:8px}',
    '.lw-pal-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;color:#111419;text-decoration:none}',
    '.lw-pal-item b{font:600 15px Inter,system-ui,sans-serif}',
    '.lw-pal-item span{font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#0078a7}',
    '.lw-pal-item.sel{background:#e8f8ff;outline:2px solid #111419}',
    '.lw-pal-none{padding:16px;font:700 12px "IBM Plex Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:#79818d;text-align:center}',
    '.lw-pal-foot{border-top:2px solid rgba(17,20,25,.15);padding:9px 16px;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:#79818d;display:flex;gap:16px}',
    /* ---- cat ---- */
    '.lw-cat{position:fixed;bottom:-4px;right:11%;z-index:899;border:none;background:none;padding:0;cursor:pointer;color:#111419;transition:right 3.5s cubic-bezier(.4,0,.3,1),transform .3s ease;line-height:0}',
    'html.dark .lw-cat{color:#0a0f16;filter:drop-shadow(0 0 6px rgba(240,196,82,.25))}',
    '.lw-cat svg{display:block}',
    '.lw-cat .lw-eyes{fill:#111419;opacity:0}',
    'html.dark .lw-cat .lw-eyes{fill:#f0c452;opacity:1}',
    '.lw-cat.flip{transform:scaleX(-1)}',
    '.lw-cat:hover{transform:translateY(-3px)}',
    '.lw-cat.flip:hover{transform:scaleX(-1) translateY(-3px)}',
    '.lw-cat-bubble{position:fixed;z-index:900;background:#fff8e9;border:2px solid #111419;border-radius:12px;padding:7px 12px;font:700 11px "IBM Plex Mono",monospace;letter-spacing:.08em;color:#111419;box-shadow:4px 4px 0 rgba(17,20,25,.2);transform:rotate(-2deg);animation:lwBubble 2.4s ease forwards}',
    '@keyframes lwBubble{0%{opacity:0;translate:0 8px}12%{opacity:1;translate:0 0}82%{opacity:1}100%{opacity:0}}',
    '.lw-heart{position:fixed;z-index:900;font-size:15px;color:#ff6262;animation:lwHeart 1.4s ease forwards;pointer-events:none}',
    '@keyframes lwHeart{from{opacity:1;translate:0 0}to{opacity:0;translate:6px -46px}}',
    '@media print{.lw-cat,.lw-saver,.lw-pal{display:none!important}}',
    '@media (max-width:760px){.lw-cat{right:6%}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ================= SCREENSAVER ================= */
  var saver = null, saverRaf = null, idleTimer = null;
  var IDLE_MS = 90000;

  function killSaver() {
    if (!saver) return;
    cancelAnimationFrame(saverRaf);
    var s = saver; saver = null;
    s.classList.remove('on');
    setTimeout(function () { s.remove(); }, 850);
  }
  function startSaver() {
    if (saver || reduced || document.hidden) return;
    saver = document.createElement('div');
    saver.className = 'lw-saver';
    saver.setAttribute('aria-hidden', 'true');
    var dvd = document.createElement('div');
    dvd.className = 'lw-dvd';
    dvd.textContent = 'LW';
    var clock = document.createElement('div');
    clock.className = 'lw-clock';
    saver.appendChild(dvd); saver.appendChild(clock);
    document.body.appendChild(saver);
    requestAnimationFrame(function () { saver && saver.classList.add('on'); });
    var colors = ['#00AEEF', '#ff8a3d', '#f0c452', '#77d5b8', '#ff6262'];
    var ci = 0, x = 60, y = 60, dx = 2.1, dy = 1.7;
    var W = function () { return innerWidth - 124; }, H = function () { return innerHeight - 124; };
    function tick() {
      if (!saver) return;
      x += dx; y += dy;
      var hit = false;
      if (x <= 0 || x >= W()) { dx = -dx; x = Math.max(0, Math.min(x, W())); hit = true; }
      if (y <= 0 || y >= H()) { dy = -dy; y = Math.max(0, Math.min(y, H())); hit = true; }
      if (hit) { ci = (ci + 1) % colors.length; dvd.style.boxShadow = '10px 10px 0 ' + colors[ci]; }
      dvd.style.left = x + 'px'; dvd.style.top = y + 'px';
      var d = new Date();
      clock.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' · the desk is idle';
      saverRaf = requestAnimationFrame(tick);
    }
    tick();
  }
  function pokeIdle() {
    if (saver) killSaver();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startSaver, IDLE_MS);
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) {
    addEventListener(ev, pokeIdle, { passive: true });
  });
  document.addEventListener('visibilitychange', pokeIdle);
  pokeIdle();

  /* ================= COMMAND PALETTE ================= */
  var ENTRIES = [
    { l: 'The working file (home)', k: 'Page', h: '/', q: 'home index start desk' },
    { l: 'Case files', k: 'Section', h: '/#case-files', q: 'projects wit weinsureshit radio school tools local' },
    { l: 'Build map', k: 'Section', h: '/#map', q: 'career resume timeline history' },
    { l: 'Contact / start a conversation', k: 'Section', h: '/#contact', q: 'email message form talk' },
    { l: 'Thoughts', k: 'Page', h: '/thoughts/', q: 'essays field logs writing blog' },
    { l: 'Field log 01: insurance is emotional', k: 'Essay', h: '/thoughts/insurance-is-emotional.html', q: 'essay read' },
    { l: 'The idea folder', k: 'Page', h: '/ideas.html', q: 'ric rail connector local community' },
    { l: 'RIC Rail Connector packet (PDF)', k: 'File', h: '/assets/ric-rail-connector-intro-packet.pdf', q: 'rail train airport pdf' },
    { l: 'Bio', k: 'Page', h: '/bio.html', q: 'about logan press media' },
    { l: 'LW-FM · desk radio', k: 'Page', h: '/fm.html', q: 'radio music lofi rain sound' },
    { l: 'The bottom drawer', k: '???', h: '/drawer.html', q: 'secret hunt lost drawer' },
    { l: 'Working File · live build log', k: 'Page', h: '/working-file/', q: 'build log now updates' },
    { l: 'Playbooks', k: 'Page', h: '/playbooks/', q: 'guides how to systems' },
    { l: 'Failure files', k: 'Page', h: '/failures/', q: 'mistakes lessons post mortem' },
    { l: 'Office hours', k: 'Page', h: '/office-hours/', q: 'ask questions help' },
    { l: 'Build in public · challenge', k: 'Page', h: '/build-in-public/', q: 'challenge public' },
    { l: 'Case study: Wease Financial', k: 'Page', h: '/case-studies/wease-financial.html', q: 'agency growth story allstate' },
    { l: 'Agency growth simulator', k: 'Tool', h: '/tools/agency-growth-simulator.html', q: 'calculator simulate' },
    { l: 'Insurance myth machine', k: 'Tool', h: '/tools/insurance-myth-machine.html', q: 'myths quiz' },
    { l: 'Toggle the desk lamp', k: 'Action', a: 'lamp', q: 'dark mode light night lights theme' }
  ];
  var pal = null, palSel = 0, palItems = [];

  function runEntry(e) {
    if (e.a === 'lamp') {
      var dark = document.documentElement.classList.toggle('dark');
      store.set('lw-theme', dark ? 'dark' : 'light');
      closePal();
      return;
    }
    location.href = e.h;
  }
  function closePal() { if (pal) { pal.remove(); pal = null; } }
  function renderList(input, list) {
    var q = input.value.trim().toLowerCase();
    var match = ENTRIES.filter(function (e) {
      return !q || (e.l + ' ' + e.k + ' ' + (e.q || '')).toLowerCase().indexOf(q) !== -1;
    });
    list.innerHTML = '';
    palItems = [];
    if (!match.length) {
      var none = document.createElement('div');
      none.className = 'lw-pal-none';
      none.textContent = 'nothing filed under that';
      list.appendChild(none);
      return;
    }
    palSel = Math.min(palSel, match.length - 1);
    match.forEach(function (e, i) {
      var el = document.createElement('a');
      el.className = 'lw-pal-item' + (i === palSel ? ' sel' : '');
      el.href = e.h || '#';
      el.innerHTML = '<b></b><span></span>';
      el.firstChild.textContent = e.l;
      el.lastChild.textContent = e.k;
      el.addEventListener('click', function (ev) { ev.preventDefault(); runEntry(e); });
      list.appendChild(el);
      palItems.push({ el: el, entry: e });
    });
  }
  function openPal() {
    if (pal) return;
    palSel = 0;
    pal = document.createElement('div');
    pal.className = 'lw-pal';
    pal.innerHTML = '<div class="lw-pal-card" role="dialog" aria-label="Site palette"><input type="text" placeholder="Where to? Type to search the desk…" aria-label="Search the site" /><div class="lw-pal-list"></div><div class="lw-pal-foot"><span>↑↓ move</span><span>↵ open</span><span>esc close</span></div></div>';
    document.body.appendChild(pal);
    var input = pal.querySelector('input'), list = pal.querySelector('.lw-pal-list');
    renderList(input, list);
    input.addEventListener('input', function () { palSel = 0; renderList(input, list); });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); palSel = Math.min(palSel + 1, palItems.length - 1); renderList(input, list); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); palSel = Math.max(palSel - 1, 0); renderList(input, list); }
      else if (ev.key === 'Enter') { ev.preventDefault(); if (palItems[palSel]) runEntry(palItems[palSel].entry); }
      else if (ev.key === 'Escape') { closePal(); }
    });
    pal.addEventListener('pointerdown', function (ev) { if (ev.target === pal) closePal(); });
    input.focus();
  }
  addEventListener('keydown', function (ev) {
    var tag = (ev.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || ev.target.isContentEditable;
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); pal ? closePal() : openPal(); }
    else if (ev.key === '/' && !typing && !pal) { ev.preventDefault(); openPal(); }
    else if (ev.key === 'Escape' && pal) { closePal(); }
  });

  /* ================= THE DESK CAT ================= */
  var cat = document.createElement('button');
  cat.className = 'lw-cat';
  cat.type = 'button';
  var catName = function () { return store.get('lw-cat-name', ''); };
  var petCount = function () { return parseInt(store.get('lw-cat-pets', '0'), 10) || 0; };
  function catLabel() {
    return 'The desk cat' + (catName() ? ' (' + catName() + ')' : '') + ' — click to pet';
  }
  cat.setAttribute('aria-label', catLabel());
  cat.title = 'pet the cat';
  /* sleeping/sitting cat silhouette with separate eye dots that glow after hours */
  cat.innerHTML = '<svg width="52" height="34" viewBox="0 0 52 34" aria-hidden="true">' +
    '<path fill="currentColor" d="M8 33c-3.8 0-6.4-2.2-6.4-5.6 0-4.8 4.2-7.6 8.8-8.2.5-4.4 3.4-8.2 8-8.2 1.6 0 3 .4 4.3 1.2C24.6 7.6 28.4 5 33 5c.6-1.6 1.6-3.4 2.7-4.4.5-.4 1.2-.1 1.3.5l.6 4.2c1 .3 2 .8 2.8 1.5l4-1.6c.6-.2 1.2.3 1 .9l-1.2 4.2c1.1 1.7 1.8 3.9 1.8 6.4 0 8.5-6.4 11.8-13.9 12.9-2 .3-4.6.4-7.1.4H8z"/>' +
    '<circle class="lw-eyes" cx="35" cy="13" r="1.6"/><circle class="lw-eyes" cx="42" cy="13" r="1.6"/>' +
    '<path fill="currentColor" d="M46 20c2.8-.4 5.4-.2 5.9.8.4.8-1.4 1.4-3.2 1.4z"/>' +
    '</svg>';
  document.body.appendChild(cat);

  function bubble(text) {
    var r = cat.getBoundingClientRect();
    var b = document.createElement('div');
    b.className = 'lw-cat-bubble';
    b.textContent = text;
    b.style.right = Math.max(8, innerWidth - r.right) + 'px';
    b.style.bottom = (innerHeight - r.top + 8) + 'px';
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 2500);
  }
  function hearts() {
    var r = cat.getBoundingClientRect();
    for (var i = 0; i < 3; i++) {
      (function (i) {
        setTimeout(function () {
          var h = document.createElement('span');
          h.className = 'lw-heart';
          h.textContent = '♥';
          h.style.left = (r.left + 8 + i * 14) + 'px';
          h.style.top = (r.top - 4) + 'px';
          document.body.appendChild(h);
          setTimeout(function () { h.remove(); }, 1500);
        }, i * 140);
      })(i);
    }
  }
  cat.addEventListener('click', function () {
    var n = petCount() + 1;
    store.set('lw-cat-pets', String(n));
    hearts();
    var name = catName();
    if (n === 1) bubble('prrr. (the cat has decided you are acceptable)');
    else if (n === 10) bubble((name || 'the cat') + ' trusts you now. mostly.');
    else if (n === 50) bubble((name || 'the cat') + ' would take a bullet for you. a small one.');
    else bubble('prrr' + (name ? ' — ' + name : ''));
  });
  /* wander: occasionally pick a new spot along the bottom; livelier after hours */
  function wander() {
    if (!reduced) {
      var dark = document.documentElement.classList.contains('dark');
      if (Math.random() < (dark ? .75 : .4)) {
        var to = 5 + Math.random() * 80;
        var cur = parseFloat(cat.style.right) || 11;
        cat.classList.toggle('flip', to > cur);
        cat.style.right = to + '%';
      }
    }
    setTimeout(wander, 14000 + Math.random() * 22000);
  }
  setTimeout(wander, 9000);

  window.lwDesk = {
    saver: startSaver,
    palette: openPal,
    cat: {
      name: catName,
      setName: function (n) { store.set('lw-cat-name', n); cat.setAttribute('aria-label', catLabel()); },
      pets: petCount
    }
  };
})();
