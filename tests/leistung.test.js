/* Leistungstests:
 *  1. Bildrate des Spiels in Handygröße ohne Drosselung und mit 4- und 6-facher
 *     CPU-Drosselung (Chrome DevTools), je SPIELZEIT_S Sekunden, mit Speichermessung.
 *  2. Belastungstest der Rangliste mit 40 simulierten Handys (Test-Transport),
 *     während auf einem weiteren „Handy“ das Spiel läuft.
 * Aufruf: node tests/leistung.test.js [Sekunden je Messung, Standard 180] */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('./hilfen');

const SPIELZEIT_S = +(process.argv[2] || 180);

function statistik(werte) {
  const s = [...werte].sort((a, b) => a - b);
  const q = (x) => s[Math.min(s.length - 1, Math.floor(x * s.length))];
  const mittel = s.reduce((a, b) => a + b, 0) / s.length;
  return { n: s.length, min: s[0], p5: q(0.05), median: q(0.5), mittel: Math.round(mittel * 10) / 10, max: s[s.length - 1] };
}

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const bericht = [];

  /* ---------- 1. Bildrate mit CPU-Drosselung ---------- */
  for (const drossel of [1, 4, 6]) {
    console.log(`\n== Bildrate, CPU-Drosselung ${drossel}× (${SPIELZEIT_S} s Spielzeit, 390 × 844)`);
    const ctx = await browser.newContext(H.MOBIL);
    await H.handyVorbereiten(ctx, { test: { unverwundbar: true } });
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'leistung-' + drossel);
    await p.goto(basis + 'spiel.html?transport=test');
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: drossel });
    await cdp.send('HeapProfiler.enable');
    await p.click('#knopf-los');
    const speicher = [];
    const intervalle = [];
    let sparAb = null;
    const start = Date.now();
    for (let t = 10; t <= SPIELZEIT_S; t += 10) {
      await H.warte(start + t * 1000 - Date.now());
      const d = await p.evaluate(() => {
        const g = PflegeSprint.diag;
        const n = Math.min(g.abstandNr, 1024);
        const a = [];
        for (let i = 0; i < n; i++) a.push(g.abstaende[(g.abstandNr - 1 - i) & 1023]);
        return { abst: a, spar: g.sparmodus, fps: g.fps, zeit: PflegeSprint.zustand().zeit, bilder: g.bilder };
      });
      if (d.spar && sparAb === null) sparAb = t;
      if (t % 30 === 0) {
        await cdp.send('HeapProfiler.collectGarbage');
        const heap = await cdp.send('Runtime.getHeapUsage');
        speicher.push({ t, mb: Math.round(heap.usedSize / 1048576 * 100) / 100 });
      }
      intervalle.push({ t, fps: d.fps, spar: d.spar, zeit: d.zeit });
    }
    const z = await p.evaluate(() => ({ ...PflegeSprint.zustand(), bilder: PflegeSprint.diag.bilder, fpsVerlauf: PflegeSprint.diag.fpsVerlauf }));
    const verlauf = z.fpsVerlauf.slice(1);
    const st = statistik(verlauf);
    const nachSpar = sparAb === null ? verlauf : z.fpsVerlauf.slice(Math.ceil(sparAb / 2) + 1);
    const stSpar = statistik(nachSpar.length ? nachSpar : verlauf);
    const echt = (Date.now() - start) / 1000;
    const zeile = {
      drossel, sekunden: Math.round(echt), spielzeit: Math.round(z.zeit * 10) / 10,
      fps: st, sparmodus: z.sparmodus, sparmodusAbSekunde: sparAb, fpsNachSparmodus: sparAb === null ? null : stSpar,
      speicherMB: speicher, bilder: z.bilder
    };
    bericht.push({ test: 'bildrate', ...zeile });
    console.log(`  Bilder/s (2-s-Fenster): min ${st.min}, 5 %-Quantil ${st.p5}, Median ${st.median}, Mittel ${st.mittel}, max ${st.max}`);
    console.log(`  Sparmodus: ${z.sparmodus ? 'an ab ca. ' + sparAb + ' s' : 'aus'}` + (sparAb !== null ? `; danach Median ${stSpar.median}, min ${stSpar.min}` : ''));
    console.log(`  Spielzeit ${zeile.spielzeit} s bei ${zeile.sekunden} s Echtzeit; Heap nach GC: ${speicher.map((s) => s.t + ' s: ' + s.mb + ' MB').join(', ')}`);
    if (drossel === 1) H.pruefe(st.median >= 58 && st.p5 >= 55, 'Ohne Drosselung stabil ~60 Bilder/s', st);
    else H.pruefe((z.sparmodus ? stSpar : st).p5 >= 29, `${drossel}× gedrosselt: mindestens 30 Bilder/s (ggf. im Sparmodus)`, { st, stSpar });
    const wachstum = speicher[speicher.length - 1].mb - speicher[0].mb;
    H.pruefe(wachstum < 0.5, 'Kein wachsender Speicherverbrauch', speicher);
    H.pruefe(Math.abs(z.zeit - echt) < 3, 'Spielzeit läuft gleichmäßig mit der Echtzeit', { spielzeit: z.zeit, echt });
    await ctx.close();
  }

  /* ---------- 2. Belastungstest Rangliste: 40 Handys ---------- */
  console.log('\n== Belastungstest: 40 simulierte Handys melden gleichzeitig');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const L = await ctx.newPage();
  H.beobachten(L, protokoll, 'rangliste');
  await L.addInitScript(() => {
    window.__langeAufgaben = [];
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__langeAufgaben.push(Math.round(e.duration)); })
        .observe({ entryTypes: ['longtask'] });
    } catch (e) { /* egal */ }
  });
  await L.goto(basis + 'rangliste.html?raum=5555&transport=test');
  await H.bis(() => L.evaluate(() => Rangliste.empfaenger().zustand === 'bereit'));
  const S = await ctx.newPage();
  H.beobachten(S, protokoll, 'simulator');
  await S.goto(basis + 'index.html?transport=test');
  await S.addScriptTag({ url: 'verbindung.js' });
  const namen = ['Mia', 'Leon', 'Emma', 'Ben', 'Lea', 'Finn', 'Hanna', 'Elias', 'Lina', 'Tim'];
  const aufbauVorher = await L.evaluate(() => Rangliste.aufbauZaehler());
  const t0 = Date.now();
  await S.evaluate((namen) => {
    window.sims = [];
    for (let i = 0; i < 40; i++) {
      const g = { punkte: 100 + i, um: Date.now(), name: namen[i % namen.length] };
      const s = new KB2Verbindung.Sender({
        raumId: CONFIG.RAUM_PRAEFIX + '5555', geraeteId: 'simgeraet' + String(i).padStart(3, '0'),
        profil: () => ({ spitzname: g.name, figur: i % 2 ? 'tim' : 'lina' }),
        bestleistung: () => ({ punkte: g.punkte, erreichtUm: g.um })
      });
      s.aktivieren();
      window.sims.push({ s, g });
    }
    // Alle 2,5 s bekommt jedes Handy eine neue Bestleistung (alle gleichzeitig)
    window.runde = 0;
    window.takt = setInterval(() => {
      window.runde++;
      for (const x of window.sims) { x.g.punkte += 50 + Math.floor(Math.random() * 50); x.g.um = Date.now(); x.s.melden(); }
    }, 2500);
  }, namen);

  const alleDa = await H.bis(() => L.evaluate(() => Rangliste.alleEintraege() === 40 && Rangliste.empfaenger().spielende() === 40), { zeit: 30000 });
  H.pruefe(alleDa, `Alle 40 Handys verbunden und eingetragen (nach ${((Date.now() - t0) / 1000).toFixed(1)} s)`);

  // Gleichzeitig läuft auf einem echten Spiel-„Handy“ ein Lauf (anderer Raum, Verbindungsversuche laufen)
  const spielCtx = await browser.newContext(H.MOBIL);
  await H.handyVorbereiten(spielCtx, { raum: '9999', test: { unverwundbar: true } });
  const G = await spielCtx.newPage();
  H.beobachten(G, protokoll, 'spiel-belastung');
  await G.goto(basis + 'spiel.html?transport=test');
  await H.warte(1500);
  await G.click('#knopf-los');

  await H.warte(60000);
  const sekunden = (Date.now() - t0) / 1000;
  await S.evaluate(() => clearInterval(window.takt));
  await H.warte(6000);
  const soll = await S.evaluate(() => Object.fromEntries(window.sims.map((x) => ['simgeraet' + String(window.sims.indexOf(x)).padStart(3, '0'), x.g.punkte])));
  const runden = await S.evaluate(() => window.runde);
  const ist = await L.evaluate(() => {
    const z = JSON.parse(sessionStorage.getItem('kb2ab12_rangliste'));
    return Object.fromEntries(Object.entries(z.eintraege).map(([k, v]) => [k, v.punkte]));
  });
  const stimmen = Object.keys(soll).filter((k) => ist[k] === soll[k]).length;
  H.pruefe(stimmen === 40, `Nach ${runden} Meldungsrunden: alle 40 Bestleistungen aktuell auf der Rangliste`, { stimmen });
  const aufbau = (await L.evaluate(() => Rangliste.aufbauZaehler())) - aufbauVorher;
  const proSek = aufbau / (sekunden + 6);
  H.pruefe(proSek <= 1.05, `Anzeige höchstens 1× pro Sekunde neu aufgebaut (${aufbau} Aufbauten in ${Math.round(sekunden + 6)} s)`);
  const lang = await L.evaluate(() => window.__langeAufgaben);
  const zeilenAnzahl = await L.locator('#liste .zeile').count();
  H.pruefe(zeilenAnzahl === 10 && (await L.locator('#anzahl').innerText()) === '40 Spielende verbunden', 'Top 10 angezeigt, „40 Spielende verbunden“');
  const spielFps = await G.evaluate(() => {
    const g = PflegeSprint.diag;
    const n = Math.min(g.abstandNr, 1024);
    const a = [];
    for (let i = 0; i < n; i++) a.push(g.abstaende[i]);
    return { verlauf: g.fpsVerlauf.slice(1), abst: a };
  });
  const sf = statistik(spielFps.verlauf);
  const grosseLuecken = spielFps.abst.filter((x) => x > 50).length;
  console.log(`  Rangliste: ${lang.length} lange Aufgaben (> 50 ms) auf der Hauptseite` + (lang.length ? ` (max ${Math.max(...lang)} ms)` : ''));
  console.log(`  Spiel parallel: Bilder/s Median ${sf.median}, min ${sf.min}; Bildabstände > 50 ms: ${grosseLuecken} von ${spielFps.abst.length}`);
  H.pruefe(sf.median >= 58, 'Spiel läuft parallel flüssig weiter (keine Ruckler durch Verbindungsversuche)', sf);
  bericht.push({
    test: 'belastung', handys: 40, meldungsrunden: runden, sekunden: Math.round(sekunden), aufbauten: aufbau,
    langeAufgaben: lang, spielFps: sf, spielBildabstaendeUeber50ms: grosseLuecken
  });

  console.log('\n== Konsole und externe Anfragen');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an externe Adressen', protokoll.extern);

  fs.mkdirSync(path.join(__dirname, 'ergebnisse'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'ergebnisse', 'leistung.json'), JSON.stringify(bericht, null, 2));
  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
