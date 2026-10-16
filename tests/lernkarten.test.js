/* Lernkarten KB I (docs/kb1/): Inhalte, Bedienung, Speicher, Layout, Offline, Datenschutz. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const H = require('./hilfen');

const ORDNER = path.join(H.DOCS, 'kb1');
const ERGEBNISSE = path.join(__dirname, 'ergebnisse');

function kartenLaden() {
  const box = {};
  vm.runInNewContext(fs.readFileSync(path.join(ORDNER, 'karten.js'), 'utf8') + '\nthis.D = LERNKARTEN;', box);
  return box.D;
}

(async () => {
  /* ---------- 1. Inhalte ---------- */
  console.log('\n== Inhalte in karten.js');
  const D = kartenLaden();
  const alle = [];
  D.themen.forEach((t) => t.karten.forEach((k) => alle.push(Object.assign({ thema: t.ab || t.titel }, k))));
  H.pruefe(D.themen.length === 13, `13 Themen (Operatoren + 12 Abschnitte der Ich-kann-Liste)`, D.themen.length);
  H.pruefe(alle.length === 96, `96 Karten`, alle.length);
  H.pruefe(D.themen.every((t) => (t.ab || t.titel) && t.karten.length > 0), 'jedes Thema hat einen Titel und Karten');
  const fehlerhaft = alle.filter((k) => {
    const hinten = [].concat(k.hinten);
    return typeof k.vorne !== 'string' || !k.vorne.trim() || !hinten.length || hinten.some((h) => typeof h !== 'string' || !h.trim());
  });
  H.pruefe(fehlerhaft.length === 0, 'jede Karte hat Vorder- und Rückseite', fehlerhaft.map((k) => k.vorne));
  const schluessel = alle.map((k) => k.vorne + '|' + (k.fall || ''));
  const doppelt = schluessel.filter((s, i) => schluessel.indexOf(s) !== i);
  H.pruefe(doppelt.length === 0, 'keine zwei Karten mit gleicher Vorderseite', doppelt);
  const texte = alle.flatMap((k) => [k.vorne, k.fall || '', k.hinweis || ''].concat(k.hinten));
  const sterne = texte.filter((t) => {
    const ohneFett = t.replace(/\*\*(.+?)\*\*/g, '$1');
    return (t.match(/\*\*/g) || []).length % 2 || (ohneFett.match(/\*/g) || []).length % 2;
  });
  H.pruefe(sterne.length === 0, '**fett** und *kursiv* immer paarweise', sterne);
  // „umrechnen“ ist kein Operator der Prüfung und steht auch in der Ich-kann-Liste nicht kursiv
  const ohneOperator = alle.filter((k) => !/\*[a-zäöü]+\*/.test(k.vorne) && !/ umrechnen\.$/.test(k.vorne));
  H.pruefe(ohneOperator.length === 0, 'jede Vorderseite nennt einen *kursiven* Operator', ohneOperator.map((k) => k.vorne));
  const operatoren = ['nennen', 'beschreiben', 'identifizieren', 'erklären', 'erläutern', 'begründen', 'ableiten', 'vergleichen', 'zuordnen', 'beurteilen', 'bewerten'];
  const opKarten = D.themen[0].karten.map((k) => (k.vorne.match(/\*([a-zäöü]+)\*/) || [])[1]);
  H.pruefe(JSON.stringify(opKarten) === JSON.stringify(operatoren), 'Operatoren-Karten in der Reihenfolge der Tabelle', opKarten);
  for (const k of D.texte ? Object.keys(D.texte) : []) if (typeof D.texte[k] !== 'string') H.pruefe(false, `Text ${k} ist kein Text`);

  /* ---------- 2. Bedienung im Browser ---------- */
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const url = basis + 'kb1/';

  console.log('\n== Bedienung (Handy 390 × 844)');
  {
    const ctx = await browser.newContext(H.MOBIL);
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'bedienung');
    p.on('dialog', (d) => d.accept());
    await p.goto(url);
    H.pruefe(await p.locator('#knopf-start').innerText() === 'Alle 96 Karten lernen', 'Start: „Alle 96 Karten lernen“');
    H.pruefe(await p.locator('.thema').count() === 13, 'Start: 13 Themen zur Auswahl');

    await p.click('#keine-themen');
    H.pruefe(await p.locator('#knopf-start').isDisabled(), '„Keine“: Start-Knopf gesperrt');
    await p.locator('.thema', { hasText: 'So regelt Insulin den Blutzucker' }).locator('input').check();
    H.pruefe(await p.locator('#knopf-start').innerText() === 'Alle 8 Karten lernen', 'ein Thema gewählt: „Alle 8 Karten lernen“');

    await p.click('#knopf-start');
    const zaehler = () => p.locator('#zaehler').innerText();
    H.pruefe(await zaehler() === '1 / 8', 'Runde startet bei 1 / 8');
    const vorne = await p.locator('#vorne-text').innerText();
    H.pruefe(vorne.startsWith('Ich kann den Regelkreis') && await p.locator('#vorne-text strong').count() > 0 && await p.locator('#vorne-text em').count() > 0,
      'Vorderseite: Kompetenz mit fettem Teilaspekt und kursivem Operator', vorne);
    H.pruefe((await p.locator('#vorne-kopf').innerText()).includes('AB „So regelt Insulin den Blutzucker“ · Nr. 1'), 'Kopfzeile nennt AB und Nummer');
    H.pruefe(!(await p.locator('#karte').getAttribute('class')).includes('umgedreht'), 'Karte zeigt zuerst die Vorderseite');

    await p.click('#karte');
    await H.warte(550);
    H.pruefe((await p.locator('#karte').getAttribute('class')).includes('umgedreht'), 'Antippen dreht die Karte um');
    H.pruefe(await p.locator('#hinten-text ol li').count() === 3 && await p.locator('#seite-hinten').getAttribute('aria-hidden') === 'false',
      'Rückseite: nummerierte Liste (Schritte 1–3), für Bildschirmleser sichtbar');
    await p.click('#karte');
    await H.warte(550);
    H.pruefe(!(await p.locator('#karte').getAttribute('class')).includes('umgedreht'), 'nochmal antippen: wieder Vorderseite');

    await p.click('#knopf-gewusst');
    await H.warte(400);
    H.pruefe(await zaehler() === '2 / 8' && await p.locator('#anzahl-gewusst').innerText() === '1', '„Gewusst“: weiter zu 2 / 8, Zähler grün = 1');
    const start2 = await p.locator('#hinten-text ol').getAttribute('start');
    H.pruefe(start2 === '4', 'Schritte 4–5 beginnen mit Nummer 4', start2);
    await p.click('#knopf-nochnicht');
    await H.warte(400);
    H.pruefe(await zaehler() === '3 / 8' && await p.locator('#anzahl-nochnicht').innerText() === '1', '„Noch nicht“: weiter zu 3 / 8, Zähler orange = 1');
    await p.click('#knopf-zurueck');
    await H.warte(400);
    H.pruefe(await zaehler() === '2 / 8' && await p.locator('#anzahl-nochnicht').innerText() === '0', '„Zurück“ nimmt die letzte Bewertung zurück');

    // Wischen (Maus erzeugt dieselben Pointer-Ereignisse wie ein Finger)
    const box = await p.locator('#karte').boundingBox();
    const mx = box.x + box.width / 2, my = box.y + box.height / 2;
    await p.mouse.move(mx, my); await p.mouse.down();
    for (let i = 1; i <= 8; i++) await p.mouse.move(mx + i * 5, my);
    await p.mouse.up();
    await H.warte(400);
    H.pruefe(await zaehler() === '2 / 8' && !(await p.locator('#karte').getAttribute('class')).includes('umgedreht'),
      'kurzes Wischen (40 px): Karte federt zurück, wird nicht umgedreht');
    await p.mouse.move(mx, my); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(mx + i * 16, my + i);
    await p.mouse.up();
    await H.warte(400);
    H.pruefe(await zaehler() === '3 / 8' && await p.locator('#anzahl-gewusst').innerText() === '2', 'nach rechts wischen = gewusst');
    await p.mouse.move(mx, my); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(mx - i * 16, my);
    await p.mouse.up();
    await H.warte(400);
    H.pruefe(await zaehler() === '4 / 8' && await p.locator('#anzahl-nochnicht').innerText() === '1', 'nach links wischen = noch nicht');

    // Tastatur
    await p.keyboard.press('ArrowRight');
    await H.warte(400);
    H.pruefe(await zaehler() === '5 / 8', 'Pfeil rechts = gewusst');

    // Neu laden mitten in der Runde
    await p.reload();
    H.pruefe((await p.locator('#knopf-start').innerText()) === 'Weiterlernen · Karte 5 von 8', 'nach Neuladen: „Weiterlernen · Karte 5 von 8“');
    await p.click('#knopf-start');
    H.pruefe(await zaehler() === '5 / 8' && await p.locator('#anzahl-gewusst').innerText() === '3', 'Weiterlernen setzt bei 5 / 8 fort, Zähler erhalten');

    for (const wert of ['n', 'g', 'n', 'g']) {
      await p.click(wert === 'g' ? '#knopf-gewusst' : '#knopf-nochnicht');
      await H.warte(350);
    }
    H.pruefe(await p.locator('#ansicht-ergebnis').isVisible(), 'nach der letzten Karte: Ergebnis');
    H.pruefe(await p.locator('#ergebnis-zahl').innerText() === '5 von 8 Karten gewusst', 'Ergebnis: 5 von 8 Karten gewusst');
    H.pruefe(await p.locator('#knopf-wiederholen').innerText() === '3 Karten wiederholen', 'Angebot: „3 Karten wiederholen“');
    await p.click('#knopf-wiederholen');
    H.pruefe(await zaehler() === '1 / 3', 'Wiederholungsrunde mit den 3 offenen Karten');
    await p.click('#knopf-schliessen');
    const stand = await p.locator('.thema', { hasText: 'So regelt Insulin' }).locator('.thema-stand').innerText();
    H.pruefe(stand.startsWith('5 von 8 gewusst'), 'Übersicht: Thema zeigt „5 von 8 gewusst“', stand);
    H.pruefe((await p.locator('#knopf-start').innerText()) === 'Weiterlernen · Karte 1 von 3', 'Übersicht bietet Weiterlernen an');
    H.pruefe((await p.locator('#knopf-start-2').innerText()) === 'Nur offene Karten lernen (3)', 'zweite Wahl: „Nur offene Karten lernen (3)“');

    await p.click('.schalter');
    await p.reload();
    H.pruefe(await p.locator('#mischen').isChecked(), '„Karten mischen“ bleibt nach Neuladen eingeschaltet');
    H.pruefe(await p.locator('.thema input:checked').count() === 1, 'Themenauswahl bleibt nach Neuladen erhalten');
    await p.click('#alle-themen');
    await p.click('#knopf-start-2'); // neue Runde (offene Karten), gemischt
    const reihenfolge = [];
    for (let i = 0; i < 6; i++) {
      reihenfolge.push(await p.locator('#vorne-text').innerText());
      await p.keyboard.press('ArrowLeft'); await H.warte(300);
    }
    const ersteSechs = D.themen[0].karten.slice(0, 6).map((k) => k.vorne.replace(/\*/g, ''));
    H.pruefe(JSON.stringify(reihenfolge) !== JSON.stringify(ersteSechs), 'gemischt: andere Reihenfolge als in der Liste');

    await p.click('#knopf-schliessen');
    await p.click('#zuruecksetzen');
    H.pruefe((await p.locator('#gesamt-text').innerText()) === 'Ihr Lernstand: 0 von 96 Karten gewusst', '„Lernstand löschen“ setzt alles zurück');
    const cookies = await ctx.cookies();
    H.pruefe(cookies.length === 0, 'keine Cookies');
    await p.screenshot({ path: path.join(ERGEBNISSE, 'lernkarten-start.png') });
    await ctx.close();
  }

  /* ---------- 3. Alle Karten: Layout auf großen und kleinen Handys ---------- */
  for (const [breite, hoehe, schema] of [[390, 844, 'light'], [320, 568, 'dark']]) {
    console.log(`\n== Alle 96 Karten bei ${breite} × ${hoehe} (${schema === 'dark' ? 'dunkles' : 'helles'} Design)`);
    const ctx = await browser.newContext(Object.assign({}, H.MOBIL, { viewport: { width: breite, height: hoehe }, reducedMotion: 'reduce', colorScheme: schema }));
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'layout-' + breite);
    await p.goto(url);
    await p.click('#knopf-start');
    const lang = [], quer = [], knopfHoch = [];
    let gezeigt = 0;
    for (let i = 0; i < 96; i++) {
      for (const seite of ['vorne', 'hinten']) {
        if (seite === 'hinten') await p.click('#karte');
        const m = await p.evaluate(() => {
          const karte = document.getElementById('karte').getBoundingClientRect();
          const leiste = document.querySelector('.lern-leiste').getBoundingClientRect();
          const knopf = document.getElementById('knopf-nochnicht').getBoundingClientRect();
          return {
            text: document.getElementById('vorne-text').innerText.slice(0, 60),
            hoehe: karte.height, platz: leiste.top - karte.top,
            quer: document.documentElement.scrollWidth > window.innerWidth,
            knopf: knopf.height
          };
        });
        if (m.hoehe > m.platz + 1) lang.push(`${seite}: ${m.text}… (${Math.round(m.hoehe)} px bei ${Math.round(m.platz)} px Platz)`);
        if (m.quer) quer.push(m.text);
        if (m.knopf > 60) knopfHoch.push(m.knopf);
      }
      if (i === 47) await p.screenshot({ path: path.join(ERGEBNISSE, `lernkarten-${breite}-rueckseite.png`) });
      await p.click('#knopf-gewusst');
      gezeigt++;
    }
    H.pruefe(gezeigt === 96 && await p.locator('#ansicht-ergebnis').isVisible(), 'alle 96 Karten durchgeblättert, danach Ergebnis');
    H.pruefe(quer.length === 0, 'nie seitlich verschiebbar (kein horizontales Scrollen)', quer);
    H.pruefe(knopfHoch.length === 0, '„Noch nicht“/„Gewusst“ einzeilig', knopfHoch.slice(0, 3));
    if (breite >= 390) H.pruefe(lang.length === 0, 'jede Karte passt ohne Scrollen auf den Bildschirm', lang);
    else console.log(`  (Info) ${lang.length} Kartenseiten sind auf dem kleinen Bildschirm länger und lassen sich scrollen` + (lang.length ? ':\n    ' + lang.join('\n    ') : ''));
    H.pruefe(await p.locator('#ergebnis-titel').innerText() === 'Alles gewusst – stark!', 'Ergebnis bei allen gewusst: „Alles gewusst – stark!“');
    await ctx.close();
  }

  /* ---------- 4. Offline ---------- */
  console.log('\n== Offline nach dem ersten Laden');
  {
    const ctx = await browser.newContext(H.MOBIL);
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'offline');
    await p.goto(url);
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.reload();
    const gesteuert = await p.evaluate(() => !!navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL);
    const caches = await p.evaluate(async () => (await caches.keys()).join(','));
    H.pruefe(gesteuert && gesteuert.endsWith('/kb1/sw.js') && /kb1-lernkarten-v\d+/.test(caches), `eigener Service Worker aktiv, Cache „${caches}“`);
    await ctx.setOffline(true);
    await p.goto(url);
    await p.click('#knopf-start');
    await p.click('#karte');
    await p.click('#knopf-gewusst');
    await H.warte(400);
    H.pruefe(await p.locator('#zaehler').innerText() === '2 / 96', 'Offline: Karten lassen sich lernen');
    await ctx.close();
  }

  /* ---------- 5. Datenschutz und Dateigrößen ---------- */
  console.log('\n== Datenschutz');
  H.pruefe(protokoll.extern.length === 0, 'keine Anfrage an fremde Adressen', protokoll.extern);
  H.pruefe(protokoll.konsole.length === 0, 'keine Fehler in der Konsole', protokoll.konsole);
  const groesse = fs.readdirSync(ORDNER).reduce((s, d) => s + fs.statSync(path.join(ORDNER, d)).size, 0);
  H.pruefe(groesse < 150 * 1024, `alle Dateien zusammen ${Math.round(groesse / 1024)} KB (< 150 KB)`);

  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
