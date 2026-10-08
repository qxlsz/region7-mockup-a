/* Main menu on phones and tablets (<= 960px), timed like the GAB 2026 site menu (gab-nav.js + Bootstrap collapse):
   - the three-line button opens a rounded card under the header (.35s ease) over a soft dim layer; it closes in .32s ease
     and the X turns back into bars at the same time;
   - the X, Esc, a tap on the dim layer or anywhere outside the header closes it; the page does not scroll while it is open;
   - tapping a link to another page starts the close, fades the page out (180ms, as GAB) and then goes there; the next page
     fades in. Links that open a new tab, downloads, mail/tel links and same-page #links are left alone. */
(function () {
  var TRANSITION_MS = 180;   /* GAB gab-nav.js */
  var body = document.body;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* fade in when we arrived through a faded link (GAB: gab-page-enter) */
  try {
    if (sessionStorage.getItem("r7-fade") === "1") {
      sessionStorage.removeItem("r7-fade");
      body.classList.add("r7-page-enter");
      requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.remove("r7-page-enter"); }); });
    }
  } catch (e) {}
  window.addEventListener("pageshow", function (e) { if (e.persisted) body.classList.remove("r7-page-leave", "r7-page-enter"); });

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var mq = window.matchMedia("(max-width: 960px)");
  var scrim = null;
  if (header && toggle && nav) {
    scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    scrim.setAttribute("aria-hidden", "true");
    body.appendChild(scrim);
    scrim.addEventListener("click", function () { setOpen(false); });
    toggle.setAttribute("aria-label", "Open menu");
  }
  function isOpen() { return !!header && header.classList.contains("is-nav-open"); }
  function setOpen(open) {
    if (!header) return;
    if (open) document.documentElement.style.setProperty("--menu-top", Math.max(0, header.getBoundingClientRect().bottom) + "px");
    header.classList.toggle("is-nav-open", open);
    scrim.classList.toggle("is-on", open && mq.matches);
    document.documentElement.classList.toggle("nav-lock", open && mq.matches);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle) toggle.addEventListener("click", function () { setOpen(!isOpen()); });

  function isPageLink(a) {   /* GAB isInternalNavigation */
    var href = a.getAttribute("href"), target = (a.getAttribute("target") || "").toLowerCase();
    if (!href || href.charAt(0) === "#" || (target && target !== "_self") || a.hasAttribute("download")) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    var d; try { d = new URL(a.href, location.href); } catch (e) { return false; }
    if (d.origin !== location.origin) return false;
    return d.pathname !== location.pathname || d.search !== location.search;
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (a && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented && isPageLink(a) && !reduce) {
      e.preventDefault();
      if (body.classList.contains("r7-page-leave")) return;
      if (isOpen()) setOpen(false);
      body.classList.add("r7-page-leave");
      try { sessionStorage.setItem("r7-fade", "1"); } catch (x) {}
      var to = a.href;
      setTimeout(function () { location.href = to; }, TRANSITION_MS);
      return;
    }
    if (!isOpen()) return;
    if (header.contains(e.target)) {
      if (a && nav.contains(a)) setTimeout(function () { setOpen(false); }, 10);   /* same-page link: close */
      return;
    }
    setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (!header) return;
    if (!mq.matches) setOpen(false);
    else if (isOpen()) document.documentElement.style.setProperty("--menu-top", Math.max(0, header.getBoundingClientRect().bottom) + "px");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) { setOpen(false); toggle.focus(); }
  });
})();
