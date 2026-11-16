/* Fotogalerie – zarovnané řady s větší první fotkou + prohlížeč fotek.
   Pracuje se stávajícím HTML (.gallery-grid > a > img). Bez JavaScriptu
   zůstává mřížka a fotka se otevře v nové záložce. */
(function () {
  var grids = document.querySelectorAll('.gallery-grid');
  if (!grids.length) return;

  var GAP = 6;

  function ratio(img) {
    var w = +img.getAttribute('width') || img.naturalWidth;
    var h = +img.getAttribute('height') || img.naturalHeight;
    return w && h ? w / h : 4 / 3;
  }

  function place(a, x, y, w, h) {
    a.style.left = x + 'px';
    a.style.top = y + 'px';
    a.style.width = w + 'px';
    a.style.height = h + 'px';
  }

  /* Rozdělí položky od indexu i do řady šířky W s cílovou výškou H.
     Vrací {end, h, full}. */
  function row(items, i, W, H) {
    var sum = 0, j = i;
    while (j < items.length) {
      sum += items[j].r;
      j++;
      if (sum * H + GAP * (j - i - 1) >= W) {
        return { end: j, h: (W - GAP * (j - i - 1)) / sum, full: true };
      }
    }
    return { end: j, h: H, full: false };
  }

  function layoutRow(items, i, r, x0, y) {
    var x = x0;
    for (var k = i; k < r.end; k++) {
      var w = items[k].r * r.h;
      place(items[k].a, Math.round(x), Math.round(y), Math.round(w), Math.round(r.h));
      x += w + GAP;
    }
  }

  function layout(grid) {
    var W = grid.clientWidth;
    if (!W) return;
    var items = grid._items;
    var mobile = W < 600;
    var H = mobile ? 130 : (items.length <= 4 ? 340 : 210); /* malé galerie větší */
    var y = 0, i = 0;

    /* Větší první fotka (od 5 fotek) */
    if (items.length >= 5) {
      var f = items[0];
      if (mobile) {
        var fh = Math.min(W / f.r, W * 1.2);
        place(f.a, 0, 0, W, Math.round(fh));
        y = fh + GAP;
        i = 1;
      } else {
        var fH = 2 * H + GAP;
        var fW = Math.min(f.r * fH, W * 0.5);
        var avail = W - fW - GAP;
        var r1 = row(items, 1, avail, H);
        var r2 = r1.end < items.length ? row(items, r1.end, avail, H) : null;
        layoutRow(items, 1, r1, fW + GAP, 0);
        var h = r1.h;
        if (r2) { layoutRow(items, r1.end, r2, fW + GAP, r1.h + GAP); h += GAP + r2.h; }
        place(f.a, 0, 0, Math.round(fW), Math.round(h));
        y = h + GAP;
        i = r2 ? r2.end : r1.end;
      }
    }

    while (i < items.length) {
      var r = row(items, i, W, H);
      layoutRow(items, i, r, 0, y);
      y += r.h + GAP;
      i = r.end;
    }
    grid.style.height = Math.max(0, Math.round(y - GAP)) + 'px';
  }

  /* ---------- Prohlížeč ---------- */
  var lb, big, cap, strip, cur = 0, list = [];

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'gl-box';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Prohlížeč fotografií');
    lb.innerHTML =
      '<button class="gl-x" aria-label="Zavřít">✕</button>' +
      '<button class="gl-prev" aria-label="Předchozí fotka">‹</button>' +
      '<button class="gl-next" aria-label="Další fotka">›</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<div class="gl-strip"></div>';
    document.body.appendChild(lb);
    big = lb.querySelector('figure img');
    cap = lb.querySelector('figcaption');
    strip = lb.querySelector('.gl-strip');
    lb.querySelector('.gl-x').onclick = close;
    lb.querySelector('.gl-prev').onclick = function () { show(cur - 1); };
    lb.querySelector('.gl-next').onclick = function () { show(cur + 1); };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1));
      sx = null;
    });
  }

  function open(items, i) {
    if (!lb) buildLightbox();
    list = items;
    strip.innerHTML = '';
    items.forEach(function (it, k) {
      var t = document.createElement('img');
      t.src = it.img.currentSrc || it.img.src;
      t.alt = '';
      t.loading = 'lazy';
      t.onclick = function () { show(k); };
      strip.appendChild(t);
    });
    lb.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    show(i);
    lb.querySelector('.gl-x').focus();
  }

  function show(i) {
    cur = (i + list.length) % list.length;
    var it = list[cur];
    big.src = it.a.getAttribute('href');
    big.alt = it.img.alt;
    var title = (it.img.alt || '').replace(/\s+—\s+foto\s+\d+$/, '');
    cap.innerHTML = '';
    cap.appendChild(document.createTextNode(title + ' · '));
    var b = document.createElement('b');
    b.textContent = cur + 1;
    cap.appendChild(b);
    cap.appendChild(document.createTextNode(' / ' + list.length));
    var thumbs = strip.children;
    for (var k = 0; k < thumbs.length; k++) thumbs[k].classList.toggle('cur', k === cur);
    if (thumbs[cur]) {
      var t = thumbs[cur];
      strip.scrollLeft = t.offsetLeft - strip.clientWidth / 2 + t.offsetWidth / 2;
    }
    new Image().src = list[(cur + 1) % list.length].a.getAttribute('href');
  }

  function close() {
    lb.classList.remove('on');
    document.documentElement.style.overflow = '';
    var a = list[cur] && list[cur].a;
    if (a) a.focus({ preventScroll: true });
  }

  /* ---------- Inicializace ---------- */
  Array.prototype.forEach.call(grids, function (grid) {
    var items = [];
    Array.prototype.forEach.call(grid.querySelectorAll(':scope > a'), function (a) {
      var img = a.querySelector('img');
      if (!img) return;
      a.removeAttribute('style');
      a.classList.remove('plate');
      var it = { a: a, img: img, r: ratio(img) };
      if (!img.getAttribute('width') && !img.complete) {
        img.addEventListener('load', function () { it.r = ratio(img); layout(grid); });
      }
      a.addEventListener('click', function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
        e.preventDefault();
        open(items, items.indexOf(it));
      });
      items.push(it);
    });
    grid._items = items;
    grid.classList.add('gj');
    layout(grid);
    if (window.ResizeObserver) {
      var lastW = grid.clientWidth;
      new ResizeObserver(function () {
        if (grid.clientWidth !== lastW) { lastW = grid.clientWidth; layout(grid); }
      }).observe(grid);
    } else {
      window.addEventListener('resize', function () { layout(grid); });
    }
  });
})();
