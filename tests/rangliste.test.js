/* Live-Rangliste: Handys und Laptop in getrennten Browser-Kontexten,
 * verbunden über die Test-Transportschicht (window.TEST_BUS). Szenarien (a)–(h). */
'use strict';
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const bus = H.busErstellen();
  const RAUM = '4821';
  const spielUrl = basis + 'spiel.html?transport=test';
  const ranglisteUrl = basis + `rangliste.html?raum=${RAUM}&transport=test`;

  async function handy(name, figur) {
    const ctx = await browser.newContext(H.MOBIL);
    await bus.kontextAnschliessen(ctx);
    await ctx.addInitScript(() => {
      // Protokoll aller gesendeten Nachrichten (für „kein Netzwerk während des Laufs“)
      const senden = window.TEST_BUS.senden;
      window.__busLog = [];
      window.TEST_BUS.senden = (m) => { window.__busLog.push([Date.now(), m.t]); senden(m); };
    });
    await H.handyVorbereiten(ctx, { spitzname: name, figur, raum: RAUM, test: {} });
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, name);
    await p.goto(spielUrl);
    return { ctx, p };
  }

  async function spielen(p, unverwundbarMs = 0) {
    await H.warte(700);
    await p.evaluate((ms) => { window.__SPIEL_TEST.unverwundbar = ms > 0; }, unverwundbarMs);
    const knopf = (await p.$('#knopf-nochmal')) || (await p.$('#knopf-los'));
    await knopf.click();
    if (unverwundbarMs) {
      await H.warte(unverwundbarMs);
      await p.evaluate(() => { window.__SPIEL_TEST.unverwundbar = false; });
    }
    await H.bis(() => p.evaluate(() => PflegeSprint.zustand().bildschirm === 'ende'), { zeit: 60000 });
    const zeiten = await p.evaluate(() => [PflegeSprint.diag.laufStart, PflegeSprint.diag.laufEnde]);
    const punkte = await p.evaluate(() => PflegeSprint.diag.letztePunkte);
    const best = await p.evaluate(() => JSON.parse(localStorage.getItem('kb2ab12_laeufe'))[0].p);
    return { punkte, best, start: zeiten[0], ende: zeiten[1] };
  }

  const eintraege = (l) => l.evaluate(() => Rangliste.eintraege());
  const status = (l) => l.evaluate(() => ({ zustand: Rangliste.empfaenger().zustand, spielende: Rangliste.empfaenger().spielende() }));
  const zeilen = (l) => l.$$eval('#liste .zeile', (z) => z.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
  const zeigt = (l, id, punkte) => H.bis(async () => (await eintraege(l)).some((e) => e.id === id && e.punkte === punkte), { zeit: 30000 });
  const geraet = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kb2ab12_geraet')));

  /* ---------- (b) Handys spielen zuerst, Rangliste wird erst danach geöffnet ---------- */
  console.log('\n== (b) Handys spielen, bevor die Rangliste geöffnet ist');
  const h1 = await handy('Mia', 'lina');
  const h2 = await handy('Mia', 'tim');
  const r1 = await spielen(h1.p, 1500);
  const r2 = await spielen(h2.p, 500);
  console.log(`  Mia (Handy 1): ${r1.punkte} Punkte, Mia (Handy 2): ${r2.punkte} Punkte`);
  const log = await h1.p.evaluate(() => window.__busLog);
  const imLauf = log.filter(([t, typ]) => t >= r1.start && t <= r1.ende && ['reg', 'conn', 'daten'].includes(typ));
  const vorher = log.filter(([t, typ]) => t < r1.start && typ === 'conn');
  H.pruefe(vorher.length > 0 && imLauf.length === 0, 'Verbindungsversuche nur auf Start-/Game-over-Bildschirm, keine während des Laufs',
    { vorher: vorher.length, imLauf });
  const statusText = await h1.p.locator('[data-status]').innerText();
  H.pruefe(statusText.includes('📡 Ihre Bestleistung wird automatisch übertragen.'), 'Handy: „Bestleistung wird automatisch übertragen“', statusText);

  const lehrerCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await bus.kontextAnschliessen(lehrerCtx);
  const L = await lehrerCtx.newPage();
  H.beobachten(L, protokoll, 'rangliste');
  const ladeZeit = Date.now();
  await L.goto(ranglisteUrl);
  H.pruefe(await H.bis(async () => (await status(L)).zustand === 'bereit', { zeit: 10000 }), 'Rangliste meldet sich unter RAUM_PRAEFIX + Raumcode an');
  H.pruefe((await L.locator('#warten').isVisible()) && (await L.locator('#raum-code').innerText()) === RAUM, 'Ruhige Anzeige „Warten …“, Raumcode groß sichtbar');
  const id1 = await geraet(h1.p);
  const id2 = await geraet(h2.p);
  const ok1 = await zeigt(L, id1, r1.best);
  const ok2 = await zeigt(L, id2, r2.best);
  H.pruefe(ok1 && ok2, `Bisherige Bestleistungen werden nachgereicht (nach ${((Date.now() - ladeZeit) / 1000).toFixed(1)} s)`, await eintraege(L));

  /* ---------- (e) gleiche Spitznamen ---------- */
  console.log('\n== (e) Gleiche Spitznamen von zwei Geräten');
  await H.warte(1200);
  const namen = (await eintraege(L)).map((e) => e.name).sort();
  H.pruefe(JSON.stringify(namen) === JSON.stringify(['Mia', 'Mia (2)']), 'Unterscheidbar als „Mia“ und „Mia (2)“', namen);
  const z = await zeilen(L);
  H.pruefe(z.length === 2 && z[0].startsWith('1.') && z.some((t) => t.includes('Mia (2)')), 'Anzeige mit Platz, Spitzname und Punkten', z);
  H.pruefe((await L.locator('#liste img').count()) === 2, 'Kleine Pixel-Figur je Eintrag');
  H.pruefe(await H.bis(async () => (await h1.p.locator('[data-status]').innerText()).includes('📡 Ihre Bestleistung ist auf der Rangliste.')),
    'Handy: „Ihre Bestleistung ist auf der Rangliste.“');

  /* ---------- (a) Rangliste von Anfang an offen ---------- */
  console.log('\n== (a) Rangliste ist offen, ein weiteres Handy kommt dazu');
  const h3 = await handy('Ben', 'tim');
  H.pruefe(await H.bis(async () => (await status(L)).spielende === 3, { zeit: 15000 }), 'Anzeige „3 Spielende verbunden“');
  H.pruefe((await L.locator('#anzahl').innerText()) === '3 Spielende verbunden', 'Text „x Spielende verbunden“');
  const r3 = await spielen(h3.p, 800);
  const id3 = await geraet(h3.p);
  const t0 = Date.now();
  H.pruefe(await zeigt(L, id3, r3.best), `Neuer Eintrag erscheint live (nach ${((Date.now() - t0) / 1000).toFixed(1)} s)`);

  /* ---------- (c) neue Bestleistung erscheint live ---------- */
  console.log('\n== (c) Neue Bestleistung erscheint live');
  const r1b = await spielen(h1.p, 5000);
  const t1 = Date.now();
  H.pruefe(r1b.best > r1.best && await zeigt(L, id1, r1b.best), `Bestleistung ${r1.best} → ${r1b.best} live aktualisiert (nach ${((Date.now() - t1) / 1000).toFixed(1)} s)`);
  const reihen = await eintraege(L);
  H.pruefe(reihen[0].id === id1, 'Überholen: neue Spitze steht auf Platz 1', reihen.map((e) => e.name + ':' + e.punkte));

  /* ---------- (d) Verbindungsabbrüche ---------- */
  console.log('\n== (d) Verbindungsabbruch und Neuverbindung');
  await L.evaluate(() => KB2Verbindung.TestTransport.vermittlungTrennen());
  await H.warte(300);
  const getrennt = await status(L);
  H.pruefe(getrennt.zustand === 'getrennt' && (await L.locator('#status-text').innerText()).includes('unterbrochen'), 'Abbruch zum Vermittlungsdienst wird angezeigt');
  H.pruefe(await H.bis(async () => (await status(L)).zustand === 'bereit', { zeit: 10000 }), 'Rangliste meldet sich automatisch unter derselben Kennung wieder an');
  H.pruefe((await status(L)).spielende === 3, 'Bestehende Verbindungen zu den Handys bleiben erhalten');

  // Vollständiger Netzausfall am Laptop für 10 s
  await L.evaluate(() => KB2Verbindung.TestTransport.netzAus());
  H.pruefe(await H.bis(async () => (await status(L)).spielende === 0, { zeit: 15000 }), 'Netzausfall am Laptop: Verbindungen brechen ab');
  await H.warte(4000);
  await L.evaluate(() => KB2Verbindung.TestTransport.netzAn());
  const t2 = Date.now();
  H.pruefe(await H.bis(async () => (await status(L)).zustand === 'bereit', { zeit: 30000 }), 'Nach dem Netzausfall wieder angemeldet');
  H.pruefe(await H.bis(async () => (await status(L)).spielende === 3, { zeit: 30000 }), `Handys verbinden sich neu (nach ${((Date.now() - t2) / 1000).toFixed(1)} s)`);
  const r2b = await spielen(h2.p, 6000);
  H.pruefe(await zeigt(L, id2, r2b.best), 'Nach Neuverbindung: neue Bestleistung kommt an');

  // Netzausfall am Handy: offline spielen, Punkte werden nachgereicht
  await h3.ctx.setOffline(true);
  H.pruefe(await H.bis(async () => (await status(L)).spielende === 2, { zeit: 20000 }), 'Handy offline: Verbindung bricht ab');
  const r3b = await spielen(h3.p, 6000);
  await H.warte(1000);
  H.pruefe(!(await eintraege(L)).some((e) => e.id === id3 && e.punkte === r3b.best), 'Offline erzielte Bestleistung ist noch nicht da');
  await h3.ctx.setOffline(false);
  const t3 = Date.now();
  H.pruefe(await zeigt(L, id3, r3b.best), `Wieder online: Bestleistung wird nachgereicht (nach ${((Date.now() - t3) / 1000).toFixed(1)} s)`);

  // Lange im Hintergrund: Tab verdeckt, Vermittlung bricht ab, 30 s später wieder sichtbar
  await L.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    KB2Verbindung.TestTransport.vermittlungTrennen();
  });
  await H.warte(30000);
  const imHintergrund = await status(L);
  const r1c = await spielen(h1.p, 7000);
  H.pruefe(await zeigt(L, id1, r1c.best), 'Hintergrund-Tab (30 s, Vermittlung getrennt): Meldungen kommen weiter an');
  await L.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  H.pruefe(imHintergrund.zustand === 'bereit' || await H.bis(async () => (await status(L)).zustand === 'bereit', { zeit: 10000 }),
    'Nach längerer Zeit im Hintergrund wieder verbunden', imHintergrund);

  /* ---------- Neuladen der Rangliste ---------- */
  console.log('\n== Neuladen der Ranglisten-Seite');
  const vorReload = (await eintraege(L)).length;
  await L.reload();
  H.pruefe(await H.bis(async () => (await status(L)).zustand === 'bereit', { zeit: 10000 }), 'Nach Neuladen sofort wieder angemeldet (gleiche Kennung, nicht „belegt“)');
  H.pruefe((await eintraege(L)).length === vorReload, 'Einträge bleiben nach Neuladen erhalten (sessionStorage)');
  H.pruefe(await H.bis(async () => (await status(L)).spielende === 3, { zeit: 30000 }), 'Handys verbinden sich nach dem Neuladen wieder');

  /* ---------- (g) Einträge älter als ANZEIGE_MINUTEN ---------- */
  console.log('\n== (g) Einträge älter als ANZEIGE_MINUTEN verschwinden');
  const simCtx = await browser.newContext();
  await bus.kontextAnschliessen(simCtx);
  const S = await simCtx.newPage();
  H.beobachten(S, protokoll, 'simulator');
  await S.goto(basis + 'index.html?transport=test');
  await S.addScriptTag({ url: 'verbindung.js' });
  await S.evaluate((raum) => {
    const fenster = CONFIG.ANZEIGE_MINUTEN * 60000;
    const jetzt = Date.now();
    window.sim = [
      { id: 'altgeraet0001', name: 'Alt', um: jetzt - fenster - 60000 },
      { id: 'knappgeraet01', name: 'Knapp', um: jetzt - fenster + 8000 }
    ].map((g) => {
      const s = new KB2Verbindung.Sender({
        raumId: CONFIG.RAUM_PRAEFIX + raum, geraeteId: g.id,
        profil: () => ({ spitzname: g.name, figur: 'lina' }),
        bestleistung: () => ({ punkte: 999, erreichtUm: g.um })
      });
      s.aktivieren();
      return s;
    });
  }, RAUM);
  H.pruefe(await H.bis(async () => (await eintraege(L)).some((e) => e.id === 'knappgeraet01'), { zeit: 15000 }), 'Eintrag knapp innerhalb des Zeitraums wird angezeigt');
  H.pruefe(!(await eintraege(L)).some((e) => e.id === 'altgeraet0001'), 'Eintrag älter als ANZEIGE_MINUTEN wird nicht angezeigt');
  H.pruefe(await H.bis(async () => !(await eintraege(L)).some((e) => e.id === 'knappgeraet01') &&
    (await L.locator('#liste .zeile[data-id="knappgeraet01"]').count()) === 0, { zeit: 25000 }), 'Nach Ablauf von ANZEIGE_MINUTEN verschwindet der Eintrag von selbst');

  /* ---------- (f) Ausblenden und Liste leeren ---------- */
  console.log('\n== (f) Moderation');
  await L.click(`#liste .zeile[data-id="${id3}"]`);
  H.pruefe(await L.locator('#dialog').isVisible() && (await L.locator('#dialog').innerText()).includes('Eintrag „Ben“ ausblenden?'), 'Klick auf Eintrag → Frage auf der Seite (kein Browser-Dialog)');
  await L.click('#dialog >> text=Eintrag ausblenden');
  await H.warte(200);
  H.pruefe(!(await eintraege(L)).some((e) => e.id === id3) && (await L.locator(`#liste .zeile[data-id="${id3}"]`).count()) === 0, 'Eintrag ist ausgeblendet');
  const r3c = await spielen(h3.p, 8000);
  await H.warte(4000);
  H.pruefe(!(await eintraege(L)).some((e) => e.id === id3), 'Ausgeblendetes Gerät bleibt auch mit neuer Bestleistung ausgeblendet', r3c.best);
  await L.click('#leeren');
  H.pruefe((await L.locator('#dialog').innerText()).includes('Wirklich alle Einträge'), '„Liste leeren“ fragt auf der Seite nach');
  await L.click('#dialog >> text=Abbrechen');
  H.pruefe((await eintraege(L)).length === 2, 'Abbrechen lässt die Liste unverändert');
  await L.click('#leeren');
  await L.click('#dialog >> text=Ja, Liste leeren');
  await H.warte(300);
  H.pruefe((await eintraege(L)).length === 0 && await L.locator('#warten').isVisible(), 'Liste ist leer, „Warten auf die ersten Läufe …“');
  await H.warte(12000);
  H.pruefe((await eintraege(L)).length === 0, 'Alte Bestleistungen kehren nach dem Leeren nicht zurück');

  /* ---------- (h) belegter Raumcode ---------- */
  console.log('\n== (h) Belegter Raumcode');
  const zweitCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await bus.kontextAnschliessen(zweitCtx);
  const L2 = await zweitCtx.newPage();
  H.beobachten(L2, protokoll, 'rangliste-2');
  await L2.goto(ranglisteUrl);
  H.pruefe(await H.bis(() => L2.locator('#belegt').isVisible(), { zeit: 10000 }) &&
    (await L2.locator('#belegt').innerText()).includes('Dieser Raumcode wird gerade schon verwendet – bitte einen anderen wählen.'), 'Zweite Rangliste mit gleichem Code: Hinweis „schon verwendet“');
  H.pruefe((await status(L)).zustand === 'bereit', 'Die erste Rangliste bleibt davon unberührt');
  await L2.click('#belegt-anderer');
  await L2.click('#vorschlagen');
  const vorschlag = await L2.inputValue('#raum-eingabe');
  H.pruefe(/^\d{4}$/.test(vorschlag), `„Zufälligen Code vorschlagen“ liefert 4 Ziffern (${vorschlag})`);

  /* ---------- Demo-Modus ---------- */
  const D = await zweitCtx.newPage();
  H.beobachten(D, protokoll, 'demo');
  await D.goto(basis + 'rangliste.html?demo=1');
  await H.warte(9500);
  const demo = await D.evaluate(() => ({ n: document.querySelectorAll('#liste .zeile').length, h: document.documentElement.scrollHeight, ih: innerHeight }));
  H.pruefe(demo.n === 10 && demo.h <= demo.ih, 'Demo-Modus: 10 erfundene Einträge, passt ohne Scrollen auf 16:9', demo);
  await D.screenshot({ path: require('path').join(__dirname, 'ergebnisse', 'rangliste-demo.png') }).catch(() => {});

  console.log('\n== Konsole und externe Anfragen');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an externe Adressen (Test-Transport)', protokoll.extern);

  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
