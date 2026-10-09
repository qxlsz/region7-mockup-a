/* Region 7 motion, ported from the GAB 2026 site (home-anim-entrance.css): a soft fade-up entrance,
   opacity 0 -> 1 and translateY(18px) -> 0 over about 1.15s, ease-out, staggered.
   - Hero: photo first (0.1s), then kicker, title, ornament, lead (0.25s, 0.38s, 0.45s, 0.55s), as on GAB.
   - Below the hero: the same entrance runs when a block scrolls into view (ribbon heads, cards, photos, lists).
   - Tabs: the newly shown panel fades up again.
   - prefers-reduced-motion: nothing moves; everything is shown at once. Without JavaScript nothing is hidden. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  if (reduce) { root.classList.add("r7-still"); return; }
  root.classList.add("r7-anim");

  /* photos fade in once loaded */
  function fadeImg(img) {
    if (img.dataset.r7img) return;
    img.dataset.r7img = "1";
    if (img.complete && img.naturalWidth) return;
    img.classList.add("r7-img");
    var done = function () { img.classList.add("is-loaded"); };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }
  Array.prototype.forEach.call(document.querySelectorAll("main img"), function (img) { if (!img.closest(".sx-hero, [data-photo-slider], [data-tla]")) fadeImg(img); }   /* C29: slider photos are shown by their own slider, not by the fade */);

  var SEL = [".section-head", ".card", ".event-row", ".split-media", ".cat-groups", ".cats", ".link-card", ".ev-feature",
             ".contact-row .member", ".team-row .member", ".img-grid", ".photo-row", ".quote-panel", ".thought", ".disclosure-list",
             ".center-card2", ".leaflet-frame", ".tla-item", ".doc-card", ".timeline-item", "[data-reveal]"].join(",");
  if (!("IntersectionObserver" in window)) return;
  var items = [];
  Array.prototype.forEach.call(document.querySelectorAll("main " + SEL), function (el) {
    if (el.closest(".hero") || el.closest(".sx-hero") || el.closest("dialog") || el.closest("details:not([open])") || el.parentElement.closest(".r7-reveal")) return;
    el.classList.add("r7-reveal"); items.push(el);
  });
  var io = new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
    batch.forEach(function (el, i) {
      el.style.animationDelay = Math.min(i, 5) * 0.08 + "s";   /* gentle stagger inside one screenful */
      el.classList.add("is-in");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });

  /* tab switch: replay the entrance on the panel that was just shown */
  document.addEventListener("tab:shown", function (e) {
    var p = e.detail && e.detail.panel;
    if (!p) return;
    p.classList.remove("r7-tab-in"); void p.offsetWidth; p.classList.add("r7-tab-in");
    Array.prototype.forEach.call(p.querySelectorAll(".r7-reveal:not(.is-in)"), function (el) { io.unobserve(el); io.observe(el); });
  });
})();
