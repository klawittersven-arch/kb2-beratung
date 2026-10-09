/* Schwierigkeit: Ein automatischer „Profi-Spieler“ (sieht jedes Hindernis sofort,
 * reagiert ohne Verzögerung, nutzt Ducken, schnelles Landen und Doppelsprung) spielt viele Läufe.
 * Ziel: die ersten 30 Sekunden schafft er fast immer, länger als 2 Minuten nie.
 * Aufruf: node tests/schwierigkeit.test.js [Anzahl Läufe, Standard 30] */
'use strict';
const H = require('./hilfen');
const LAEUFE = +(process.argv[2] || 30);

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const ctx = await browser.newContext(H.MOBIL);
  await H.handyVorbereiten(ctx);
  await ctx.addInitScript(() => {
    // virtuelle Uhr: 60 Bilder pro Sekunde, so schnell wie möglich durchgerechnet
    window.__virt = { t: 1000, cbs: [] };
    performance.now = () => window.__virt.t;
    window.requestAnimationFrame = (cb) => { window.__virt.cbs.push(cb); return 1; };
  });
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', (e) => fehler.push(e.message));
  await p.goto(basis + 'spiel.html?transport=test');

  const zeiten = [];
  for (let lauf = 0; lauf < LAEUFE; lauf++) {
    const z = await p.evaluate(() => {
      const taste = (typ, key) => document.dispatchEvent(new KeyboardEvent(typ, { key, bubbles: true }));
      const knopf = document.getElementById('knopf-nochmal') || document.getElementById('knopf-los');
      window.__virt.t += 1000; // Sperre nach Game over abwarten
      knopf.click();
      let springt = false, duckt = false;
      const g = 1500;
      for (let bild = 0; bild < 60 * 300; bild++) {
        const s = PflegeSprint.zustand();
        if (s.bildschirm !== 'lauf') break;
        const vorne = s.objekte.filter((o) => o.art !== 'zucker' && o.x + o.b > 38).sort((a, b) => a.x - b.x);
        const boden = vorne.filter((o) => o.art !== 'schwarm');
        const wespe = vorne.find((o) => o.art === 'schwarm');
        const naechstes = boden[0];
        let jetztSpringen = false, ducken = false;
        if (s.amBoden) {
          if (wespe && wespe.x - 48 < s.v * 0.3 && (!naechstes || naechstes.x > wespe.x + wespe.b)) ducken = true;
          else if (naechstes) {
            const d = naechstes.x - 48;
            const ausloeser = naechstes.art === 'loch' ? s.v * 0.04 + 1 : s.v * 0.1 + 2;
            if (d < ausloeser) jetztSpringen = true;
          }
        } else if (naechstes) {
          // fallend: würde die Landung auf einem Hindernis oder in einem Loch enden? → Doppelsprung
          const hoehe = 160 - s.y;
          const tLand = Math.sqrt(2 * Math.max(0, hoehe) / g);
          const landX = 44 + s.v * tLand;
          const gefahr = boden.some((o) => landX > o.x - 6 && landX < o.x + o.b + 8);
          if (gefahr && s.vy > -40 && !window.__doppelt) { jetztSpringen = true; window.__doppelt = true; }
        }
        // Schwarm kommt, während man noch in der Luft ist: ducken = schneller landen
        if (!s.amBoden && wespe && wespe.x - 48 < s.v * 0.55) { ducken = true; jetztSpringen = false; }
        if (s.amBoden) window.__doppelt = false;
        if (jetztSpringen) { if (springt) taste('keyup', ' '); taste('keydown', ' '); springt = true; }
        else if (springt && !s.amBoden && s.y < 110) { taste('keyup', ' '); springt = false; }
        else if (springt && s.amBoden) { taste('keyup', ' '); springt = false; }
        if (ducken !== duckt) { taste(ducken ? 'keydown' : 'keyup', 'ArrowDown'); duckt = ducken; }
        // ein Bild weiter
        window.__virt.t += 1000 / 60;
        const c = window.__virt.cbs; window.__virt.cbs = [];
        for (const f of c) f(window.__virt.t);
      }
      if (springt) taste('keyup', ' ');
      if (duckt) taste('keyup', 'ArrowDown');
      return PflegeSprint.zustand();
    });
    zeiten.push(Math.round(z.zeit * 10) / 10);
  }
  zeiten.sort((a, b) => a - b);
  const q = (x) => zeiten[Math.min(zeiten.length - 1, Math.floor(x * zeiten.length))];
  console.log(`\n== ${LAEUFE} Läufe des Profi-Spielers (Spielzeit in Sekunden)`);
  console.log('  ' + zeiten.join(', '));
  console.log(`  kürzester ${zeiten[0]} s · Median ${q(0.5)} s · 90 %-Quantil ${q(0.9)} s · längster ${zeiten[zeiten.length - 1]} s`);
  const ueber30 = zeiten.filter((t) => t >= 30).length;
  H.pruefe(ueber30 / zeiten.length >= 0.8, `Die ersten 30 Sekunden schafft der Profi-Spieler meist (${ueber30} von ${zeiten.length})`);
  H.pruefe(zeiten[zeiten.length - 1] < 120, 'Kein Lauf dauert 2 Minuten oder länger');
  H.pruefe(fehler.length === 0, 'Keine Skriptfehler', fehler);
  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
