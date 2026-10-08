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
