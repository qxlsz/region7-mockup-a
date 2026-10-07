/* Small photo slider (about-baba intro photos). */
(function () {
  document.querySelectorAll("[data-photo-slider]").forEach(function (box) {
    var imgs = box.querySelectorAll("img");
    var i = 0;
    function show(n) {
      imgs[i].classList.remove("is-on");
      i = (n + imgs.length) % imgs.length;
      imgs[i].classList.add("is-on");
    }
    box.querySelector(".ps-prev").addEventListener("click", function () { show(i - 1); });
    box.querySelector(".ps-next").addEventListener("click", function () { show(i + 1); });
  });
})();
