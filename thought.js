/* Thought for the day (Home): one of Swami's words already quoted on this site, chosen by date.
   "Another thought" shows the next one. Quotes come from thoughts-data.js. */
(function () {
  var box = document.querySelector("[data-thought]");
  var T = window.R7_THOUGHTS;
  if (!box || !T || !T.length) return;
  var text = box.querySelector(".thought-text"), cite = box.querySelector(".thought-cite"), btn = box.querySelector(".thought-next");
  var start = new Date(new Date().getFullYear(), 0, 0), day = Math.floor((new Date() - start) / 864e5);
  var i = day % T.length;
  function show(k, animate) {
    var q = T[k];
    function put() { text.textContent = q.text; cite.textContent = q.cite; box.classList.remove("is-changing"); }
    if (animate) { box.classList.add("is-changing"); setTimeout(put, 380); } else put();
  }
  show(i, false);
  if (btn) btn.addEventListener("click", function () { i = (i + 1) % T.length; show(i, true); });
})();
