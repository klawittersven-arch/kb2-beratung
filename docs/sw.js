/* Service Worker: speichert alle Dateien beim ersten Aufruf, damit Übungen und
 * Spiel auch bei schlechtem oder kurz unterbrochenem WLAN funktionieren.
 *
 * Strategie: zuerst das Netz fragen (mit Zeitlimit), sonst die gespeicherte Fassung.
 * So erscheinen Änderungen im Repository sofort, sobald Netz da ist.
 * Nach größeren Änderungen VERSION erhöhen – dann wird der Speicher erneuert. */
'use strict';

var VERSION = 'v11';
var CACHE = 'kb2-ab12-' + VERSION;
var ZEITLIMIT_MS = 4000;

var DATEIEN = [
  './',
  'index.html',
  'aa1.html',
  'aa2.html',
  'spiel.html',
  'style.css',
  'spiel.css',
  'inhalte.js',
  'config.js',
  'gemeinsam.js',
  'app.js',
  'verbindung.js',
  'pixel.js',
  'spiel.js',
  'vendor/peerjs.min.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(DATEIEN.map(function (d) { return new Request(d, { cache: 'reload' }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.filter(function (n) {
        return n.indexOf('kb2-ab12-') === 0 && n !== CACHE;
      }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fremde Adressen (PeerJS) nicht anfassen

  e.respondWith(new Promise(function (fertig) {
    var erledigt = false;
    function ausCache() {
      return caches.match(req, { ignoreSearch: true }).then(function (r) {
        return r || (req.mode === 'navigate' ? caches.match('index.html') : undefined);
      });
    }
    var timer = setTimeout(function () {
      ausCache().then(function (r) {
        if (r && !erledigt) { erledigt = true; fertig(r); }
      });
    }, ZEITLIMIT_MS);

    fetch(req, { cache: 'no-cache' }).then(function (antwort) {
      if (antwort && antwort.ok && antwort.type === 'basic') {
        var kopie = antwort.clone();
        caches.open(CACHE).then(function (c) {
          // Adressen mit ?… (z. B. ?transport=test) ohne Parameter speichern
          return c.put(url.search ? new Request(url.origin + url.pathname) : req, kopie);
        });
      }
      clearTimeout(timer);
      if (!erledigt) { erledigt = true; fertig(antwort); }
    }).catch(function () {
      clearTimeout(timer);
      ausCache().then(function (r) {
        if (erledigt) return;
        erledigt = true;
        fertig(r || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
      });
    });
  }));
});
