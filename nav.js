/* Main menu. Phones/tablets (<= 960px): the three-line button opens a panel under the header (C16: GAB-style, links
   centered). While it is open the page does not scroll; the X, Esc, a tap on the empty part of the panel or a tap
   outside the header closes it. */
(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (!header || !toggle || !nav) return;
  var mq = window.matchMedia("(max-width: 960px)");

  function setOpen(open) {
    if (open) document.documentElement.style.setProperty("--menu-top", Math.max(0, header.getBoundingClientRect().bottom) + "px");
    header.classList.toggle("is-nav-open", open);
    document.documentElement.classList.toggle("nav-lock", open && mq.matches);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.setAttribute("aria-label", "Open menu");

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("is-nav-open"));
  });

  nav.addEventListener("click", function (e) {
    if (!mq.matches) return;
    if (e.target.closest("a") || !e.target.closest("li")) setOpen(false);   /* a link, or the empty part of the panel */
  });

  document.addEventListener("click", function (e) {
    if (header.classList.contains("is-nav-open") && !header.contains(e.target)) setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (!mq.matches) setOpen(false);
    else if (header.classList.contains("is-nav-open")) document.documentElement.style.setProperty("--menu-top", Math.max(0, header.getBoundingClientRect().bottom) + "px");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("is-nav-open")) { setOpen(false); toggle.focus(); }
  });
})();
