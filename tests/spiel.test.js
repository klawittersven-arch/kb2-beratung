/* Tests des Minispiels (spiel.html) in Handygröße. */
'use strict';
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const url = basis + 'spiel.html?transport=test';

  /* ---------- Sperre ---------- */
  console.log('\n== Freischaltung');
  {
    const ctx = await browser.newContext(H.MOBIL);
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'sperre');
    await p.goto(url);
    const text = await p.locator('#panel').innerText();
    H.pruefe(text.includes('Lösen Sie zuerst beide Aufgaben.') && (await p.locator('#panel a[href="aa1.html"]').count()) === 1 &&
      (await p.locator('#panel a[href="aa2.html"]').count()) === 1, 'Ohne gelöste Aufgaben: Hinweis und Links zu beiden Aufgaben');
    H.pruefe((await p.locator('#knopf-los').count()) === 0, 'Spiel ist gesperrt');
    await p.evaluate(() => localStorage.setItem('kb2ab12_geloest_aa1', String(Date.now())));
    await p.reload();
    H.pruefe((await p.locator('#panel').innerText()).includes('Lösen Sie zuerst beide Aufgaben.'), 'Nur eine Aufgabe gelöst: weiterhin gesperrt');
    await p.evaluate(() => localStorage.setItem('kb2ab12_geloest_aa2', String(Date.now())));
    await p.reload();
    H.pruefe((await p.locator('#spitzname').count()) === 1 && (await p.locator('#panel .profil canvas').count()) === 1,
      'Beide gelöst: Spitzname wird abgefragt, Krankenschwester wird angezeigt (keine Figurwahl)');

    /* ---------- Einrichtung ---------- */
    console.log('\n== Spitzname, Raumcode');
    const hinweis = await p.locator('.hinweis').innerText();
    H.pruefe((await p.locator('label[for=spitzname]').innerText()) === 'Ihr Vorname:' && hinweis.includes('Bitte tragen Sie Ihren Vornamen ein'),
      'Abfrage des Vornamens mit Hinweis');
    for (const [name, erwartet] of [['A', '2 bis 12'], ['Mia!', 'Erlaubt sind'], ['Arsch', 'Ihren Vornamen'], ['F1ck3r', 'Ihren Vornamen']]) {
      await p.fill('#spitzname', name);
      await p.click('button[type=submit]');
      const f = await p.locator('.fehler').innerText();
      H.pruefe(f.includes(erwartet), `Spitzname „${name}“ wird abgelehnt`, f);
    }
    await p.fill('#spitzname', 'DreizehnZeichen');
    H.pruefe((await p.inputValue('#spitzname')).length === 12, 'Spitzname auf 12 Zeichen begrenzt');
    await p.fill('#spitzname', 'Jö_rg-2');
    await p.click('button[type=submit]');
    const raumFrage = await p.locator('label[for=raumcode]').innerText();
    H.pruefe(raumFrage === 'Geben Sie den vierstelligen Raumcode ein, der gerade in der Präsentation angezeigt wird.', 'Raumcode-Frage wie im Auftrag');
    H.pruefe((await p.locator('#raumcode').getAttribute('inputmode')) === 'numeric', 'Ziffernfeld (inputmode="numeric")');
    for (const code of ['12', '12a', '']) {
      await p.fill('#raumcode', code);
      await p.click('button[type=submit]');
      H.pruefe((await p.locator('.fehler').innerText()).includes('genau 4 Ziffern'), `Raumcode „${code}“ abgelehnt`);
    }
    await p.fill('#raumcode', '12345');
    H.pruefe((await p.inputValue('#raumcode')) === '1234', 'Mehr als 4 Ziffern werden abgeschnitten');
    await p.fill('#raumcode', '0815');
    await p.click('button[type=submit]');
    H.pruefe((await p.locator('#knopf-los').count()) === 1, 'Jede vierstellige Zahl wird angenommen → Startbildschirm');
    const status = await p.locator('[data-status]').innerText();
    H.pruefe(status.includes('📡 Ihre Bestleistung wird automatisch übertragen.'), 'Statuszeile ohne Rangliste', status);
    await p.reload();
    H.pruefe((await p.locator('#knopf-los').count()) === 1, 'Spitzname, Figur und Raumcode bleiben gespeichert');
    await p.evaluate(() => localStorage.setItem('kb2ab12_raum', JSON.stringify({ code: '0815', um: Date.now() - 3.1 * 3600000 })));
    await p.reload();
    H.pruefe((await p.locator('#raumcode').count()) === 1, 'Nach mehr als 3 Stunden wird der Raumcode erneut abgefragt');
    await p.fill('#raumcode', '4821');
    await p.click('button[type=submit]');
    await p.click('text=Raumcode ändern');
    H.pruefe((await p.locator('#raumcode').count()) === 1, 'Link „Raumcode ändern“ auf dem Startbildschirm');
    await ctx.close();
  }

  /* ---------- Direktlink ---------- */
  console.log('\n== Direktlink zum Spiel');
  {
    const ctx = await browser.newContext(H.MOBIL);
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'direktlink');
    await p.goto(url + '&zugang=falsch');
    H.pruefe((await p.locator('#panel').innerText()).includes('Lösen Sie zuerst beide Aufgaben.'), 'Falscher Schlüssel: Spiel bleibt gesperrt');
    const schluessel = await p.evaluate(() => CONFIG.DIREKTLINK_SCHLUESSEL);
    await p.goto(url + '&zugang=' + schluessel + '&raum=5678');
    H.pruefe((await p.locator('#spitzname').count()) === 1, 'Direktlink: ohne gelöste Aufgaben direkt zur Namenseingabe');
    await p.fill('#spitzname', 'Ole');
    await p.click('button[type=submit]');
    H.pruefe((await p.locator('#knopf-los').count()) === 1 && (await p.locator('#panel').innerText()).includes('5678'),
      'Raumcode aus dem Link ist schon eingetragen → sofort spielbar');
    await p.goto(url);
    H.pruefe((await p.locator('#knopf-los').count()) === 1, 'Neuladen ohne Schlüssel: bleibt freigeschaltet');
    H.pruefe(!(await p.evaluate(() => KB2.Freischaltung.istGeloest('aa1') || KB2.Freischaltung.istGeloest('aa2'))),
      'Direktlink schaltet die Aufgaben nicht als gelöst frei');
    await ctx.close();
  }

  /* ---------- Tastatur ---------- */
  console.log('\n== Tastatur: Springen, Ducken, Zusammenstoß');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await H.handyVorbereiten(ctx);
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'tastatur');
    await p.goto(url);
    await p.keyboard.press('Space');
    await H.warte(200);
    let z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(z.bildschirm === 'lauf', 'Leertaste startet den Lauf auf dem Startbildschirm');
    await p.keyboard.press('Space');
    await H.warte(120);
    z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(!z.amBoden && z.y < 160, 'Leertaste = springen', z.y);
    await H.warte(800);
    await p.keyboard.down('ArrowDown');
    await H.warte(150);
    z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(z.duckt && z.amBoden, 'Pfeil runter (gehalten) = ducken');
    await p.keyboard.up('ArrowDown');
    await H.warte(60);
    z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(!z.duckt, 'Loslassen beendet das Ducken');
    await p.keyboard.press('ArrowUp');
    await H.warte(100);
    z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(!z.amBoden, 'Pfeil hoch = springen');
    const ende = await H.bis(() => p.evaluate(() => PflegeSprint.zustand().bildschirm === 'ende'), { zeit: 30000 });
    H.pruefe(ende, 'Ohne Eingabe: Zusammenstoß → „Game over“');
    const t = await p.locator('#panel').innerText();
    const infos = await p.evaluate(() => INHALTE.spiel.wusstestDu);
    H.pruefe(t.includes('Game over') && /Punkte: \d+/.test(t) && t.includes('Ihre Bestleistung:') && (await p.locator('#knopf-nochmal').count()) === 1,
      'Game over zeigt Punktzahl, Bestleistung und „Nochmal“');
    H.pruefe(t.includes('Wusstest du?') && infos.some((i) => t.includes(i)), '„Wusstest du?“-Info wird angezeigt');
    const vor = await p.evaluate(() => PflegeSprint.zustand());
    const nahe = vor.objekte.some((o) => o.art !== 'zucker' && o.x < 60 && o.x > 10);
    H.pruefe(nahe, 'Zusammenstoß mit einem Hindernis an der Figur', vor.objekte);
    await H.warte(700);
    await p.click('#knopf-nochmal');
    H.pruefe((await p.evaluate(() => PflegeSprint.zustand().bildschirm)) === 'lauf', '„Nochmal“ startet einen neuen Lauf');

    // Pause, wenn die Seite in den Hintergrund geht
    await p.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const z1 = await p.evaluate(() => PflegeSprint.zustand());
    await H.warte(600);
    const z2 = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(z1.pausiert && z2.zeit === z1.zeit, 'Seite im Hintergrund → Pause (Zeit steht)');
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); });
    await p.click('#pause-hinweis');
    await H.warte(300);
    const z3 = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(!z3.pausiert && z3.zeit > z2.zeit, 'Tippen setzt das Spiel fort');
    await ctx.close();
  }

  /* ---------- Touch ---------- */
  console.log('\n== Touch (Handygröße): Springen, Ducken, kein Zoomen/Scrollen');
  {
    const ctx = await browser.newContext(H.MOBIL);
    await H.handyVorbereiten(ctx);
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'touch');
    await p.goto(url);
    await p.tap('#knopf-los');
    await H.warte(200);
    const cdp = await ctx.newCDPSession(p);
    const mitte = async (sel) => {
      const b = await p.locator(sel).boundingBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    };
    const springen = await mitte('#knopf-springen');
    const ducken = await mitte('#knopf-ducken');
    H.pruefe((await p.locator('#knopf-springen').boundingBox()).height >= 96 && (await p.locator('#knopf-springen').innerText()) === '⬆ Springen' &&
      (await p.locator('#knopf-ducken').innerText()) === '⬇ Ducken', 'Zwei große Knöpfe: links „⬇ Ducken“, rechts „⬆ Springen“');
    H.pruefe(ducken.x < springen.x, 'Ducken links, Springen rechts');
    const touch = (typ, pkt) => cdp.send('Input.dispatchTouchEvent', { type: typ, touchPoints: typ === 'touchEnd' ? [] : [{ x: pkt.x, y: pkt.y }] });

    await touch('touchStart', springen);
    await H.warte(100);
    let z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(!z.amBoden, 'Antippen „Springen“ = springen');
    await touch('touchEnd', springen);
    await H.warte(900);
    await touch('touchStart', ducken);
    await H.warte(400);
    z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(z.duckt, 'Gedrückt halten „Ducken“ = ducken, solange gedrückt');
    await touch('touchEnd', ducken);
    await H.warte(80);
    z = await p.evaluate(() => PflegeSprint.zustand());
    H.pruefe(!z.duckt, 'Loslassen beendet das Ducken');
    // Schnelles Doppeltippen: kein Zoom, kein Scrollen
    for (let i = 0; i < 4; i++) { await touch('touchStart', springen); await touch('touchEnd', springen); await H.warte(60); }
    const ansicht = await p.evaluate(() => ({ s: window.visualViewport ? visualViewport.scale : 1, y: scrollY }));
    H.pruefe(ansicht.s === 1 && ansicht.y === 0, 'Kein Zoomen oder Scrollen beim Tippen', ansicht);
    const ende = await H.bis(() => p.evaluate(() => PflegeSprint.zustand().bildschirm === 'ende'), { zeit: 30000 });
    H.pruefe(ende, 'Zusammenstoß beendet den Lauf (Touch)');

    // Querformat
    await p.setViewportSize({ width: 844, height: 390 });
    await H.warte(800);
    await p.click('#knopf-nochmal');
    await H.warte(200);
    const quer = await p.evaluate(() => {
      const r = document.getElementById('rahmen').getBoundingClientRect();
      const s = document.getElementById('steuerung').getBoundingClientRect();
      return { w: r.width, h: r.height, unten: s.bottom, hoehe: innerHeight, breite: document.documentElement.scrollWidth };
    });
    H.pruefe(quer.h >= 280 && quer.unten <= quer.hoehe + 1 && quer.breite <= 844, 'Querformat: großes Spielfeld, Knöpfe sichtbar, kein Überlauf', quer);
    await ctx.close();
  }

  /* ---------- Gleichmäßige Geschwindigkeit bei 30, 60, 120 Bildern/s ---------- */
  console.log('\n== Feste Physik-Zeitschritte: 30 / 60 / 120 Hz (je 20 s Spielzeit, virtuelle Uhr)');
  const ergebnisse = {};
  for (const hz of [30, 60, 120]) {
    const ctx = await browser.newContext(H.MOBIL);
    await H.handyVorbereiten(ctx, { test: { unverwundbar: true } });
    await ctx.addInitScript(() => {
      window.__virt = { t: 1000, cbs: [] };
      performance.now = () => window.__virt.t;
      window.requestAnimationFrame = (cb) => { window.__virt.cbs.push(cb); return window.__virt.cbs.length; };
      window.__bilder = (n, hz) => {
        for (let i = 0; i < n; i++) {
          window.__virt.t += 1000 / hz;
          const c = window.__virt.cbs; window.__virt.cbs = [];
          for (const f of c) f(window.__virt.t);
        }
      };
    });
    const p = await ctx.newPage();
    H.beobachten(p, protokoll, 'hz' + hz);
    await p.goto(url);
    await p.click('#knopf-los');
    await p.evaluate((hz) => window.__bilder(20 * hz, hz), hz);
    ergebnisse[hz] = await p.evaluate(() => ({ ...PflegeSprint.zustand(), bilder: PflegeSprint.diag.bilder, spar: PflegeSprint.diag.sparmodus }));
    console.log(`  ${hz} Hz: Spielzeit ${ergebnisse[hz].zeit.toFixed(3)} s, Strecke ${ergebnisse[hz].strecke.toFixed(1)} px, ` +
      `Tempo ${ergebnisse[hz].v.toFixed(1)} px/s, gezeichnete Bilder ${ergebnisse[hz].bilder}, Sparmodus ${ergebnisse[hz].spar ? 'an' : 'aus'}`);
    await ctx.close();
  }
  const s60 = ergebnisse[60].strecke;
  H.pruefe([30, 120].every((hz) => Math.abs(ergebnisse[hz].strecke - s60) / s60 < 0.002), 'Gleiche Strecke (±0,2 %) bei 30, 60 und 120 Hz');
  H.pruefe([30, 60, 120].every((hz) => Math.abs(ergebnisse[hz].zeit - 20) < 0.02), 'Spielzeit = Echtzeit bei allen Bildraten');
  H.pruefe(ergebnisse[120].bilder <= 20 * 60 + 2, 'Bei 120 Hz höchstens 60 Bilder/s gezeichnet', ergebnisse[120].bilder);
  H.pruefe(ergebnisse[30].spar === true && ergebnisse[60].spar === false, 'Dauerhaft < 40 Bilder/s schaltet den Sparmodus ein (30 Hz), bei 60 Hz nicht');

  console.log('\n== Konsole und externe Anfragen');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an externe Adressen (Test-Transport)', protokoll.extern);

  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
