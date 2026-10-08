/* Click-to-play videos for content carried from the live site: no video player loads until the visitor presses play. */
(function () {
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".vf-play");
    if (!b) return;
    var f = document.createElement("iframe");
    f.src = b.getAttribute("data-embed");
    f.title = b.getAttribute("aria-label") || "Video";
    f.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    f.setAttribute("allowfullscreen", "");
    var wrap = b.parentNode;
    wrap.classList.add("is-playing");
    wrap.replaceChild(f, b);
    f.focus();
  });
})();
