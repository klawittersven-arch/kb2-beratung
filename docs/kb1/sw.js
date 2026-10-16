/* Service Worker der Lernkarten: speichert alle Dateien beim ersten Aufruf,
 * damit die Karten auch ohne Netz (Bus, Keller, schwaches WLAN) funktionieren.
 *
 * Strategie: zuerst das Netz fragen (mit Zeitlimit), sonst die gespeicherte Fassung.
 * So erscheinen Änderungen an karten.js sofort, sobald ein Handy Netz hat.
 * Nach größeren Änderungen VERSION erhöhen – dann wird der Speicher erneuert. */
'use strict';

var VERSION = 'v1';
var PRAEFIX = 'kb1-lernkarten-';
var CACHE = PRAEFIX + VERSION;
var ZEITLIMIT_MS = 4000;

var DATEIEN = [
  './',
  'index.html',
  'karten.js',
  'lernkarten.js',
  'lernkarten.css',
  'manifest.json',
  'icon-192.png'
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
        return n.indexOf(PRAEFIX) === 0 && n !== CACHE;
      }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(new Promise(function (fertig) {
    var erledigt = false;
    function ausCache() {
      return caches.open(CACHE).then(function (c) {
        return c.match(req, { ignoreSearch: true }).then(function (r) {
          return r || (req.mode === 'navigate' ? c.match('index.html') : undefined);
        });
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
