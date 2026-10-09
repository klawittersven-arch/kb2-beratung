/* Offline-Fähigkeit, Datenschutz (externe Adressen, Cookies) und Dateigrößen. */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };

  /* ---------- Offline ---------- */
  console.log('\n== Offline nach dem ersten Laden');
  {
    const ctx = await browser.newContext(H.MOBIL);
    await H.handyVorbereiten(ctx, { raum: '4821' });
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'offline');
    await p.goto(basis + 'index.html');
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.reload();
    const gesteuert = await p.evaluate(() => !!navigator.serviceWorker.controller);
    const cacheName = await p.evaluate(async () => (await caches.keys()).join(','));
    H.pruefe(gesteuert && /kb2-ab12-v\d+/.test(cacheName), `Service Worker aktiv, Cache „${cacheName}“ mit Versionsnummer`);
    await ctx.setOffline(true);
    for (const seite of ['index.html', 'aa1.html', 'aa2.html', 'spiel.html?transport=test', 'spiel.html']) {
      await p.goto(basis + seite);
      const ok = await p.evaluate(() => document.body.innerText.length > 40 && !document.body.innerText.includes('Offline'));
      H.pruefe(ok, `Offline: ${seite} lädt aus dem Speicher`);
    }
    await p.goto(basis + 'aa1.html');
    for (const [n, k] of await p.evaluate(() => INHALTE.aa1.karten.map((x) => [x.nummer, [].concat(x.richtig)[0]]))) await p.click(`#karte-${n} [data-kuerzel=${k}]`);
    H.pruefe(await p.locator('.merksatz').isVisible(), 'Offline: Übung lässt sich vollständig lösen');
    await p.goto(basis + 'spiel.html?transport=test');
    await p.click('#knopf-los');
    const ende = await H.bis(() => p.evaluate(() => PflegeSprint.zustand().bildschirm === 'ende'), { zeit: 30000 });
    const laeufe = await p.evaluate(() => JSON.parse(localStorage.getItem('kb2ab12_laeufe')));
    H.pruefe(ende && laeufe && laeufe.length === 1, 'Offline: Spiel läuft, Ergebnis wird zum Nachreichen gespeichert', laeufe);
    const status = await p.locator('[data-status]').innerText();
    H.pruefe(status.includes('wird automatisch übertragen'), 'Offline: Statuszeile ohne Fehlermeldung', status);
    await ctx.setOffline(false);
    await ctx.close();
    console.log('  (Das Nachreichen nach Rückkehr der Verbindung prüft tests/rangliste.test.js, Szenario d.)');
  }

  /* ---------- Echter PeerJS-Betrieb: welche Adressen werden angefragt? ---------- */
  console.log('\n== Externe Adressen im Echtbetrieb (PeerJS)');
  {
    const ctx = await browser.newContext(H.MOBIL);
    await H.handyVorbereiten(ctx, { raum: '4821' });
    const fremd = new Set();
    ctx.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') fremd.add(u.protocol + '//' + u.hostname); });
    ctx.on('websocket', (w) => { const u = new URL(w.url()); fremd.add(u.protocol + '//' + u.hostname); });
    const p = await ctx.newPage();
    await p.goto(basis + 'spiel.html');
    const L = await ctx.newPage();
    await L.goto(basis + 'rangliste.html?raum=4821');
    for (const s of ['index.html', 'aa1.html', 'aa2.html']) { const q = await ctx.newPage(); await q.goto(basis + s); }
    await H.warte(12000);
    const liste = [...fremd];
    console.log('  angefragt: ' + (liste.join(', ') || '(keine)'));
    H.pruefe(liste.every((h) => /^(https|wss):\/\/0\.peerjs\.com$/.test(h)), 'Nur der PeerJS-Vermittlungsdienst (0.peerjs.com) wird angefragt', liste);
    const kekse = await ctx.cookies();
    H.pruefe(kekse.length === 0, 'Keine Cookies', kekse);
    await ctx.close();
  }

  /* ---------- Quelltext: keine externen Ressourcen ---------- */
  console.log('\n== Quelltext und Dateigrößen');
  const dateien = fs.readdirSync(H.DOCS, { recursive: true }).filter((d) => fs.statSync(path.join(H.DOCS, d)).isFile());
  const eigene = dateien.filter((d) => !d.startsWith('vendor'));
  const extern = [];
  for (const d of eigene.filter((x) => /\.(html|css|js)$/.test(x))) {
    const text = fs.readFileSync(path.join(H.DOCS, d), 'utf8');
    for (const m of text.matchAll(/(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+|url\(\s*["']?https?:|@import|https?:\/\/(?!peerjs\.com)[a-z0-9.-]+\.[a-z]{2,}/gi)) extern.push(d + ': ' + m[0]);
  }
  H.pruefe(extern.length === 0, 'Keine externen Skripte, Schriften, Bilder oder Stile im eigenen Code', extern);
  H.pruefe(!dateien.some((d) => /\.(png|jpe?g|gif|svg|webp|mp3|wav|ogg|woff2?|ttf|otf)$/i.test(d)), 'Keine Bild-, Ton- oder Schriftdateien im Ordner docs/');
  H.pruefe(dateien.includes('.nojekyll'), 'docs/.nojekyll vorhanden');
  const groesse = (liste) => liste.reduce((s, d) => s + fs.statSync(path.join(H.DOCS, d)).size, 0);
  const spielSeite = ['spiel.html', 'spiel.css', 'inhalte.js', 'config.js', 'gemeinsam.js', 'verbindung.js', 'pixel.js', 'spiel.js'];
  const kbSpiel = groesse(spielSeite) / 1024;
  const kbAlle = groesse(dateien) / 1024;
  console.log(`  Spielseite ohne PeerJS: ${kbSpiel.toFixed(1)} KB; alle Dateien in docs/: ${kbAlle.toFixed(1)} KB (PeerJS ${(fs.statSync(path.join(H.DOCS, 'vendor/peerjs.min.js')).size / 1024).toFixed(1)} KB)`);
  H.pruefe(kbSpiel < 150, 'Spielseite inkl. Code und Grafiken (ohne PeerJS) unter 150 KB');
  H.pruefe(kbAlle < 400, 'Alles zusammen unter 400 KB');

  console.log('\n== Konsole');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
