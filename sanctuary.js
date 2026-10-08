/* C15 Sanctuary pages: pop-ups (<dialog class="rd-dialog">) that hold the full resource panels.
   - [data-dialog="id"] opens one; the close button, the backdrop and Esc close it; the page behind does not scroll.
   - On phones the pop-up is a bottom sheet (styles.css).
   - A #link to an element inside a pop-up opens the pop-up there (tabs.js asks R7Dlg.open on tabbed pages;
     pages without a tab bar are handled here). Closing does not change the address. */
(function () {
  var root = document.documentElement;
  function openTo(el) {
    for (var p = el; p; p = p.parentElement) if (p.tagName === "DETAILS" && !p.open) p.open = true;
  }
  function closeAll() {
    Array.prototype.forEach.call(document.querySelectorAll("dialog.rd-dialog[open]"), function (d) { d.close(); });
  }
  function open(d, target) {
    if (!d || !d.showModal) return;
    if (!d.open) { closeAll(); d.showModal(); }
    root.classList.add("rd-lock");
    var body = d.querySelector(".rd-dialog-body");
    if (target && target !== d) {
      openTo(target);
      setTimeout(function () { if (body) body.scrollTop = Math.max(0, target.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12); }, 60);
    } else if (body) body.scrollTop = 0;
  }
  window.R7Dlg = { open: open, closeAll: closeAll };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-dialog]");
    if (b) { e.preventDefault(); open(document.getElementById(b.getAttribute("data-dialog"))); return; }
    if (e.target.closest && e.target.closest("[data-close]")) { var dd = e.target.closest("dialog"); if (dd) dd.close(); return; }
    if (e.target.tagName === "DIALOG" && e.target.classList.contains("rd-dialog")) {
      var r = e.target.getBoundingClientRect();   /* only a click outside the box (on the backdrop) closes */
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
    /* a #link inside a pop-up to something outside it: close the pop-up first */
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && a.closest("dialog.rd-dialog")) {
      var t = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
      if (t && !a.closest("dialog").contains(t)) a.closest("dialog").close();
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll("dialog.rd-dialog"), function (d) {
    d.addEventListener("close", function () { if (!document.querySelector("dialog.rd-dialog[open]")) root.classList.remove("rd-lock"); });
    /* C23: a #link to an element inside the pop-up made the browser scroll the pop-up box itself, so its title and Close button went out of view.
       Only the body scrolls; keep the box at the top. */
    d.addEventListener("scroll", function () { if (d.scrollTop) d.scrollTop = 0; });
  });
  if (!document.querySelector("[data-tabbar]")) {
    var fromHash = function () {
      var el = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      var d = el && el.closest("dialog.rd-dialog");
      if (d) open(d, el); else if (el) closeAll();
    };
    window.addEventListener("hashchange", fromHash);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fromHash); else fromHash();
  }
})();

/* C21 (Raj, Oct 8): layout A topic groups open and close like an accordion. One group open per list; the first is open at the start.
   A #link to a group (e.g. programs.html#p-dev-altar) opens that group. Without this script every group stays open. */
(function () {
  document.documentElement.classList.add("a-acc-ready");
  function set(g, open, instant) {
    if (instant) g.classList.add("a-instant");
    g.classList.toggle("a-open", open);
    var b = g.querySelector(".a-head"); if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    if (instant) { void g.offsetHeight; g.classList.remove("a-instant"); }
  }
  function sibs(g) { return Array.prototype.filter.call(g.parentNode.children, function (x) { return x.classList && x.classList.contains("a-group"); }); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".a-head"); if (!b) return;
    var g = b.closest(".a-group"), was = g.classList.contains("a-open");
    var top = b.getBoundingClientRect().top;
    sibs(g).forEach(function (x) { if (x !== g && x.classList.contains("a-open")) set(x, false, true); });
    var shift = b.getBoundingClientRect().top - top;   /* a group above closed: keep the clicked header where it was */
    if (shift) window.scrollBy(0, shift);
    set(g, !was, false);
  });
  function fromHash() {
    var id = location.hash.length > 1 && decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var el = document.getElementById(id); var g = el && el.closest && el.closest(".a-group"); if (!g) return;
    sibs(g).forEach(function (x) { set(x, x === g, true); });
  }
  fromHash(); window.addEventListener("hashchange", fromHash);
})();
