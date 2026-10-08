/* In-page section tabs (About, Programs, Initiatives, Media).
   - Tabs are links to #hash, so they are linkable and the Back button works (hashchange).
   - A hash that names an element inside a panel (e.g. #fremont on the Sai Centers tab) opens that panel, opens any closed
     disclosures around it, and scrolls to it. Pages without a tab bar still get the disclosure opening.
   - role=tablist/tab/tabpanel, roving tabindex, Left/Right/Home/End keys.
   - After a panel is shown: a resize event (sliders re-measure) and a "tab:shown" event (the map calls invalidateSize). */
(function () {
  /* open every closed <details> around an element (carried live pages are nested disclosures) */
  function openTo(el) {
    for (var p = el; p; p = p.parentElement) {
      if (p.tagName === "DETAILS" && !p.open) p.open = true;
      if (p.hasAttribute && p.hasAttribute("data-cat-panel") && p.hidden) catPick(p.closest("[data-cats]"), p.id, {});
    }
  }
  /* Category menus (Programs and Initiatives resources): a vertical list of categories that switches the list beside it.
     role=tablist (vertical), roving tabindex, Up/Down/Home/End keys. Links into a hidden category open it (openTo). */
  function catPick(box, panelId, opts) {
    if (!box) return;
    var btns = box.querySelectorAll(".cat-menu .cat");
    Array.prototype.forEach.call(btns, function (b) {
      var on = b.getAttribute("aria-controls") === panelId;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      var pnl = document.getElementById(b.getAttribute("aria-controls"));
      if (pnl) pnl.hidden = !on;
      if (on && opts.focus) b.focus();
      if (on) {
        var m = b.parentElement;
        if (m.scrollWidth > m.clientWidth + 2) m.scrollTo({ left: b.offsetLeft - m.clientWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
      }
    });
    if (opts.scroll) {
      var hd = document.querySelector(".site-header"), tb = document.querySelector("[data-tabbar]");
      var off = (hd ? hd.offsetHeight : 0) + (tb ? tb.offsetHeight : 0) + 12;
      var top = box.getBoundingClientRect().top;
      if (top < off) window.scrollTo({ top: top + window.scrollY - off, behavior: "auto" });
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-cats]"), function (box) {
    var btns = Array.prototype.slice.call(box.querySelectorAll(".cat-menu .cat"));
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { catPick(box, b.getAttribute("aria-controls"), { scroll: true }); });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % btns.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + btns.length) % btns.length;
        if (e.key === "Home") n = 0;
        if (e.key === "End") n = btns.length - 1;
        if (n === null) return;
        e.preventDefault();
        catPick(box, btns[n].getAttribute("aria-controls"), { focus: true });
      });
    });
  });
  var bar = document.querySelector("[data-tabbar]");
  if (!bar) {
    var go = function () {
      var el = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        openTo(el);
        var hd = document.querySelector(".site-header");
        var to = function () { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (hd ? hd.offsetHeight : 0) - 16, behavior: "auto" }); };
        to(); setTimeout(to, 450);
      }
    };
    window.addEventListener("hashchange", go); go();
    return;
  }
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
      openTo(opts.target);
      var tgt = opts.target;
      var go = function () {
        var y = tgt.getBoundingClientRect().top + window.scrollY - headerH() - bar.offsetHeight - 16;
        window.scrollTo({ top: y, behavior: "auto" });
      };
      go();
      setTimeout(go, 450);   /* again once the opened disclosures have finished growing */
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

  /* a link to the hash we are already on does not fire hashchange: handle it here */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href") === location.hash && a.getAttribute("role") !== "tab") { e.preventDefault(); fromHash(true); }
  });
  window.addEventListener("hashchange", function () { fromHash(true); });
  window.addEventListener("popstate", function () { fromHash(true); });
  window.addEventListener("resize", setHeaderVar);
  setHeaderVar();
  fromHash(false);
})();
