/* Programmlogik der Zuordnungsübungen (aa1.html, aa2.html).
   Alle Texte stehen in inhalte.js – hier bitte nichts an Texten ändern. */
(function () {
  'use strict';

  var KB2 = window.KB2;
  var el = KB2.element;
  var aufgabeId = document.body.getAttribute('data-aufgabe');
  var A = INHALTE.allgemein;
  var aufgabe = INHALTE[aufgabeId];
  if (!aufgabe) return;

  var karten = aufgabe.karten;
  var speicherSchluessel = 'kb2ab12_stand_' + aufgabeId;

  function richtigeListe(karte) {
    return Array.isArray(karte.richtig) ? karte.richtig : [karte.richtig];
  }

  function erklaerungFuer(karte, kuerzel) {
    if (karte.erklaerung && typeof karte.erklaerung === 'object') {
      return karte.erklaerung[kuerzel] || '';
    }
    return karte.erklaerung || '';
  }

  // Ändern sich die Inhalte, passt ein gespeicherter Stand nicht mehr.
  var fingerabdruck = JSON.stringify([
    karten.map(function (k) { return [k.nummer, richtigeListe(k)]; }),
    aufgabe.antworten.map(function (a) { return a.kuerzel; })
  ]);

  /* ---------- Zustand ---------- */
  function leererZustand() {
    return {
      fp: fingerabdruck,
      karten: karten.map(function () { return { falsch: [], richtig: null }; })
    };
  }

  var zustand = KB2.Speicher.sitzung.lesen(speicherSchluessel);
  if (!zustand || zustand.fp !== fingerabdruck || !Array.isArray(zustand.karten) ||
      zustand.karten.length !== karten.length) {
    zustand = leererZustand();
  }

  function speichern() {
    KB2.Speicher.sitzung.schreiben(speicherSchluessel, zustand);
  }

  function anzahlRichtig() {
    var n = 0;
    zustand.karten.forEach(function (k) { if (k.richtig) n++; });
    return n;
  }

  function anzahlErsterVersuch() {
    var n = 0;
    zustand.karten.forEach(function (k) { if (k.richtig && k.falsch.length === 0) n++; });
    return n;
  }

  /* ---------- Aufbau der Seite ---------- */
  document.getElementById('kopfzeile').textContent = A.kopfzeile;
  document.getElementById('titel').textContent = aufgabe.titel;
  document.getElementById('anweisung').textContent = aufgabe.anweisung;

  // Direktlink (z. B. aa2.html?zugang=<DIREKTLINK_SCHLUESSEL>) hebt die Sperre auf (12 Stunden)
  var direktSchluessel = window.CONFIG && CONFIG.DIREKTLINK_SCHLUESSEL;
  try {
    if (direktSchluessel && new URLSearchParams(location.search).get('zugang') === direktSchluessel) {
      KB2.Speicher.dauer.schreiben('kb2ab12_direkt_' + aufgabeId, Date.now());
    }
  } catch (e) { /* alte Browser: ohne Direktlink */ }
  var direktUm = KB2.Speicher.dauer.lesen('kb2ab12_direkt_' + aufgabeId);
  var direkt = !!direktSchluessel && typeof direktUm === 'number' && Date.now() - direktUm < 12 * 3600000;

  // Gesperrt, solange die vorherige Aufgabe noch nicht gelöst wurde
  if (aufgabe.voraussetzung && !direkt && !KB2.Freischaltung.warGeloest(aufgabe.voraussetzung)) {
    document.getElementById('anweisung').textContent = '';
    document.querySelector('.fortschritt').style.display = 'none';
    document.getElementById('noch-einmal').style.display = 'none';
    var sperre = el('div', 'gesperrt');
    sperre.setAttribute('role', 'alert');
    sperre.appendChild(el('p', 'gesperrt-text', aufgabe.gesperrtText));
    var weiter = el('a', 'startlink', aufgabe.gesperrtLink);
    weiter.href = aufgabe.voraussetzung + '.html';
    sperre.appendChild(weiter);
    document.getElementById('karten').appendChild(sperre);
    return;
  }

  var fortschrittText = document.getElementById('fortschritt-text');
  var fortschrittBalken = document.getElementById('fortschritt-balken');
  var kartenBereich = document.getElementById('karten');
  var merksatzBereich = document.getElementById('merksatz-bereich');
  var nochEinmalKnopf = document.getElementById('noch-einmal');
  nochEinmalKnopf.textContent = A.nochEinmal;

  // Aufklappbare Hilfe (nur, wenn in inhalte.js vorhanden)
  if (aufgabe.hilfe) {
    var details = el('details', 'hilfe');
    details.appendChild(el('summary', null, aufgabe.hilfe.ueberschrift));
    aufgabe.hilfe.bereiche.forEach(function (b) {
      var block = el('div', 'hilfe-bereich');
      block.appendChild(el('h3', null, b.name));
      var ul = el('ul');
      b.punkte.forEach(function (p) { ul.appendChild(el('li', null, p)); });
      block.appendChild(ul);
      details.appendChild(block);
    });
    document.getElementById('hilfe-platz').appendChild(details);
  }

  var kartenElemente = [];

  karten.forEach(function (karte, index) {
    var art = el('article', 'karte');
    art.id = 'karte-' + karte.nummer;
    art.setAttribute('data-nummer', karte.nummer);

    var kopf = el('div', 'karte-kopf');
    var nummer = el('span', 'nummer', String(karte.nummer));
    nummer.setAttribute('aria-hidden', 'true');
    var text = (aufgabe.kartenAnfang ? aufgabe.kartenAnfang + ' ' : '') + karte.text;
    var aussage = el('p', 'aussage', text);
    var unsichtbar = el('span', 'nur-vorlesen', 'Aussage ' + karte.nummer + ': ');
    aussage.insertBefore(unsichtbar, aussage.firstChild);
    kopf.appendChild(nummer);
    kopf.appendChild(aussage);
    art.appendChild(kopf);

    var gruppe = el('div', 'knoepfe knoepfe-' + aufgabe.antworten.length);
    gruppe.setAttribute('role', 'group');
    gruppe.setAttribute('aria-label', 'Antwort zu Aussage ' + karte.nummer);
    var knoepfe = {};
    aufgabe.antworten.forEach(function (antwort) {
      var b = el('button', 'antwort');
      b.type = 'button';
      b.setAttribute('data-kuerzel', antwort.kuerzel);
      b.appendChild(el('span', 'symbol'));
      b.appendChild(el('span', 'beschriftung', antwort.text));
      b.addEventListener('click', function () { antworten(index, antwort.kuerzel); });
      gruppe.appendChild(b);
      knoepfe[antwort.kuerzel] = b;
    });
    art.appendChild(gruppe);

    var rueck = el('div', 'rueckmeldung');
    rueck.setAttribute('aria-live', 'polite');
    art.appendChild(rueck);

    kartenBereich.appendChild(art);
    kartenElemente.push({ karte: art, knoepfe: knoepfe, rueck: rueck });
  });

  /* ---------- Anzeige aus dem Zustand ---------- */
  function karteZeigen(index) {
    var karte = karten[index];
    var z = zustand.karten[index];
    var e = kartenElemente[index];

    e.karte.classList.toggle('ist-richtig', !!z.richtig);
    Object.keys(e.knoepfe).forEach(function (k) {
      var b = e.knoepfe[k];
      var istFalsch = z.falsch.indexOf(k) !== -1;
      var istRichtig = z.richtig === k;
      b.classList.toggle('falsch', istFalsch);
      b.classList.toggle('richtig', istRichtig);
      b.disabled = istFalsch || !!z.richtig;
      b.querySelector('.symbol').textContent = istRichtig ? '✓' : (istFalsch ? '✗' : '');
      var zusatz = istRichtig ? ' – richtig' : (istFalsch ? ' – falsch' : '');
      b.setAttribute('aria-label', b.querySelector('.beschriftung').textContent + zusatz);
    });

    e.rueck.textContent = '';
    e.rueck.className = 'rueckmeldung';
    if (z.richtig) {
      e.rueck.classList.add('ist-richtig');
      var t = el('p', 'rueck-titel');
      t.appendChild(el('span', 'symbol', '✓'));
      t.appendChild(document.createTextNode(' ' + A.richtigText));
      e.rueck.appendChild(t);
      e.rueck.appendChild(el('p', 'rueck-text', erklaerungFuer(karte, z.richtig)));
    } else if (z.falsch.length > 0) {
      e.rueck.classList.add('ist-falsch');
      var f = el('p', 'rueck-titel');
      f.appendChild(el('span', 'symbol', '✗'));
      f.appendChild(document.createTextNode(' ' + A.falschText));
      e.rueck.appendChild(f);
      var tipp = el('p', 'rueck-text');
      tipp.appendChild(el('strong', null, A.tippVorwort + ' '));
      tipp.appendChild(document.createTextNode(karte.tipp));
      e.rueck.appendChild(tipp);
    }
  }

  function fortschrittZeigen() {
    var n = anzahlRichtig();
    fortschrittText.textContent = KB2.ersetzen(A.fortschritt, { x: n, y: karten.length });
    fortschrittBalken.style.width = Math.round(n / karten.length * 100) + '%';
  }

  // Merksatz-Absatz: **Wort** wird fett und unterstrichen hervorgehoben, \n bricht die Zeile um
  function merksatzAbsatz(text) {
    var p = el('p', 'merksatz-text');
    // \n im Text = Zeilenumbruch
    String(text).split('\n').forEach(function (zeile, z) {
      if (z > 0) p.appendChild(document.createElement('br'));
      zeile.split('**').forEach(function (teil, i) {
        if (!teil) return;
        p.appendChild(i % 2 ? el('strong', 'betont', teil) : document.createTextNode(teil));
      });
    });
    return p;
  }

  // Der Merksatz wird erst nach vollständiger Lösung in die Seite eingefügt.
  function merksatzZeigen(scrollen) {
    merksatzBereich.textContent = '';
    if (anzahlRichtig() !== karten.length) {
      merksatzBereich.hidden = true;
      return;
    }

    // Zu viele Fehlversuche (Durchklicken)? Dann kein Merksatz, sondern neu starten.
    var mindestens = aufgabe.mindestensErsterVersuch || 0;
    if (anzahlErsterVersuch() < mindestens) {
      var warnung = el('section', 'durchklicken');
      warnung.setAttribute('role', 'alert');
      warnung.appendChild(el('h2', null, A.durchklickenTitel));
      warnung.appendChild(el('p', null, KB2.ersetzen(A.durchklickenText,
        { x: anzahlErsterVersuch(), y: karten.length, z: mindestens })));
      var neu = el('button', 'knopf durchklicken-knopf', A.durchklickenKnopf);
      neu.type = 'button';
      neu.addEventListener('click', zuruecksetzen);
      warnung.appendChild(neu);
      merksatzBereich.appendChild(warnung);
      merksatzBereich.hidden = false;
      if (scrollen) {
        setTimeout(function () { warnung.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
      }
      return;
    }

    KB2.Freischaltung.alsGeloestMerken(aufgabeId);

    var kasten = el('section', 'merksatz');
    kasten.setAttribute('aria-labelledby', 'merksatz-ueberschrift');
    var h = el('h2', null, A.merksatzUeberschrift);
    h.id = 'merksatz-ueberschrift';
    kasten.appendChild(h);
    kasten.appendChild(merksatzAbsatz(aufgabe.merksatz));
    kasten.appendChild(el('p', 'merksatz-hinweis', A.merksatzHinweis));
    kasten.appendChild(el('p', 'erster-versuch',
      KB2.ersetzen(A.ersterVersuch, { x: anzahlErsterVersuch(), y: karten.length })));

    // Belohnung: nur am Ende von Arbeitsauftrag 2 und erst, wenn
    // beide Aufgaben vollständig richtig gelöst sind
    if (aufgabeId === 'aa2' && anzahlRichtig() === karten.length && KB2.Freischaltung.beideGeloest()) {
      var ei = el('a', 'easter-egg', A.easterEggKnopf);
      ei.href = 'spiel.html';
      kasten.appendChild(ei);
    }

    merksatzBereich.appendChild(kasten);
    merksatzBereich.hidden = false;

    if (scrollen) {
      var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () {
        kasten.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'center' });
      }, 150);
    }
  }

  function allesZeigen(scrollen) {
    for (var i = 0; i < karten.length; i++) karteZeigen(i);
    fortschrittZeigen();
    merksatzZeigen(scrollen);
  }

  /* ---------- Antworten ---------- */
  function antworten(index, kuerzel) {
    var z = zustand.karten[index];
    if (z.richtig || z.falsch.indexOf(kuerzel) !== -1) return;
    var vorher = anzahlRichtig();

    if (richtigeListe(karten[index]).indexOf(kuerzel) !== -1) z.richtig = kuerzel;
    else z.falsch.push(kuerzel);

    speichern();
    karteZeigen(index);
    fortschrittZeigen();
    if (vorher !== karten.length && anzahlRichtig() === karten.length) merksatzZeigen(true);
  }

  nochEinmalKnopf.addEventListener('click', zuruecksetzen);
  function zuruecksetzen() {
    KB2.Freischaltung.zuruecknehmen(aufgabeId);
    zustand = leererZustand();
    speichern();
    allesZeigen(false);
    var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: ruhig ? 'auto' : 'smooth' });
  }

  allesZeigen(false);
})();
