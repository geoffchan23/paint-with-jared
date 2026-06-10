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
  const ratioPct = (w) => ((w.height / w.width) * 100).toFixed(3);
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

  /* --- homepage mosaic --------------------------------------------------- */
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
      tile.setAttribute("aria-label", `${w.title} — learn more`);

      tile.innerHTML = `
        <div class="tile__media" style="padding-bottom:${ratioPct(w)}%">
          <img class="tile__img" src="${w.thumb}" alt="${escapeHtml(
        w.title
      )}" loading="lazy" decoding="async" />
        </div>
        <div class="tile__overlay">
          <span class="tile__meta">${escapeHtml(w.medium)}</span>
          <span class="tile__title">${escapeHtml(w.title)}</span>
          <span class="tile__cta">Learn more ${arrow}</span>
        </div>`;

      frag.appendChild(tile);
    });

    mosaic.appendChild(frag);
    revealOnScroll(Array.from(mosaic.querySelectorAll(".tile")), true);
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
