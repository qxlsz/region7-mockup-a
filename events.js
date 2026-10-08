/* Region 7 Home (and .js-upcoming lists on other pages): date-driven "News and updates" featured event and "Upcoming events" (next 3).
   Data: window.R7_EVENTS from events-data.js (built from tools/events.json).
   Rules: dated events drop off after their end date; recurring (month/day) events roll to next year.
   Test a date with ?today=YYYY-MM-DD. */
(function () {
  var data = window.R7_EVENTS;
  if (!data) return;
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() {
    var m = /[?&]today=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (m) return parse(m[1]);
    var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function range(s, e) {
    if (+s === +e) return MON[s.getMonth()] + ' ' + s.getDate() + ', ' + s.getFullYear();
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
      return MON[s.getMonth()] + ' ' + s.getDate() + '–' + e.getDate() + ', ' + s.getFullYear();
    return MON[s.getMonth()] + ' ' + s.getDate() + ' to ' + MON[e.getMonth()] + ' ' + e.getDate() + ', ' + e.getFullYear();
  }
  function badgeDay(s, e) { return (+s !== +e && s.getMonth() === e.getMonth()) ? s.getDate() + '–' + e.getDate() : String(s.getDate()); }

  function upcoming(t, n) {
    var list = [];
    (data.dated || []).forEach(function (ev) {
      var s = parse(ev.start), e = parse(ev.end);
      if (e >= t) list.push({ s: s, e: e, ev: ev });
    });
    (data.recurring || []).forEach(function (ev) {
      for (var y = t.getFullYear(); y <= t.getFullYear() + 1; y++) {
        var d = new Date(y, ev.month - 1, ev.day);
        if (d >= t) { list.push({ s: d, e: d, ev: ev }); break; }
      }
    });
    list.sort(function (a, b) { return (a.s - b.s) || (a.ev.title < b.ev.title ? -1 : 1); });
    return list.slice(0, n);
  }

  var t = today();
  var next = upcoming(t, 3);
  if (!next.length) return;
  var featuredId = next[0].ev.id;

  var row = document.getElementById('news-next');
  if (row) {
    var f = next[0], ev = f.ev;
    var link = ev.link
      ? '<a class="btn btn-sm btn-outline" href="' + esc(ev.link) + '" target="_blank" rel="noopener">' + esc(ev.linkLabel || 'Event site') + '</a>'
      : '<a class="btn btn-sm btn-outline" href="events.html">All events</a>';
    row.innerHTML =
      '<div class="event-date"><span class="month">' + MON[f.s.getMonth()] + '</span><span class="day">' + badgeDay(f.s, f.e) + '</span></div>' +
      '<div><p class="next-label">Coming up next · ' + range(f.s, f.e) + '</p><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.text) + '</p></div>' + link;
  }

  var grid = document.getElementById('upcoming-events');
  if (grid) {
    grid.innerHTML = next.map(function (x) {
      var ev = x.ev;
      var link = (ev.link && ev.id !== featuredId)
        ? '<a class="card-link" href="' + esc(ev.link) + '" target="_blank" rel="noopener">' + esc(ev.linkLabel || 'Event site') + '</a>' : '';
      return '<article class="card"><span class="tag">' + range(x.s, x.e) + '</span><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.text) + '</p>' + link + '</article>';
    }).join('');
  }
  var asof = document.getElementById('events-asof');
  if (asof) asof.textContent = MON[t.getMonth()] + ' ' + t.getDate() + ', ' + t.getFullYear();

  /* Other pages (Events, Programs): any .js-upcoming list shows the next data-count events, same rules. */
  Array.prototype.forEach.call(document.querySelectorAll('.js-upcoming'), function (box) {
    var list = upcoming(t, +box.getAttribute('data-count') || 3);
    box.innerHTML = list.map(function (x) {
      var ev = x.ev;
      var link = ev.link ? '<a class="btn btn-sm btn-outline" href="' + esc(ev.link) + '" target="_blank" rel="noopener">' + esc(ev.linkLabel || 'Event site') + '</a>' : '';
      return '<article class="event-row"><div class="event-date"><span class="month">' + MON[x.s.getMonth()] + '</span><span class="day">' + badgeDay(x.s, x.e) + '</span></div>' +
        '<div><p class="next-label">' + range(x.s, x.e) + '</p><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.text) + '</p></div>' + link + '</article>';
    }).join('');
  });
  Array.prototype.forEach.call(document.querySelectorAll('.js-asof'), function (el) {
    el.textContent = MON[t.getMonth()] + ' ' + t.getDate() + ', ' + t.getFullYear();
  });
})();
