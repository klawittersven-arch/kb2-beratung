/* Ende-zu-Ende-Test im Echtbetrieb: PeerJS-Cloud-Vermittlungsdienst + WebRTC.
 * Braucht Internetzugang. Ein „Laptop“ und zwei „Handys“ in getrennten Browser-Kontexten. */
'use strict';
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const raum = String(1000 + Math.floor(Math.random() * 9000));
  console.log(`\n== Echtbetrieb über PeerJS (Raumcode ${raum})`);

  const lctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const L = await lctx.newPage();
  L.on('pageerror', (e) => protokoll.konsole.push('[rangliste] ' + e.message));
  await L.goto(basis + 'rangliste.html?raum=' + raum);
  const bereit = await H.bis(() => L.evaluate(() => Rangliste.empfaenger().zustand === 'bereit'), { zeit: 20000 });
  H.pruefe(bereit, 'Rangliste ist beim PeerJS-Dienst angemeldet');

  const handys = [];
  for (const [name, figur] of [['Ida', 'lina'], ['Ole', 'tim']]) {
    const ctx = await browser.newContext(H.MOBIL);
    await H.handyVorbereiten(ctx, { spitzname: name, figur, raum, test: {} });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => protokoll.konsole.push(`[${name}] ` + e.message));
    await p.goto(basis + 'spiel.html');
    await H.warte(800);
    await p.click('#knopf-los');
    await H.bis(() => p.evaluate(() => PflegeSprint.zustand().bildschirm === 'ende'), { zeit: 40000 });
    handys.push({ name, p, punkte: await p.evaluate(() => PflegeSprint.diag.letztePunkte) });
  }
  const t0 = Date.now();
  const da = await H.bis(async () => {
    const e = await L.evaluate(() => Rangliste.eintraege());
    return handys.every((h) => e.some((x) => x.name === h.name && x.punkte === h.punkte));
  }, { zeit: 45000 });
  H.pruefe(da, `Beide Bestleistungen kommen per WebRTC an (nach ${((Date.now() - t0) / 1000).toFixed(1)} s)`, await L.evaluate(() => Rangliste.eintraege()));
  const st = await handys[0].p.locator('[data-status]').innerText();
  H.pruefe(st.includes('ist auf der Rangliste'), 'Handy zeigt „Ihre Bestleistung ist auf der Rangliste.“', st);

  const zweit = await browser.newContext();
  const L2 = await zweit.newPage();
  await L2.goto(basis + 'rangliste.html?raum=' + raum);
  H.pruefe(await H.bis(() => L2.locator('#belegt').isVisible(), { zeit: 20000 }), 'Zweite Rangliste mit gleichem Code: „schon verwendet“ (vom echten Dienst gemeldet)');

  await L.reload();
  H.pruefe(await H.bis(() => L.evaluate(() => Rangliste.empfaenger().zustand === 'bereit'), { zeit: 20000 }), 'Neuladen der Rangliste: wieder angemeldet (gleiches Token)');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Skriptfehler', protokoll.konsole);
  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
