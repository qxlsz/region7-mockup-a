/* Sai Centers map: Leaflet + OpenStreetMap tiles (teal-tinted), teal SVG pins, popups with name, address, and links.
   Data: window.R7_CENTERS from centers-data.js (built from tools/centers.json). */
(function () {
  var el = document.getElementById('centers-map');
  if (!el || !window.L || !window.R7_CENTERS) return;
  var C = window.R7_CENTERS;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function pin(kind) {
    var fill = kind === 'Group' ? '#14b8a6' : '#0f766e';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42" aria-hidden="true">' +
      '<path d="M16 41c-1-1.6-13-15.2-13-25A13 13 0 0 1 29 16c0 9.8-12 23.4-13 25z" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>' +
      '<circle cx="16" cy="16" r="5.2" fill="#ffffff"/></svg>';
    return L.divIcon({ className: 'r7-pin', html: svg, iconSize: [32, 42], iconAnchor: [16, 41], popupAnchor: [0, -36] });
  }
  function address(c) {
    for (var i = 0; i < c.info.length; i++) {
      var m = /^Location:\s*(.*)$/i.exec(c.info[i]); if (m) return m[1];
    }
    for (var j = 0; j < c.info.length; j++) if (/(^|[^\d-])\d{2,5}\s+[A-Z0-9]/.test(c.info[j])) return c.info[j];
    return c.info[0] || '';
  }

  var map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, zoomSnap: 0.25 });
  /* OpenStreetMap tiles, softened to the site's teal palette in CSS (.r7-tiles). CARTO now needs an API key. */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, className: 'r7-tiles',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var markers = {}, pts = [];
  C.forEach(function (c) {
    var dir = c.directions ? '<a href="https://www.google.com/maps/dir/?api=1&destination=' + c.lat + ',' + c.lon + '" target="_blank" rel="noopener">Directions</a>' : '';
    var html = '<div class="r7-pop"><span class="r7-pop-kind">' + esc(c.kind) + '</span><strong>' + esc(c.name) + '</strong>' +
      '<p>' + esc(address(c)) + '</p><div class="r7-pop-links"><a href="#' + c.id + '">Times and details</a>' + dir + '</div></div>';
    var m = L.marker([c.lat, c.lon], { icon: pin(c.kind), title: c.name, alt: c.name, riseOnHover: true }).addTo(map).bindPopup(html, { maxWidth: 260 });
    markers[c.id] = m; pts.push([c.lat, c.lon]);
  });
  map.fitBounds(pts, { paddingTopLeft: [40, 60], paddingBottomRight: [40, 24] });
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-show-on-map]');
    if (!b) return;
    var m = markers[b.getAttribute('data-show-on-map')];
    if (!m) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    map.setView(m.getLatLng(), 13, { animate: true });
    m.openPopup();
  });
})();
