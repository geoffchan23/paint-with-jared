/* ==========================================================================
   Jared Augustin — site behaviour
   Renders the mosaic, builds the detail page, and runs the subtle motion.
   ========================================================================== */

(function () {
  "use strict";

  const arrow = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

  /* --- small helpers ----------------------------------------------------- */
  const byId = (id) => document.getElementById(id);
  const works = Array.isArray(window.ARTWORKS) ? window.ARTWORKS : [];
  const findWork = (id) => works.find((w) => w.id === id);

  /* --- page-load fade + footer year + header scroll state ---------------- */
  function chrome() {
    requestAnimationFrame(() => document.body.classList.add("ready"));

    const yr = byId("year");
    if (yr) yr.textContent = new Date().getFullYear();

    const header = byId("header");
    if (header) {
      const onScroll = () =>
        header.classList.toggle("scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  /* --- scroll reveal ----------------------------------------------------- */
  function revealOnScroll(nodes, stagger) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = stagger ? (Number(el.dataset.idx || 0) % 8) * 70 : 0;
          setTimeout(() => el.classList.add("in-view"), delay);
          obs.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
  }

  /* --- homepage gallery wall --------------------------------------------- */
  let wallTiles = []; // flat list of tile elements, kept across re-layouts

  /* The homepage has two layouts: the justified "Gallery" wall and a
     "True scale" wall where every piece is sized by its real-world inches.
     The choice lives in the URL (?view=) so it can be shared, and is
     remembered in localStorage. */
  const VIEW_KEY = "pwj-view";
  let viewMode = resolveView(); // "gallery" | "scale"

  function resolveView() {
    const u = new URLSearchParams(window.location.search).get("view");
    if (u === "scale" || u === "gallery") return u; // a shared link wins
    try {
      return localStorage.getItem(VIEW_KEY) === "scale" ? "scale" : "gallery";
    } catch (e) {
      return "gallery";
    }
  }

  function buildMosaic() {
    const mosaic = byId("mosaic");
    if (!mosaic) return;

    const loading = byId("loading");
    if (loading) loading.remove();

    if (!works.length) {
      mosaic.innerHTML = `<p class="notice">No works to show yet.</p>`;
      return;
    }

    wallTiles = works.map((w, i) => {
      const tile = document.createElement("a");
      tile.className = "tile";
      tile.href = `piece.html?id=${encodeURIComponent(w.id)}`;
      tile.dataset.idx = i;
      tile.dataset.aspect = (w.width / w.height).toFixed(4); // w / h
      tile.dataset.realw = w.realW || w.width; // real-world inches (scale view)
      tile.dataset.realh = w.realH || w.height;
      tile.setAttribute("aria-label", `${w.title} — learn more`);

      tile.innerHTML = `
        <span class="tile__media">
          <img class="tile__img" src="${w.thumb}" alt="${escapeHtml(
        w.title
      )}" loading="lazy" decoding="async" />
          <span class="tile__overlay">
            <span class="tile__meta">${escapeHtml(w.medium)}</span>
            <span class="tile__title">${escapeHtml(w.title)}</span>
            <span class="tile__cta">Learn more ${arrow}</span>
          </span>
        </span>`;

      return tile;
    });

    buildToggle(mosaic);
    mosaic.classList.toggle("mosaic--scale", viewMode === "scale");
    renderLayout();
    revealOnScroll(wallTiles, true);

    // Re-run once the page has settled: the first layout is computed before a
    // vertical scrollbar appears, and that scrollbar then narrows the content
    // width — recompute so the scale wall never clips at the right edge.
    requestAnimationFrame(() => requestAnimationFrame(renderLayout));
    window.addEventListener("load", renderLayout);

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderLayout, 150);
    });
  }

  /* --- view toggle (Gallery  <->  True scale) ---------------------------- */
  function buildToggle(mosaic) {
    const bar = document.createElement("div");
    bar.className = "view-toggle-bar";
    bar.innerHTML = `
      <div class="view-toggle" role="group" aria-label="Gallery layout">
        <button type="button" data-view="gallery">Gallery</button>
        <button type="button" data-view="scale">True scale</button>
      </div>`;
    mosaic.parentNode.insertBefore(bar, mosaic);
    bar.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => setView(b.dataset.view))
    );
    updateToggle();
  }

  function updateToggle() {
    document.querySelectorAll(".view-toggle button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.view === viewMode))
    );
  }

  function setView(mode) {
    if (mode === viewMode || (mode !== "gallery" && mode !== "scale")) return;
    viewMode = mode;
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch (e) {}
    const url = new URL(window.location.href);
    url.searchParams.set("view", mode);
    window.history.replaceState(null, "", url);
    byId("mosaic").classList.toggle("mosaic--scale", mode === "scale");
    updateToggle();
    renderLayout();
    window.scrollTo({ top: 0 });
  }

  function renderLayout() {
    if (viewMode === "scale") layoutScale();
    else layoutWall();
  }

  /* Justified gallery layout: pack tiles into rows and scale each row to
     fill the available width exactly, so edges stay flush and there are no
     holes. Every frame keeps its artwork's aspect ratio; sizes vary because
     each row settles at a different height. The last row stays at the target
     height and is centred rather than stretched. */
  function layoutWall() {
    const mosaic = byId("mosaic");
    if (!mosaic || !wallTiles.length) return;

    // undo any absolute positioning left by the scale (packed) layout
    mosaic.style.height = "";
    wallTiles.forEach((t) => {
      t.style.position = "";
      t.style.left = "";
      t.style.top = "";
    });

    const vw = window.innerWidth;
    const cs = getComputedStyle(mosaic);
    const W =
      mosaic.clientWidth -
      parseFloat(cs.paddingLeft) -
      parseFloat(cs.paddingRight);

    const gap = clampNum(vw * 0.008, 8, 14); // matches CSS gap
    const pad = clampNum(vw * 0.005, 5, 12); // frame mat
    const edge = pad + 1; // mat + 1px border on each side
    const targetH = vw < 560 ? 158 : vw < 900 ? 210 : vw < 1300 ? 248 : 286;

    // group tiles into rows: keep adding until a row at targetH overflows W
    const rows = [];
    let row = [];
    let aspectSum = 0;
    wallTiles.forEach((tile) => {
      const a = parseFloat(tile.dataset.aspect) || 1;
      row.push(tile);
      aspectSum += a;
      const natural = aspectSum * targetH + 2 * edge * row.length + gap * (row.length - 1);
      if (natural >= W) {
        rows.push({ tiles: row, aspectSum, justify: true });
        row = [];
        aspectSum = 0;
      }
    });
    if (row.length) rows.push({ tiles: row, aspectSum, justify: false });

    // avoid stranding a single frame alone on the last row — fold it back
    // into the previous row and justify them together
    if (rows.length > 1 && rows[rows.length - 1].tiles.length === 1) {
      const last = rows.pop();
      const prev = rows[rows.length - 1];
      prev.tiles.push(last.tiles[0]);
      prev.aspectSum += parseFloat(last.tiles[0].dataset.aspect) || 1;
      prev.justify = true;
    }

    // (re)build the row wrappers and size every frame
    const frag = document.createDocumentFragment();
    rows.forEach(({ tiles, aspectSum, justify }) => {
      const n = tiles.length;
      const avail = W - 2 * edge * n - gap * (n - 1);
      const h = justify
        ? avail / aspectSum
        : Math.min(targetH, avail / aspectSum); // never overflow, never upscale

      const rowEl = document.createElement("div");
      rowEl.className = "wall-row";
      rowEl.style.gap = `${gap}px`;
      if (!justify) rowEl.style.marginInline = "auto";

      tiles.forEach((tile) => {
        const a = parseFloat(tile.dataset.aspect) || 1;
        const mediaW = Math.round(a * h);
        const mediaH = Math.round(h);
        tile.style.padding = `${pad}px`;
        const media = tile.querySelector(".tile__media");
        media.style.width = `${mediaW}px`;
        media.style.height = `${mediaH}px`;
        rowEl.appendChild(tile);
      });
      frag.appendChild(rowEl);
    });

    mosaic.replaceChildren(frag);
  }

  /* Real-size wall, perceptually balanced. Literal true-scale makes the 55"
     pieces dwarf the small ones and leaves big empty bands, so we COMPRESS
     the size range: each piece's drawn size scales with (long edge)^SCALE_K.
     SCALE_K = 1 is literal true scale; SCALE_K → 0 makes every piece equal
     (like the gallery). The middle keeps real sizes clearly ordered and felt
     without the awkward extremes. Aspect ratios are never touched. */
  const SCALE_K = 0.6;

  /* Lay the real-sized pieces out in centred rows: each row is filled across
     the width with pieces at their true relative sizes (never scaled to fit),
     then centred horizontally and hung on a common middle line. This fills the
     wall top-down with no big top voids, stays centred, and keeps true scale —
     the only gaps are the honest ones above/below shorter pieces in a row.
     Tiles are absolutely positioned; the container height is set to the pack. */
  function layoutScale() {
    const mosaic = byId("mosaic");
    if (!mosaic || !wallTiles.length) return;

    const vw = window.innerWidth;
    const cs = getComputedStyle(mosaic);
    const W =
      mosaic.clientWidth -
      parseFloat(cs.paddingLeft) -
      parseFloat(cs.paddingRight);

    const longOf = (t) =>
      Math.max(parseFloat(t.dataset.realw) || 1, parseFloat(t.dataset.realh) || 1);

    // the largest piece (by compressed metric) anchors the scale
    let maxMetric = 1;
    wallTiles.forEach((t) => {
      maxMetric = Math.max(maxMetric, Math.pow(longOf(t), SCALE_K));
    });

    // largest piece spans this fraction of the available width — kept modest
    // so two or more pieces share each row (even the big ones, and on phones)
    const frac = vw < 700 ? 0.46 : vw < 1100 ? 0.52 : 0.42;
    const F = (W * frac) / maxMetric; // px per (inch^K) at the top end
    const pad = clampNum(vw * 0.004, 3, 8); // uniform frame mat
    const border = 1;
    const gap = clampNum(vw * 0.014, 12, 30); // breathing room between frames

    // size every piece (true relative size, aspect preserved) → outer boxes
    const boxes = wallTiles.map((tile) => {
      const rw = parseFloat(tile.dataset.realw) || 10;
      const rh = parseFloat(tile.dataset.realh) || 10;
      const long = Math.max(rw, rh);
      const scale = (F * Math.pow(long, SCALE_K)) / long; // px-per-inch, this piece
      const mediaW = Math.max(1, Math.round(rw * scale));
      const mediaH = Math.max(1, Math.round(rh * scale));
      const frame = 2 * (pad + border);
      return { tile, mediaW, mediaH, outerW: mediaW + frame, outerH: mediaH + frame };
    });

    // Each row is anchored by one piece (its height sets the row height) and
    // the leftover width beside it is filled with COLUMNS of smaller pieces
    // stacked to match — pulling small works up next to big ones. True sizes
    // are never changed.
    //
    // The catalogue is dominated by a big cluster of similar-size mid works, so
    // anchoring strictly tallest-first dumps all the drama at the top and
    // leaves uniform rows at the bottom. Instead we set the few large "feature"
    // pieces aside and spread them through the whole wall as anchors (~every
    // other row), so the size contrast reaches the bottom too. `pool` holds
    // everything else and feeds both the remaining anchors and all fillers.
    const sorted = boxes.slice().sort((a, b) => b.outerH - a.outerH);
    const maxOuterH = sorted[0].outerH;
    const features = sorted.filter((b) => b.outerH >= 0.8 * maxOuterH);
    const pool = sorted.filter((b) => b.outerH < 0.8 * maxOuterH);
    const colWidthOf = (col) => Math.max(...col.map((b) => b.outerW));
    const colHeightOf = (col) =>
      col.reduce((s, b, i) => s + b.outerH + (i ? gap : 0), 0);

    // Build one vertical stack. `cap` limits how tall any single piece may be
    // (as a fraction of maxH): the anchor column uses 1 (any piece), while
    // filler columns use a smaller cap so two or three SMALL works stack to
    // match the anchor's height instead of one big neighbour standing alone.
    // Picks the tallest piece allowed each step for a snug fit.
    function buildColumn(maxH, maxW, cap) {
      const limit = maxH * cap;
      const col = [];
      for (;;) {
        const remH = maxH - colHeightOf(col) - (col.length ? gap : 0);
        const lim = Math.min(limit, remH);
        let best = -1;
        for (let i = 0; i < pool.length; i++) {
          const b = pool[i];
          if (b.outerW <= maxW && b.outerH <= lim) {
            if (best < 0 || b.outerH > pool[best].outerH) best = i;
          }
        }
        if (best < 0) break;
        col.push(pool.splice(best, 1)[0]);
      }
      return col;
    }

    // Each filler piece may be at most this fraction of the row height, so a
    // filler column always stacks at least two pieces (pulling small works up
    // beside the big ones). 0.6 → roughly halves the row.
    const FILL_CAP = 0.6;
    const minW = Math.min(...boxes.map((b) => b.outerW));
    // drop a feature anchor roughly every other row, spread over the whole wall
    const FEATURE_EVERY = 2;
    const rows = [];
    let rowIndex = 0;
    while (features.length || pool.length) {
      // pick this row's anchor: a feature on the spread cadence (or once the
      // pool is spent), otherwise the tallest remaining ordinary piece
      const wantFeature =
        features.length && (rowIndex % FEATURE_EVERY === 0 || !pool.length);
      const anchor = wantFeature ? features.shift() : pool.shift();
      if (!anchor) break; // safety: guarantees progress
      const rowH = anchor.outerH;
      const cols = [[anchor]];
      let usedW = colWidthOf(cols[0]);
      while (pool.length) {
        const remW = W - usedW - gap;
        if (remW < minW) break;
        let col = buildColumn(rowH, remW, FILL_CAP); // small works stacked
        if (!col.length) col = buildColumn(rowH, remW, 1); // fallback: same-size
        if (!col.length) break;
        cols.push(col);
        usedW += colWidthOf(col) + gap;
      }
      rows.push(cols);
      rowIndex++;
    }

    // breathing room above the first row and below the last (matches the
    // gallery view's generous top/bottom whitespace)
    const gutter = clampNum(vw * 0.03, 28, 64);

    // place each row: centred horizontally; each column hung on the row midline,
    // each piece centred within its column's width
    let y = gutter;
    rows.forEach((cols) => {
      const rowH = Math.max(...cols.map(colHeightOf));
      const rowW = cols.reduce(
        (s, c, i) => s + colWidthOf(c) + (i ? gap : 0),
        0
      );
      let x = (W - rowW) / 2; // centre the row in the available width
      cols.forEach((col) => {
        const cw = colWidthOf(col);
        let cy = y + (rowH - colHeightOf(col)) / 2; // centre the stack vertically
        col.forEach((b) => {
          b.x = x + (cw - b.outerW) / 2; // centre piece within its column
          b.y = cy;
          cy += b.outerH + gap;
        });
        x += cw + gap;
      });
      y += rowH + gap;
    });

    boxes.forEach((b) => {
      const t = b.tile;
      t.style.position = "absolute";
      t.style.left = `${Math.round(b.x)}px`;
      t.style.top = `${Math.round(b.y)}px`;
      t.style.padding = `${pad}px`;
      const media = t.querySelector(".tile__media");
      media.style.width = `${b.mediaW}px`;
      media.style.height = `${b.mediaH}px`;
    });

    // total height = last row bottom (y already past the final row's gap) plus
    // a generous bottom gutter, so there's clear space above the footer
    mosaic.replaceChildren(...wallTiles);
    mosaic.style.height = `${Math.round(Math.max(0, y - gap) + gutter * 1.6)}px`;
  }

  function clampNum(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  /* --- detail page ------------------------------------------------------- */
  function buildDetail() {
    const detail = byId("detail");
    if (!detail) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const work = id ? findWork(id) : null;
    const loading = byId("loading");
    if (loading) loading.remove();

    if (!work) {
      const msg = document.createElement("p");
      msg.className = "notice";
      msg.textContent = "That work could not be found.";
      detail.appendChild(msg);
      return;
    }

    document.title = `${work.title} — Jared Augustin`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc)
      metaDesc.setAttribute(
        "content",
        work.description || `${work.title} — a work by Jared Augustin.`
      );

    // Build only the spec rows we actually have values for.
    const specs = [
      ["Medium", work.medium],
      ["Year", work.year],
      ["Size", work.size],
    ]
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(
        ([label, value]) => `
          <div class="spec">
            <span class="spec__label">${escapeHtml(label)}</span>
            <span class="spec__value">${escapeHtml(value)}</span>
          </div>`
      )
      .join("");

    const descHtml = work.description
      ? `<p class="detail__desc reveal">${escapeHtml(work.description)}</p>`
      : "";

    const section = document.createElement("div");
    section.className = "detail__grid";
    section.innerHTML = `
      <figure class="detail__figure reveal">
        <img src="${work.image}" alt="${escapeHtml(work.title)}" />
      </figure>
      <div class="detail__info">
        <h1 class="detail__title reveal">${escapeHtml(work.title)}</h1>
        ${descHtml}
        <div class="detail__specs reveal">${specs}</div>
      </div>`;
    detail.appendChild(section);

    // fade the full image in once it has decoded
    const img = section.querySelector(".detail__figure img");
    const showImg = () => img.classList.add("loaded");
    if (img.complete) showImg();
    else img.addEventListener("load", showImg);

    revealOnScroll(Array.from(detail.querySelectorAll(".reveal")), false);
  }

  /* --- about page reveals ------------------------------------------------ */
  function aboutReveals() {
    const nodes = document.querySelectorAll(".about .reveal");
    if (nodes.length) revealOnScroll(Array.from(nodes), true);
  }

  /* --- escape user-facing strings before injecting as HTML --------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* --- boot -------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    chrome();
    buildMosaic();
    buildDetail();
    aboutReveals();
  });
})();
