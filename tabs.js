/* In-page section tabs (About, Programs, Initiatives, Media).
   - Tabs are links to #hash, so they are linkable and the Back button works (hashchange).
   - A hash that names an element inside a panel (e.g. #fremont on the Sai Centers tab) opens that panel and scrolls to it.
   - role=tablist/tab/tabpanel, roving tabindex, Left/Right/Home/End keys.
   - After a panel is shown: a resize event (sliders re-measure) and a "tab:shown" event (the map calls invalidateSize). */
(function () {
  var bar = document.querySelector("[data-tabbar]");
  if (!bar) return;
  var tabs = Array.prototype.slice.call(bar.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  var hashes = tabs.map(function (t) { return t.getAttribute("href").slice(1); });
  var header = document.querySelector(".site-header");
  var current = -1;

  function headerH() { return header ? header.offsetHeight : 0; }
  function setHeaderVar() { document.documentElement.style.setProperty("--header-h", headerH() + "px"); }
  function barTop() {  /* natural (un-stuck) position of the tab bar: just below the element before it */
    var prev = bar.previousElementSibling;
    var top = prev ? prev.getBoundingClientRect().bottom : bar.getBoundingClientRect().top;
    return top + window.scrollY - headerH();
  }

  function show(i, opts) {
    opts = opts || {};
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (opts.focus) tabs[i].focus();
    var inner = bar.querySelector(".tabbar-inner");
    if (inner && inner.scrollWidth > inner.clientWidth) {
      inner.scrollTo({ left: tabs[i].offsetLeft - inner.clientWidth / 2 + tabs[i].offsetWidth / 2, behavior: "smooth" });
    }
    var changed = i !== current;
    current = i;
    window.dispatchEvent(new Event("resize"));
    document.dispatchEvent(new CustomEvent("tab:shown", { detail: { hash: hashes[i], panel: panels[i] } }));
    if (opts.target) {
      var y = opts.target.getBoundingClientRect().top + window.scrollY - headerH() - bar.offsetHeight - 16;
      window.scrollTo({ top: y, behavior: "auto" });
    } else if (opts.scroll && changed && window.scrollY > barTop()) {
      window.scrollTo({ top: barTop(), behavior: "auto" });
    }
  }
  function fromHash(scroll) {
    var h = decodeURIComponent(location.hash.slice(1));
    var i = hashes.indexOf(h);
    if (i >= 0) return show(i, { scroll: scroll });
    var el = h && document.getElementById(h);
    if (el) {
      for (var k = 0; k < panels.length; k++) {
        if (panels[k].contains(el)) return show(k, { target: el });
      }
    }
    show(current < 0 ? 0 : current, {});
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      if (location.hash.slice(1) === hashes[i]) { e.preventDefault(); return; }
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
      history.pushState(null, "", "#" + hashes[n]);
      show(n, { focus: true, scroll: true });
    });
  });

  window.addEventListener("hashchange", function () { fromHash(true); });
  window.addEventListener("popstate", function () { fromHash(true); });
  window.addEventListener("resize", setHeaderVar);
  setHeaderVar();
  fromHash(false);
})();
