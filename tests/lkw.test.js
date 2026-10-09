/* KBS-Lkw: Mit einfachem Sprung bei keinem Tempo zu schaffen, mit Doppelsprung
 * (am höchsten Punkt) bei jedem Tempo. Geprüft mit der echten Spielphysik
 * (virtuelle Uhr, ein Lkw wird gezielt vor die Figur gesetzt). */
'use strict';
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const ctx = await browser.newContext(H.MOBIL);
  await H.handyVorbereiten(ctx);
  await ctx.addInitScript(() => {
    window.__virt = { t: 1000, cbs: [] };
    performance.now = () => window.__virt.t;
    window.requestAnimationFrame = (cb) => { window.__virt.cbs.push(cb); return 1; };
  });
  const p = await ctx.newPage();
  await p.goto(basis + 'spiel.html?transport=test');
  for (const sekunde of [31, 45, 60, 80, 99]) {
    for (const doppelt of [false, true]) {
      // Bester Absprungpunkt wird durchprobiert
      let geschafft = false;
      for (let vorlauf = 0; vorlauf < 70 && !geschafft; vorlauf++) {
        geschafft = await p.evaluate(({ sekunde, doppelt, vorlauf }) => PflegeSprint.lkwTest(sekunde, doppelt, vorlauf), { sekunde, doppelt, vorlauf });
      }
      const v = await p.evaluate((s) => PflegeSprint.tempo(s), sekunde);
      if (doppelt) H.pruefe(geschafft, `Tempo ${Math.round(v)} px/s (nach ${sekunde} s): Lkw mit Doppelsprung schaffbar`);
      else H.pruefe(!geschafft, `Tempo ${Math.round(v)} px/s (nach ${sekunde} s): Lkw mit einfachem Sprung nicht schaffbar`);
    }
  }
  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
