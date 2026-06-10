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
  const sizeLabel = (w) => `${w.width} × ${w.height} in`;

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
  function buildMosaic() {
    const mosaic = byId("mosaic");
    if (!mosaic) return;

    const loading = byId("loading");
    if (loading) loading.remove();

    if (!works.length) {
      mosaic.innerHTML = `<p class="notice">No works to show yet.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();

    works.forEach((w, i) => {
      const tile = document.createElement("a");
      tile.className = "tile";
      tile.href = `piece.html?id=${encodeURIComponent(w.id)}`;
      tile.dataset.idx = i;
      tile.dataset.ratio = (w.height / w.width).toFixed(4); // h / w
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

      frag.appendChild(tile);
    });

    mosaic.appendChild(frag);
    layoutWall();
    revealOnScroll(Array.from(mosaic.querySelectorAll(".tile")), true);

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutWall, 150);
    });
  }

  /* Size and pack the wall: every frame keeps its artwork's aspect ratio,
     while a seeded size weight gives strong variation between pieces. A
     square base unit (cols == row height) plus dense flow does the packing. */
  function layoutWall() {
    const mosaic = byId("mosaic");
    if (!mosaic) return;
    const tiles = Array.from(mosaic.querySelectorAll(".tile"));
    if (!tiles.length) return;

    const vw = window.innerWidth;
    const cols =
      vw < 560 ? 6 : vw < 780 ? 8 : vw < 1040 ? 10 : vw < 1340 ? 12 : vw < 1640 ? 13 : 14;

    const cs = getComputedStyle(mosaic);
    const gap = parseFloat(cs.gap) || 10;
    const innerW =
      mosaic.clientWidth -
      parseFloat(cs.paddingLeft) -
      parseFloat(cs.paddingRight);
    const unit = (innerW - gap * (cols - 1)) / cols; // square base cell (px)

    mosaic.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    mosaic.style.gridAutoRows = `${unit}px`;

    // Size weights expressed as a fraction of the wall width (the long side
    // of each frame). A spread of values keeps some pieces big, some small.
    const fracs = [0.5, 0.42, 0.36, 0.3, 0.46, 0.33, 0.26, 0.4, 0.29, 0.38];

    tiles.forEach((tile) => {
      const ratio = parseFloat(tile.dataset.ratio) || 1; // h / w
      const seed = Number(tile.dataset.idx) || 0;
      // deterministic but well-scattered pick so neighbours differ
      const h = (seed * 2654435761) >>> 0;
      let long = Math.max(2, Math.round(cols * fracs[h % fracs.length]));
      long = Math.min(long, cols);

      let colSpan, rowSpan;
      if (ratio <= 1) {
        // landscape / square — width is the long side
        colSpan = long;
        rowSpan = Math.max(2, Math.round(long * ratio));
      } else {
        // portrait — height is the long side
        rowSpan = long;
        colSpan = Math.max(2, Math.round(long / ratio));
      }
      colSpan = Math.min(colSpan, cols);

      tile.style.gridColumn = `span ${colSpan}`;
      tile.style.gridRow = `span ${rowSpan}`;
    });
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
    if (metaDesc) metaDesc.setAttribute("content", work.description);

    const section = document.createElement("div");
    section.className = "detail__grid";
    section.innerHTML = `
      <figure class="detail__figure reveal">
        <img src="${work.image}" alt="${escapeHtml(work.title)}" />
      </figure>
      <div class="detail__info">
        <h1 class="detail__title reveal">${escapeHtml(work.title)}</h1>
        <p class="detail__desc reveal">${escapeHtml(work.description)}</p>
        <div class="detail__specs reveal">
          <div class="spec">
            <span class="spec__label">Medium</span>
            <span class="spec__value">${escapeHtml(work.medium)}</span>
          </div>
          <div class="spec">
            <span class="spec__label">Canvas size</span>
            <span class="spec__value">${sizeLabel(work)}</span>
          </div>
        </div>
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
