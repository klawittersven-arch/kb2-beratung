/* Vergleicht alle Texte in docs/inhalte.js Zeichen für Zeichen mit dem Auftrag
 * (Prompt_ClaudeCode_AB12_digital_mit_Spiel.txt im Hauptverzeichnis). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const H = require('./hilfen');

const wurzel = path.resolve(__dirname, '..');
const auftrag = fs.readFileSync(path.join(wurzel, 'Prompt_ClaudeCode_AB12_digital_mit_Spiel.txt'), 'utf8').replace(/\r/g, '');
const kiste = {};
vm.runInNewContext(fs.readFileSync(path.join(wurzel, 'docs', 'inhalte.js'), 'utf8') + ';this.INHALTE = INHALTE;', kiste);
const I = kiste.INHALTE;

function abschnitt(von, bis) {
  const a = auftrag.indexOf(von);
  const b = bis ? auftrag.indexOf(bis, a + 1) : auftrag.length;
  if (a < 0 || b < 0) throw new Error('Abschnitt nicht gefunden: ' + von);
  return auftrag.slice(a, b).split('\n');
}

function gleich(ist, soll, text) {
  if (ist === soll) { H.pruefe(true, text); return; }
  let i = 0;
  while (i < Math.min(ist.length, soll.length) && ist[i] === soll[i]) i++;
  H.pruefe(false, text, { ab: i, ist: ist.slice(Math.max(0, i - 10), i + 20), soll: soll.slice(Math.max(0, i - 10), i + 20) });
}

function kartenAusAuftrag(zeilen) {
  const karten = [];
  let k = null;
  for (const roh of zeilen) {
    const z = roh.trim();
    let m;
    if ((m = z.match(/^(\d+)\. „(.*)“$/))) { k = { nummer: +m[1], text: m[2], erkl: {} }; karten.push(k); }
    else if (k && (m = z.match(/^Richtig: (\S+)(.*)$/))) {
      k.richtig = [m[1]];
      const zusatz = m[2].match(/ACHTUNG: (\S+) wird ebenfalls als richtig gewertet/);
      if (zusatz) k.richtig.push(zusatz[1]);
    } else if (k && (m = z.match(/^Erklärung bei (\S+): (.*)$/))) k.erkl[m[1]] = m[2];
    else if (k && (m = z.match(/^Erklärung: (.*)$/))) k.erkl._ = m[1];
    else if (k && (m = z.match(/^Tipp: (.*)$/))) k.tipp = m[1];
  }
  return karten;
}

function aufgabePruefen(name, daten, zeilen, merksatzKenn, zusatz) {
  console.log(`\n== ${name}`);
  const titel = zeilen.find((z) => z.startsWith('Titel: ')).slice(7);
  const anweisung = zeilen.find((z) => z.startsWith('Arbeitsanweisung: ')).slice(18);
  gleich(daten.titel, titel, 'Titel');
  gleich(daten.anweisung, anweisung, 'Arbeitsanweisung');
  const soll = kartenAusAuftrag(zeilen);
  // zusatz: später auf Wunsch ergänzte Karten bzw. geänderter Merksatz (nicht im ursprünglichen Auftrag)
  H.pruefe(soll.length + (zusatz ? zusatz.karten : 0) === daten.karten.length, `Anzahl Karten ${soll.length}` + (zusatz ? ` + ${zusatz.karten} ergänzte` : ''));
  soll.forEach((s, i) => {
    const k = daten.karten[i];
    H.pruefe(k.nummer === s.nummer, `Karte ${s.nummer}: Nummer`);
    gleich(k.text, s.text, `Karte ${s.nummer}: Aussage`);
    const r = Array.isArray(k.richtig) ? k.richtig : [k.richtig];
    H.pruefe(JSON.stringify(r) === JSON.stringify(s.richtig), `Karte ${s.nummer}: richtige Antwort(en) ${s.richtig.join(' + ')}`, r);
    if (s.erkl._ !== undefined) gleich(k.erklaerung, s.erkl._, `Karte ${s.nummer}: Erklärung`);
    else Object.keys(s.erkl).forEach((b) => gleich(k.erklaerung[b], s.erkl[b], `Karte ${s.nummer}: Erklärung bei ${b}`));
    gleich(k.tipp, s.tipp, `Karte ${s.nummer}: Tipp`);
  });
  if (zusatz && zusatz.merksatz) {
    H.pruefe(daten.merksatz === zusatz.merksatz, 'Merksatz (überarbeitete Fassung)');
    return;
  }
  const merksatz = zeilen.find((z) => z.startsWith(merksatzKenn)).slice(merksatzKenn.length);
  gleich(daten.merksatz, merksatz, 'Merksatz');
}

aufgabePruefen('Arbeitsauftrag 1', I.aa1, abschnitt('== Inhalte Arbeitsauftrag 1', '== Inhalte Arbeitsauftrag 2'), 'Merksatz AA1: ', {
  karten: 5,
  merksatz: 'Situativ wird ein Beratungsbedarf **erkannt** – geplant wird er in Ruhe **bearbeitet**: Komplexe, emotionale oder konfliktreiche Themen brauchen einen vereinbarten Termin.'
});
const aa2Zeilen = abschnitt('== Inhalte Arbeitsauftrag 2', '== Easter Egg');
aufgabePruefen('Arbeitsauftrag 2 a)', I.aa2, aa2Zeilen, 'Merksatz AA2a: ', {
  karten: 0,
  merksatz: 'Fach im Kopf, Methode in der Hand,\nsozial mit Herz – und personal: den Blick auf mich gewandt.'
});
H.pruefe(aa2Zeilen.some((z) => z.includes('Jede Karte beginnt mit „' + I.aa2.kartenAnfang + ' …“.')), 'AA2a: Karten beginnen mit „Lina …“');

console.log('\n== Hilfe „Die vier Kompetenzbereiche“');
const hilfeSoll = aa2Zeilen.filter((z) => /^- [^:]+kompetenz: /i.test(z)).map((z) => {
  const m = z.match(/^- ([^:]+): (.*)$/);
  return { name: m[1], punkte: m[2].split('; ') };
});
H.pruefe(hilfeSoll.length === 4 && I.aa2.hilfe.bereiche.length === 4, 'Vier Bereiche');
hilfeSoll.forEach((b, i) => {
  gleich(I.aa2.hilfe.bereiche[i].name, b.name, `Bereichsname ${b.name}`);
  gleich(I.aa2.hilfe.bereiche[i].punkte.join(' | '), b.punkte.join(' | '), `Stichpunkte ${b.name}`);
});
H.pruefe(auftrag.includes('„' + I.aa2.hilfe.ueberschrift + '“'), 'Überschrift der Hilfe');

console.log('\n== „Wusstest du?“');
const wusstestSoll = auftrag.split('\n').filter((z) => /^\s+• /.test(z)).map((z) => z.replace(/^\s+• /, ''));
gleich(I.spiel.wusstestDu.join(' | '), wusstestSoll.join(' | '), 'Fünf Infos');

console.log('\n== Weitere wörtliche Texte');
const woertlich = [
  I.allgemein.kopfzeile, I.allgemein.merksatzUeberschrift, I.allgemein.merksatzHinweis, I.allgemein.nochEinmal,
  ...I.aa1.antworten.map((a) => a.text), ...I.aa2.antworten.map((a) => a.text),
  I.spiel.gesperrt, I.spiel.spitznameHinweis, I.spiel.raumcodeFrage, I.spiel.knopfDucken, I.spiel.knopfSpringen,
  I.spiel.statusVerbunden, I.spiel.statusWartet, I.spiel.statusPruefen,
  I.rangliste.raumcodeFrage, I.rangliste.starten, I.rangliste.vorschlagen,
  I.rangliste.nachzuegler, I.rangliste.belegt, I.rangliste.ausblenden, I.rangliste.leeren
];
woertlich.forEach((t) => H.pruefe(auftrag.includes(t), `„${t}“ steht so im Auftrag`));
H.pruefe(auftrag.includes(I.allgemein.ersterVersuch.replace('{x}', 'x').replace('{y}', 'y')), 'Vorlage „Beim ersten Versuch richtig: x von y“');
H.pruefe(auftrag.includes(I.rangliste.warten.replace(' …', '')), 'Wartetext der Rangliste');

process.exit(H.ergebnis() ? 0 : 1);
