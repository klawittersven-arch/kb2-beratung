/* Tests der Übungsseiten aa1.html und aa2.html in Handygröße (390 × 844). */
'use strict';
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };

  // Ein gemeinsamer Kontext (wie ein Handy): erst AA1, dann AA2a
  const handy = await browser.newContext(H.MOBIL);
  for (const aufgabe of ['aa1', 'aa2']) {
    console.log(`\n== ${aufgabe}.html`);
    const p = await handy.newPage();
    H.beobachten(p, protokoll, aufgabe);
    await p.goto(basis + aufgabe + '.html');
    const daten = await p.evaluate((a) => INHALTE[a], aufgabe);
    const kuerzel = daten.antworten.map((a) => a.kuerzel);
    const richtig = (k) => (Array.isArray(k.richtig) ? k.richtig : [k.richtig]);
    const merksatzSichtbar = () => p.evaluate((m) => document.body.innerText.includes(m) || document.documentElement.innerHTML.includes(m), daten.merksatz.replace(/\*\*/g, '').replace(/\n/g, ' '));

    H.pruefe(!(await merksatzSichtbar()), 'Merksatz steht vor dem Lösen nirgends in der Seite');
    H.pruefe((await p.locator('.karte').count()) === daten.karten.length, `${daten.karten.length} Karten in fester Reihenfolge`);
    const nummern = await p.$$eval('.karte .nummer', (n) => n.map((x) => x.textContent));
    H.pruefe(JSON.stringify(nummern) === JSON.stringify(daten.karten.map((k) => String(k.nummer))), 'Nummerierung wie im Auftrag', nummern);

    // Knopfhöhe und Schriftgröße
    const masse = await p.$$eval('.antwort', (b) => b.map((x) => [x.getBoundingClientRect().height, parseFloat(getComputedStyle(x).fontSize)]));
    H.pruefe(masse.every(([h, f]) => h >= 48 && f >= 17), 'Antwortknöpfe ≥ 48 px hoch, Schrift ≥ 17 px');
    const schriften = await p.$$eval('p, li, span, button, summary, h1, h2, h3', (e) => e.filter((x) => x.offsetParent && x.textContent.trim()).map((x) => parseFloat(getComputedStyle(x).fontSize)));
    H.pruefe(Math.min(...schriften) >= 17, 'Sichtbare Schrift überall ≥ 17 px', Math.min(...schriften));
    const breite = await p.evaluate(() => document.documentElement.scrollWidth);
    H.pruefe(breite <= 390, 'Kein waagrechtes Scrollen bei 390 px', breite);

    if (aufgabe === 'aa2') {
      const hilfe = p.locator('details.hilfe');
      H.pruefe(!(await hilfe.evaluate((d) => d.open)), 'Hilfe „Die vier Kompetenzbereiche“ ist zugeklappt');
      await p.click('details.hilfe summary');
      H.pruefe(await hilfe.evaluate((d) => d.open), 'Hilfe lässt sich aufklappen');
      await p.click('details.hilfe summary');
    }

    // Zuerst alle falschen Antworten jeder Karte durchprobieren
    let mehrfach = 0;
    for (const k of daten.karten) {
      const r = richtig(k);
      if (r.length > 1) mehrfach++;
      for (const f of kuerzel.filter((x) => !r.includes(x))) {
        const knopf = p.locator(`#karte-${k.nummer} [data-kuerzel="${f}"]`);
        await knopf.click();
        const rueck = await p.locator(`#karte-${k.nummer} .rueckmeldung`).innerText();
        const ok = (await knopf.isDisabled()) && (await knopf.innerText()).includes('✗') && rueck.includes(k.tipp) && rueck.includes('✗');
        H.pruefe(ok, `Karte ${k.nummer}: falsche Antwort ${f} → ✗, deaktiviert, Tipp sichtbar`);
        H.pruefe(!(await p.locator(`#karte-${k.nummer}`).evaluate((e) => e.classList.contains('ist-richtig'))), `Karte ${k.nummer}: Lösung nach ${f} nicht verraten`);
      }
    }
    H.pruefe(!(await merksatzSichtbar()), 'Merksatz nach falschen Antworten noch nicht sichtbar');
    H.pruefe((await p.locator('.easter-egg').count()) === 0 && !(await p.evaluate(() => document.body.innerHTML.includes('spiel.html'))),
      'Vor vollständiger Lösung existiert kein Knopf/Link zum Spiel');
    H.pruefe(aufgabe === 'aa1' ? mehrfach === 0 : mehrfach === 1, `Genau ${aufgabe === 'aa1' ? 0 : 1} Karte mit zwei richtigen Antworten`);

    // Dann richtig lösen (bei Karte 2 von AA2a die Antwort S, um die zweite Lösung zu prüfen)
    for (let i = 0; i < daten.karten.length; i++) {
      const k = daten.karten[i];
      const r = richtig(k);
      const wahl = r.length > 1 ? 'S' : r[0];
      await p.locator(`#karte-${k.nummer} [data-kuerzel="${wahl}"]`).click();
      const rueck = await p.locator(`#karte-${k.nummer} .rueckmeldung`).innerText();
      const erkl = typeof k.erklaerung === 'object' ? k.erklaerung[wahl] : k.erklaerung;
      const gesperrt = await p.$$eval(`#karte-${k.nummer} .antwort`, (b) => b.every((x) => x.disabled));
      H.pruefe(rueck.includes('✓') && rueck.includes(erkl) && gesperrt, `Karte ${k.nummer}: ${wahl} richtig → ✓, Erklärung, Knöpfe gesperrt`);
      const fort = await p.locator('#fortschritt-text').innerText();
      H.pruefe(fort === `${i + 1} von ${daten.karten.length} richtig`, `Fortschritt „${fort}“`);
      if (i < daten.karten.length - 1) H.pruefe(!(await merksatzSichtbar()), 'Merksatz noch nicht sichtbar');
    }
    await H.warte(900);
    // Zu viele Fehlversuche (alle Karten erst falsch) → Warnung statt Merksatz
    const warnung = p.locator('.durchklicken');
    H.pruefe((await warnung.isVisible()) && (await warnung.innerText()).includes('Hey, nicht einfach durchklicken!') &&
      !(await merksatzSichtbar()) && !(await p.evaluate((a) => KB2.Freischaltung.istGeloest(a), aufgabe)),
      'Zu viele Fehlversuche: „Hey, nicht einfach durchklicken!“, kein Merksatz, keine Freischaltung');
    await p.click('.durchklicken-knopf');
    await H.warte(300);
    H.pruefe((await p.locator('#fortschritt-text').innerText()) === `0 von ${daten.karten.length} richtig` &&
      (await p.locator('.durchklicken').count()) === 0, '„Aufgabe neu starten“ setzt die Aufgabe zurück');
    // Jetzt sorgfältig: alles beim ersten Versuch richtig (bei Karte 2 von 2 a) die Antwort S)
    for (const k of daten.karten) {
      const r = richtig(k);
      await p.locator(`#karte-${k.nummer} [data-kuerzel="${r.length > 1 ? 'S' : r[0]}"]`).click();
    }
    await H.warte(900);
    const kasten = p.locator('.merksatz');
    H.pruefe(await kasten.isVisible(), 'Kasten „Ihr Merksatz“ erscheint nach vollständiger Lösung');
    const kastenText = (await kasten.innerText()).replace(/\s*\n\s*/g, ' ');
    if (aufgabe === 'aa1') {
      const betont = await p.$$eval('.merksatz-text .betont', (e) => e.map((x) => [x.textContent, getComputedStyle(x).fontWeight, getComputedStyle(x).textDecorationLine]));
      H.pruefe(JSON.stringify(betont.map((b) => b[0])) === '["erkannt","bearbeitet"]' && betont.every((b) => +b[1] >= 700 && b[2].includes('underline')),
        '„erkannt“ und „bearbeitet“ fett und unterstrichen', betont);
      H.pruefe(!kastenText.includes('**'), 'Keine Sternchen sichtbar');
    }
    H.pruefe(kastenText.includes(daten.merksatz.replace(/\*\*/g, '').replace(/\n/g, ' ')) && kastenText.includes('Schreiben Sie den Merksatz auf Ihr Arbeitsblatt.'), 'Merksatz und Hinweis stehen im Kasten');
    const erwartetErster = daten.karten.length;
    H.pruefe(kastenText.includes(`Beim ersten Versuch richtig: ${erwartetErster} von ${daten.karten.length}`), 'Zählung „Beim ersten Versuch richtig“', kastenText);
    const imBild = await kasten.evaluate((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    H.pruefe(imBild, 'Automatisch zum Merksatz gescrollt');

    // Neu laden: Fortschritt bleibt erhalten
    await p.reload();
    H.pruefe((await p.locator('#fortschritt-text').innerText()).startsWith(`${daten.karten.length} von`), 'Nach Neuladen bleibt der Fortschritt erhalten (sessionStorage)');

    // Zurücksetzen
    await p.click('#noch-einmal');
    await H.warte(300);
    const nachReset = await p.evaluate(() => ({
      richtig: document.querySelectorAll('.karte.ist-richtig').length,
      falsch: document.querySelectorAll('.antwort.falsch').length,
      gesperrt: document.querySelectorAll('.antwort:disabled').length,
      rueck: Array.from(document.querySelectorAll('.rueckmeldung')).filter((r) => r.textContent).length,
      fort: document.getElementById('fortschritt-text').textContent
    }));
    H.pruefe(nachReset.richtig === 0 && nachReset.falsch === 0 && nachReset.gesperrt === 0 && nachReset.rueck === 0 &&
      nachReset.fort === `0 von ${daten.karten.length} richtig` && !(await merksatzSichtbar()), '„Noch einmal üben“ setzt alles zurück', nachReset);

    // Erster Versuch alles richtig → x von x
    for (const k of daten.karten) await p.locator(`#karte-${k.nummer} [data-kuerzel="${richtig(k)[0]}"]`).click();
    await H.warte(300);
    H.pruefe((await p.locator('.merksatz').innerText()).includes(`Beim ersten Versuch richtig: ${daten.karten.length} von ${daten.karten.length}`), 'Bei fehlerfreier Lösung: alle beim ersten Versuch richtig');
    if (aufgabe === 'aa1') H.pruefe((await p.locator('.easter-egg').count()) === 0, 'Nach nur einer Aufgabe noch kein Belohnungs-Knopf');
    else {
      const ei = p.locator('.easter-egg');
      H.pruefe((await ei.count()) === 1 && (await ei.getAttribute('href')) === 'spiel.html' && (await ei.innerText()).startsWith('🎁'),
        'Nach beiden Aufgaben: Belohnungs-Knopf „🎁 Merksatz fertig abgeschrieben? …“ führt zu spiel.html');
      await p.click('#noch-einmal');
      await p.locator('#karte-1 [data-kuerzel="F"]').click();
      H.pruefe((await p.locator('.easter-egg').count()) === 0 && !(await p.evaluate(() => KB2.Freischaltung.istGeloest('aa2'))),
        'Nach „Noch einmal üben“ ist der Knopf weg, bis wieder alles gelöst ist');
      for (const k of daten.karten) if (k.nummer > 1) await p.locator(`#karte-${k.nummer} [data-kuerzel="${richtig(k)[0]}"]`).click();
      H.pruefe((await p.locator('.easter-egg').count()) === 1, 'Nach erneuter vollständiger Lösung erscheint er wieder');
    }

    // AA2a Karte 2: auch M wird akzeptiert
    if (aufgabe === 'aa2') {
      await p.click('#noch-einmal');
      await p.locator('#karte-2 [data-kuerzel="M"]').click();
      const r = await p.locator('#karte-2 .rueckmeldung').innerText();
      H.pruefe(r.includes('✓') && r.includes(daten.karten[1].erklaerung.M), 'AA2a Karte 2: M ist richtig (mit eigener Erklärung)');
    }
    await p.close();
  }
  await handy.close();

  // Grenze: genau die Mindestzahl reicht, eine weniger nicht
  console.log('\n== Mindestzahl „beim ersten Versuch richtig“ (Aufgabe 1)');
  {
    const ctx3 = await browser.newContext(H.MOBIL);
    const q = await ctx3.newPage();
    H.beobachten(q, protokoll, 'grenze');
    await q.goto(basis + 'aa1.html');
    const d = await q.evaluate(() => INHALTE.aa1);
    for (const fehler of [d.karten.length - d.mindestensErsterVersuch + 1, d.karten.length - d.mindestensErsterVersuch]) {
      await q.evaluate(() => { sessionStorage.clear(); });
      await q.reload();
      for (let i = 0; i < d.karten.length; i++) {
        const k = d.karten[i];
        const r = [].concat(k.richtig)[0];
        if (i < fehler) await q.click(`#karte-${k.nummer} [data-kuerzel="${r === 'S' ? 'G' : 'S'}"]`);
        await q.click(`#karte-${k.nummer} [data-kuerzel="${r}"]`);
      }
      await H.warte(300);
      const richtigErst = d.karten.length - fehler;
      const warn = (await q.locator('.durchklicken').count()) === 1;
      const merk = (await q.locator('.merksatz').count()) === 1;
      if (richtigErst < d.mindestensErsterVersuch) H.pruefe(warn && !merk, `${richtigErst} von ${d.karten.length} beim ersten Versuch → neu starten`);
      else H.pruefe(merk && !warn, `${richtigErst} von ${d.karten.length} beim ersten Versuch → Merksatz`);
    }
    await ctx3.close();
  }

  // 2 a) ist gesperrt, solange Aufgabe 1 nicht gelöst ist
  console.log('\n== Sperre: 2 a) erst nach Aufgabe 1');
  {
    const ctx2 = await browser.newContext(H.MOBIL);
    const q = await ctx2.newPage();
    H.beobachten(q, protokoll, 'sperre');
    const loesen = async (seite) => {
      await q.goto(basis + seite + '.html');
      const k = await q.evaluate((a) => INHALTE[a].karten.map((x) => [x.nummer, [].concat(x.richtig)[0]]), seite);
      for (const [n, r] of k) await q.click(`#karte-${n} [data-kuerzel="${r}"]`);
      await H.warte(300);
    };
    await q.goto(basis + 'aa2.html');
    const text = await q.locator('main').innerText();
    H.pruefe(text.includes('Lösen Sie zuerst Arbeitsauftrag 1!') && (await q.locator('.karte').count()) === 0 &&
      (await q.locator('.antwort').count()) === 0, '2 a) vor Aufgabe 1: „Lösen Sie zuerst Arbeitsauftrag 1!“, keine Karten');
    H.pruefe((await q.locator('.gesperrt a').getAttribute('href')) === 'aa1.html', 'Link „Zu Arbeitsauftrag 1“');
    await q.click('.gesperrt a');
    H.pruefe(q.url().endsWith('aa1.html'), 'Link führt zu Arbeitsauftrag 1');
    await loesen('aa1');
    H.pruefe((await q.locator('.easter-egg').count()) === 0, 'Nach Aufgabe 1: kein Belohnungs-Knopf');
    await q.click('#noch-einmal');
    await q.goto(basis + 'aa2.html');
    H.pruefe((await q.locator('.karte').count()) === 8, 'Nach Aufgabe 1 ist 2 a) offen – auch wenn Aufgabe 1 danach „noch einmal geübt“ wird');
    await ctx2.close();
  }

  // Ohne Speicher (sessionStorage/localStorage gesperrt) funktioniert die Seite trotzdem
  console.log('\n== ohne Browser-Speicher');
  const ctx = await browser.newContext(H.MOBIL);
  await ctx.addInitScript(() => {
    for (const n of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, n, { get() { throw new Error('gesperrt'); } });
    }
  });
  const p = await ctx.newPage();
  H.beobachten(p, { konsole: [], extern: protokoll.extern }, 'ohne-speicher');
  const fehler = [];
  p.on('pageerror', (e) => fehler.push(e.message));
  await p.goto(basis + 'aa1.html');
  for (const [n, k] of await p.evaluate(() => INHALTE.aa1.karten.map((x) => [x.nummer, [].concat(x.richtig)[0]]))) await p.click(`#karte-${n} [data-kuerzel=${k}]`);
  H.pruefe(fehler.length === 0 && await p.locator('.merksatz').isVisible(), 'Übung läuft ohne Speicher fehlerfrei', fehler);
  await ctx.close();

  console.log('\n== Konsole und externe Anfragen');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an externe Adressen', protokoll.extern);

  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
