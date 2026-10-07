/* Milestone photo slider (about-baba): clickable year row, arrows, keys, and swipe. */
(function () {
  document.querySelectorAll("[data-tla]").forEach(function (box) {
    var years = box.querySelectorAll(".tla-year");
    var track = box.querySelector(".tla-track");
    var stage = box.querySelector(".tla-stage");
    var slides = box.querySelectorAll(".tla-slide");
    var prev = box.querySelector(".tla-prev");
    var next = box.querySelector(".tla-next");
    var bar = box.querySelector(".tla-progress span");
    var row = box.querySelector(".tla-years");
    var cur = 0;

    function fit() { stage.style.height = slides[cur].offsetHeight + "px"; }
    function go(n) {
      if (n < 0 || n >= slides.length) return;
      cur = n;
      track.style.transform = "translateX(" + (-100 * cur) + "%)";
      years.forEach(function (b, k) {
        b.classList.toggle("is-on", k === cur);
        b.setAttribute("aria-selected", k === cur ? "true" : "false");
      });
      slides.forEach(function (s, k) { s.setAttribute("aria-hidden", k === cur ? "false" : "true"); });
      prev.disabled = cur === 0;
      next.disabled = cur === slides.length - 1;
      bar.style.width = ((cur + 1) / slides.length * 100) + "%";
      fit();
      var b = years[cur];
      if (row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: b.offsetLeft - row.clientWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
      }
    }
    years.forEach(function (b, k) { b.addEventListener("click", function () { go(k); }); });
    prev.addEventListener("click", function () { go(cur - 1); });
    next.addEventListener("click", function () { go(cur + 1); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });

    var x0 = null, y0 = null;
    stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);
    var start = 0;
    var want = (location.search.match(/[?&]year=(\d{4})/) || [])[1];
    if (want) years.forEach(function (b, k) { if (b.textContent.trim() === want) start = k; });
    go(start);
  });
})();
