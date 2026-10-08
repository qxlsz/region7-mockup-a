/* In-page section tabs (About, Programs, Initiatives, Media).
   - Tabs are links to #hash, so they are linkable and the Back button works (hashchange).
   - role=tablist/tab/tabpanel, roving tabindex, Left/Right/Home/End keys.
   - After a panel is shown, a resize event lets sliders (timeline.js) measure again. */
(function () {
  var bar = document.querySelector("[data-tabbar]");
  if (!bar) return;
  var tabs = Array.prototype.slice.call(bar.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  var hashes = tabs.map(function (t) { return t.getAttribute("href").slice(1); });
  var header = document.querySelector(".site-header");
  var fromClick = false;

  function setHeaderVar() {
    if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  function show(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
    var inner = bar.querySelector(".tabbar-inner");
    if (inner && inner.scrollWidth > inner.clientWidth) {
      inner.scrollTo({ left: tabs[i].offsetLeft - inner.clientWidth / 2 + tabs[i].offsetWidth / 2, behavior: "smooth" });
    }
    window.dispatchEvent(new Event("resize"));
    if (fromClick) {
      var top = bar.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: "auto" });
      fromClick = false;
    }
  }
  function fromHash() {
    var h = location.hash.slice(1);
    var i = hashes.indexOf(h);
    show(i < 0 ? 0 : i, false);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      if (location.hash.slice(1) === hashes[i]) { e.preventDefault(); return; }
      fromClick = true;            /* default action sets the hash; hashchange shows the panel */
    });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = tabs.length - 1;
      if (e.key === " ") { e.preventDefault(); t.click(); return; }
      if (n === null) return;
      e.preventDefault();
      fromClick = true;
      history.pushState(null, "", "#" + hashes[n]);
      show(n, true);
    });
  });

  window.addEventListener("hashchange", fromHash);
  window.addEventListener("popstate", fromHash);
  window.addEventListener("resize", setHeaderVar);
  setHeaderVar();
  fromHash();
})();
