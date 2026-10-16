/* Lernkarten – Programmlogik. Die Texte stehen in karten.js. */
(function () {
  'use strict';

  var D = window.LERNKARTEN;
  var T = D.texte;
  var SCHLUESSEL = 'lernkarten:' + (D.speicherName || 'standard');

  /* ---------- Hilfen ---------- */
  function $(id) { return document.getElementById(id); }

  function ersetzen(text, werte) {
    return String(text).replace(/\{(\w+)\}/g, function (_, k) { return werte[k] !== undefined ? werte[k] : ''; });
  }

  // Kurzer Fingerabdruck eines Textes (für stabile Karten-Kennungen)
  function kennung(text) {
    var h = 5381;
    for (var i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function maskieren(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // **fett**, *kursiv*, Zeilenumbruch (\n oder <br>)
  function formatieren(text) {
    return maskieren(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/&lt;br\s*\/?&gt;|\n/g, '<br>');
  }

  function mischen(liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function wenigerBewegung() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Karten vorbereiten ---------- */
  var THEMEN = [];
  var KARTEN = {};     // id → Karte
  var REIHENFOLGE = []; // alle ids in der Reihenfolge der Ich-kann-Liste

  D.themen.forEach(function (t) {
    var ab = t.ab ? [].concat(t.ab) : null;
    var name = ab ? ab.join(' / ') : t.titel;
    var thema = {
      id: 't' + kennung(name),
      name: name,
      kopf: ab ? 'AB „' + ab.join('“ / „') + '“' : t.titel,
      karten: []
    };
    t.karten.forEach(function (k) {
      var id = 'k' + kennung(k.vorne + '|' + (k.fall || ''));
      if (KARTEN[id]) { id += '-' + REIHENFOLGE.length; } // gleiche Vorderseite doppelt: trotzdem eindeutig
      var karte = { id: id, thema: thema, daten: k };
      KARTEN[id] = karte;
      REIHENFOLGE.push(id);
      thema.karten.push(id);
    });
    THEMEN.push(thema);
  });

  /* ---------- Speicher (alles abgesichert: Seite läuft auch ohne) ---------- */
  var lager = null;
  try {
    lager = window.localStorage;
    lager.setItem('__probe__', '1');
    lager.removeItem('__probe__');
  } catch (e) { lager = null; }

  var zustand = { stand: {}, abgewaehlt: [], mischen: false, runde: null };
  try {
    var roh = lager && lager.getItem(SCHLUESSEL);
    var gelesen = roh ? JSON.parse(roh) : null;
    if (gelesen && typeof gelesen === 'object') {
      if (gelesen.stand && typeof gelesen.stand === 'object') zustand.stand = gelesen.stand;
      if (Array.isArray(gelesen.abgewaehlt)) zustand.abgewaehlt = gelesen.abgewaehlt;
      zustand.mischen = !!gelesen.mischen;
      zustand.runde = rundePruefen(gelesen.runde);
    }
  } catch (e) { /* beschädigter Speicher → neu beginnen */ }

  function speichern() {
    if (!lager) return;
    try { lager.setItem(SCHLUESSEL, JSON.stringify(zustand)); } catch (e) { /* voll oder gesperrt */ }
  }

  // Gespeicherte Runde an geänderte karten.js anpassen
  function rundePruefen(r) {
    if (!r || !Array.isArray(r.ids)) return null;
    var ergebnis = (r.ergebnis && typeof r.ergebnis === 'object') ? r.ergebnis : {};
    var ids = r.ids.filter(function (id) { return KARTEN[id]; });
    if (!ids.length) return null;
    var pos = ids.filter(function (id) { return ergebnis[id]; }).length;
    var verlauf = Array.isArray(r.verlauf) ? r.verlauf.filter(function (v) { return v && KARTEN[v.id]; }) : [];
    return { ids: ids, pos: Math.min(pos, ids.length), ergebnis: ergebnis, verlauf: verlauf };
  }

  function rundeLaeuft() {
    return !!(zustand.runde && zustand.runde.pos < zustand.runde.ids.length);
  }

  function themaGewaehlt(thema) { return zustand.abgewaehlt.indexOf(thema.id) === -1; }

  function gewaehlteKarten() {
    var ids = [];
    THEMEN.forEach(function (t) { if (themaGewaehlt(t)) ids = ids.concat(t.karten); });
    return ids;
  }

  function gewusst(ids) {
    return ids.filter(function (id) { return zustand.stand[id] === 'g'; }).length;
  }

  /* ---------- Ansichten ---------- */
  var ansichten = { start: $('ansicht-start'), lernen: $('ansicht-lernen'), ergebnis: $('ansicht-ergebnis') };
  var aktuelleAnsicht = 'start';

  function zeige(name) {
    aktuelleAnsicht = name;
    Object.keys(ansichten).forEach(function (n) { ansichten[n].hidden = n !== name; });
    window.scrollTo(0, 0);
  }

  function ansagen(text) {
    var a = $('ansage');
    a.textContent = '';
    setTimeout(function () { a.textContent = text; }, 30);
  }

  /* ================= Übersicht ================= */
  function texteEinsetzen() {
    $('titel').textContent = D.titel;
    $('untertitel').textContent = D.untertitel;
    $('klausur').textContent = D.klausur;
    $('themen-ueberschrift').textContent = T.themenWaehlen;
    $('alle-themen').textContent = T.alleThemen;
    $('keine-themen').textContent = T.keineThemen;
    $('mischen-text').textContent = T.mischen;
    $('bedienung').textContent = T.bedienung;
    $('datenschutz').textContent = T.datenschutz;
    $('zuruecksetzen').textContent = T.zuruecksetzen;
    $('schliessen-text').textContent = T.beenden;
    $('ergebnis-schliessen-text').textContent = T.beenden;
    $('zurueck-text').textContent = T.zurueck;
    $('ergebnis-zurueck-text').textContent = T.zurueck;
    $('nochnicht-text').textContent = T.nochNicht;
    $('gewusst-text').textContent = T.gewusst;
    $('umdreh-text').textContent = T.umdrehen;
    $('marke-links').textContent = T.nochNicht;
    $('marke-rechts').textContent = T.gewusst;
    $('knopf-uebersicht').textContent = T.beenden;
    document.title = 'Lernkarten ' + D.titel;
  }

  function themenAufbauen() {
    var ul = $('themen');
    ul.textContent = '';
    THEMEN.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'thema';
      var label = document.createElement('label');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = themaGewaehlt(t);
      box.addEventListener('change', function () {
        var i = zustand.abgewaehlt.indexOf(t.id);
        if (box.checked && i !== -1) zustand.abgewaehlt.splice(i, 1);
        if (!box.checked && i === -1) zustand.abgewaehlt.push(t.id);
        speichern();
        startAktualisieren();
      });
      var titel = document.createElement('span');
      titel.className = 'thema-titel';
      titel.textContent = t.name;
      var stand = document.createElement('span');
      stand.className = 'thema-stand';
      var zahl = document.createElement('span');
      var g = gewusst(t.karten), n = t.karten.length;
      zahl.textContent = ersetzen(T.stand, { x: g, y: n });
      if (g === n) zahl.className = 'fertig';
      var balken = document.createElement('span');
      balken.className = 'balken';
      balken.setAttribute('aria-hidden', 'true');
      var f = document.createElement('span');
      f.className = 'balken-fuellung';
      f.style.width = (n ? (100 * g / n) : 0) + '%';
      balken.appendChild(f);
      stand.appendChild(zahl);
      stand.appendChild(balken);
      label.appendChild(box);
      label.appendChild(titel);
      label.appendChild(stand);
      li.appendChild(label);
      ul.appendChild(li);
    });
  }

  function startAktualisieren() {
    var alle = REIHENFOLGE;
    var g = gewusst(alle);
    $('gesamt-text').textContent = ersetzen(T.gesamt, { x: g, y: alle.length });
    $('gesamt-balken').style.width = (100 * g / alle.length) + '%';
    $('mischen').checked = zustand.mischen;

    var gewaehlt = gewaehlteKarten();
    var offen = gewaehlt.length - gewusst(gewaehlt);
    var k1 = $('knopf-start'), k2 = $('knopf-start-2');
    k1.disabled = false;
    k2.hidden = true;

    if (rundeLaeuft()) {
      var r = zustand.runde;
      k1.textContent = T.weiterlernen + ' · ' + ersetzen(T.weiterlernenInfo, { x: r.pos + 1, y: r.ids.length });
      k1.dataset.aktion = 'weiter';
      if (gewaehlt.length) {
        k2.hidden = false;
        if (offen > 0 && offen < gewaehlt.length) {
          k2.textContent = ersetzen(T.nurOffene, { x: offen });
          k2.dataset.aktion = 'offen';
        } else {
          k2.textContent = ersetzen(T.alleNeu, { x: gewaehlt.length });
          k2.dataset.aktion = 'alle';
        }
      }
    } else if (!gewaehlt.length) {
      k1.textContent = T.start;
      k1.disabled = true;
      k1.dataset.aktion = '';
    } else if (offen > 0 && offen < gewaehlt.length) {
      k1.textContent = ersetzen(T.nurOffene, { x: offen });
      k1.dataset.aktion = 'offen';
      k2.hidden = false;
      k2.textContent = ersetzen(T.alleNeu, { x: gewaehlt.length });
      k2.dataset.aktion = 'alle';
    } else {
      k1.textContent = ersetzen(T.alleNeu, { x: gewaehlt.length });
      k1.dataset.aktion = 'alle';
    }
  }

  function zeigeStart() {
    themenAufbauen();
    startAktualisieren();
    zeige('start');
  }

  function startAktion(aktion) {
    if (aktion === 'weiter') { lernenZeigen(); return; }
    if (aktion === 'offen' || aktion === 'alle') rundeStarten(aktion === 'offen' ? 'offen' : 'alle');
  }

  /* ================= Runde ================= */
  function rundeStarten(art, ids) {
    var liste = ids || gewaehlteKarten();
    if (art === 'offen') liste = liste.filter(function (id) { return zustand.stand[id] !== 'g'; });
    if (!liste.length) { zeigeStart(); return; }
    if (zustand.mischen) liste = mischen(liste);
    zustand.runde = { ids: liste, pos: 0, ergebnis: {}, verlauf: [] };
    speichern();
    lernenZeigen();
  }

  function lernenZeigen() {
    zeige('lernen');
    karteZeigen(false);
    $('karte').focus({ preventScroll: true });
  }

  var umgedreht = false;
  var sperre = false; // während der Wegflug-Animation keine weiteren Eingaben

  function karteZeigen(mitAnimation) {
    var r = zustand.runde;
    var karte = KARTEN[r.ids[r.pos]];
    var k = karte.daten;
    var el = $('karte');

    // ohne Dreh-Animation auf die Vorderseite zurück
    el.classList.add('ohne-animation');
    el.classList.remove('umgedreht', 'fliegt', 'zieht', 'zurueckfedern');
    el.style.transform = '';
    markenSetzen(0);
    umgedreht = false;

    $('vorne-kopf').textContent = karte.thema.kopf + (k.nr ? ' · Nr. ' + k.nr : '');
    $('vorne-text').innerHTML = formatieren(k.vorne);
    var fall = $('vorne-fall');
    fall.hidden = !k.fall;
    fall.innerHTML = k.fall ? formatieren(k.fall) : '';

    $('hinten-kopf').textContent = T.rueckseite;
    var hinten = $('hinten-text');
    hinten.textContent = '';
    if (Array.isArray(k.hinten)) {
      var liste = document.createElement(k.nummeriert ? 'ol' : 'ul');
      if (k.nummeriert && k.start) liste.start = k.start;
      k.hinten.forEach(function (punkt) {
        var li = document.createElement('li');
        li.innerHTML = formatieren(punkt);
        liste.appendChild(li);
      });
      hinten.appendChild(liste);
    } else {
      var p = document.createElement('p');
      p.innerHTML = formatieren(k.hinten);
      hinten.appendChild(p);
    }
    var hinweis = $('hinten-hinweis');
    hinweis.hidden = !k.hinweis;
    hinweis.innerHTML = k.hinweis ? formatieren(k.hinweis) : '';

    seitenSichtbarkeit();
    void el.offsetWidth; // Umstellung ohne Animation übernehmen
    el.classList.remove('ohne-animation');

    if (mitAnimation && !wenigerBewegung()) {
      el.classList.remove('erscheint');
      void el.offsetWidth;
      el.classList.add('erscheint');
    }
    lernKopfAktualisieren();
    ansagen($('zaehler').textContent + '. ' + sichtbarerText());
  }

  // Bildschirmleser: nur die sichtbare Seite vorlesen
  function seitenSichtbarkeit() {
    $('seite-vorne').setAttribute('aria-hidden', umgedreht ? 'true' : 'false');
    $('seite-hinten').setAttribute('aria-hidden', umgedreht ? 'false' : 'true');
    var text = sichtbarerText();
    $('karte').setAttribute('aria-label', text + (umgedreht ? '' : ' – ' + T.umdrehen));
    return text;
  }

  function sichtbarerText() {
    var seite = umgedreht ? $('seite-hinten') : $('seite-vorne');
    var teile = [];
    seite.querySelectorAll('.kompetenz, .fall:not([hidden]), li, .antwort > p, .hinweis:not([hidden])').forEach(function (e) {
      teile.push(e.textContent.replace(/\s+/g, ' ').trim());
    });
    return (umgedreht ? T.rueckseite : T.vorderseite) + ': ' + teile.join(' ');
  }

  function lernKopfAktualisieren() {
    var r = zustand.runde;
    $('zaehler').textContent = Math.min(r.pos + 1, r.ids.length) + ' / ' + r.ids.length;
    $('runden-balken').style.width = (100 * r.pos / r.ids.length) + '%';
    var g = 0, n = 0;
    Object.keys(r.ergebnis).forEach(function (id) { if (r.ergebnis[id] === 'g') g++; else n++; });
    $('anzahl-gewusst').textContent = g;
    $('anzahl-nochnicht').textContent = n;
    $('knopf-zurueck').disabled = !r.verlauf.length;
  }

  function umdrehen() {
    if (sperre || aktuelleAnsicht !== 'lernen') return;
    umgedreht = !umgedreht;
    $('karte').classList.toggle('umgedreht', umgedreht);
    ansagen(seitenSichtbarkeit());
  }

  function bewerten(wert) {
    if (sperre || aktuelleAnsicht !== 'lernen' || !rundeLaeuft()) return;
    var r = zustand.runde;
    var id = r.ids[r.pos];
    r.verlauf.push({ id: id, vorher: zustand.stand[id] || null });
    zustand.stand[id] = wert;
    r.ergebnis[id] = wert;
    r.pos++;
    speichern();

    var weiter = function () {
      sperre = false;
      if (r.pos >= r.ids.length) ergebnisZeigen();
      else karteZeigen(true);
    };
    if (wenigerBewegung()) { weiter(); return; }
    sperre = true;
    var el = $('karte');
    var richtung = wert === 'g' ? 1 : -1;
    el.classList.remove('zieht', 'zurueckfedern', 'erscheint');
    markenSetzen(richtung * 200);
    el.classList.add('fliegt');
    el.style.transform = 'translateX(' + (richtung * 115) + '%) rotate(' + (richtung * 14) + 'deg)';
    setTimeout(weiter, 230);
  }

  function zuruecknehmen() {
    var r = zustand.runde;
    if (sperre || !r || !r.verlauf.length) return;
    var v = r.verlauf.pop();
    if (v.vorher) zustand.stand[v.id] = v.vorher; else delete zustand.stand[v.id];
    delete r.ergebnis[v.id];
    r.pos = r.ids.indexOf(v.id);
    speichern();
    zeige('lernen');
    karteZeigen(true);
    $('karte').focus({ preventScroll: true });
  }

  /* ---------- Wischen ---------- */
  var zug = null;
  var SCHWELLE = 90;

  function markenSetzen(dx) {
    var staerke = Math.min(Math.abs(dx) / SCHWELLE, 1);
    $('marke-rechts').style.opacity = dx > 0 ? staerke : 0;
    $('marke-links').style.opacity = dx < 0 ? staerke : 0;
  }

  function zugBeginn(e) {
    if (sperre || (e.pointerType === 'mouse' && e.button !== 0)) return;
    zug = { x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId, aktiv: false };
  }

  function zugBewegung(e) {
    if (!zug || e.pointerId !== zug.id) return;
    var dx = e.clientX - zug.x, dy = e.clientY - zug.y;
    if (!zug.aktiv) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      zug.aktiv = true;
      var el0 = $('karte');
      el0.classList.remove('zurueckfedern', 'erscheint');
      el0.classList.add('zieht');
      try { el0.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    }
    zug.dx = dx;
    $('karte').style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 22) + 'deg)';
    markenSetzen(dx);
  }

  function zugEnde(e) {
    if (!zug || e.pointerId !== zug.id) return;
    var z = zug;
    zug = null;
    if (!z.aktiv) return; // war ein Tippen → „click“ dreht um
    var el = $('karte');
    el.classList.remove('zieht');
    letzterZug = Date.now();
    if (Math.abs(z.dx) >= SCHWELLE) {
      bewerten(z.dx > 0 ? 'g' : 'n');
    } else {
      el.classList.add('zurueckfedern');
      el.style.transform = '';
      markenSetzen(0);
    }
  }

  function zugAbbruch() {
    if (!zug) return;
    var aktiv = zug.aktiv;
    zug = null;
    if (!aktiv) return;
    var el = $('karte');
    el.classList.remove('zieht');
    el.classList.add('zurueckfedern');
    el.style.transform = '';
    markenSetzen(0);
  }

  var letzterZug = 0;

  /* ================= Ergebnis ================= */
  function ergebnisZeigen() {
    var r = zustand.runde;
    var g = 0;
    r.ids.forEach(function (id) { if (r.ergebnis[id] === 'g') g++; });
    var n = r.ids.length - g;
    $('ergebnis-titel').textContent = n === 0 ? T.allesGewusst : T.rundeFertig;
    $('ergebnis-zahl').textContent = ersetzen(T.ergebnis, { x: g, y: r.ids.length });
    $('ergebnis-gruen').style.width = (100 * g / r.ids.length) + '%';
    $('ergebnis-orange').style.width = (100 * n / r.ids.length) + '%';
    var gesamt = gewusst(REIHENFOLGE);
    $('ergebnis-gesamt').textContent = ersetzen(T.insgesamt, { x: gesamt, y: REIHENFOLGE.length });
    $('ergebnis-gesamt').hidden = r.ids.length === REIHENFOLGE.length && g === gesamt; // sonst doppelt

    var w = $('knopf-wiederholen');
    w.hidden = n === 0;
    w.textContent = n === 1 ? T.wiederholenEine : ersetzen(T.wiederholen, { x: n });
    var a = $('knopf-alle');
    a.textContent = T.nochmalAlle;
    a.className = 'knopf ' + (n === 0 ? 'haupt' : 'zweit');
    $('ergebnis-zurueck').disabled = !r.verlauf.length;
    zeige('ergebnis');
    $('ergebnis-titel').focus({ preventScroll: true });
  }

  function wiederholen() {
    var r = zustand.runde;
    if (!r) return;
    var ids = r.ids.filter(function (id) { return r.ergebnis[id] !== 'g'; });
    rundeStarten('alle', ids);
  }

  /* ================= Ereignisse ================= */
  texteEinsetzen();

  $('knopf-start').addEventListener('click', function () { startAktion(this.dataset.aktion); });
  $('knopf-start-2').addEventListener('click', function () { startAktion(this.dataset.aktion); });
  $('mischen').addEventListener('change', function () { zustand.mischen = this.checked; speichern(); });
  $('alle-themen').addEventListener('click', function () { zustand.abgewaehlt = []; speichern(); themenAufbauen(); startAktualisieren(); });
  $('keine-themen').addEventListener('click', function () {
    zustand.abgewaehlt = THEMEN.map(function (t) { return t.id; });
    speichern(); themenAufbauen(); startAktualisieren();
  });
  $('zuruecksetzen').addEventListener('click', function () {
    if (!window.confirm(T.zuruecksetzenFrage)) return;
    zustand.stand = {};
    zustand.runde = null;
    speichern();
    zeigeStart();
  });

  var karteEl = $('karte');
  karteEl.addEventListener('click', function () {
    if (Date.now() - letzterZug < 350) return; // Klick nach dem Wischen ignorieren
    umdrehen();
  });
  karteEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); umdrehen(); }
  });
  karteEl.addEventListener('pointerdown', zugBeginn);
  karteEl.addEventListener('pointermove', zugBewegung);
  karteEl.addEventListener('pointerup', zugEnde);
  karteEl.addEventListener('pointercancel', zugAbbruch);
  karteEl.addEventListener('lostpointercapture', function (e) { if (zug && zug.aktiv && e.pointerId === zug.id) zugEnde(e); });

  $('knopf-gewusst').addEventListener('click', function () { bewerten('g'); });
  $('knopf-nochnicht').addEventListener('click', function () { bewerten('n'); });
  $('knopf-zurueck').addEventListener('click', zuruecknehmen);
  $('ergebnis-zurueck').addEventListener('click', zuruecknehmen);
  $('knopf-schliessen').addEventListener('click', zeigeStart);
  $('ergebnis-schliessen').addEventListener('click', zeigeStart);
  $('knopf-uebersicht').addEventListener('click', zeigeStart);
  $('knopf-wiederholen').addEventListener('click', wiederholen);
  $('knopf-alle').addEventListener('click', function () { rundeStarten('alle'); });

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (aktuelleAnsicht === 'lernen') {
      var aufKnopf = e.target && e.target.tagName === 'BUTTON';
      if (e.key === 'ArrowRight') { e.preventDefault(); bewerten('g'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); bewerten('n'); }
      else if (e.key === ' ' && !aufKnopf && e.target !== karteEl) { e.preventDefault(); umdrehen(); }
      else if (e.key === 'Backspace') { e.preventDefault(); zuruecknehmen(); }
      else if (e.key === 'Escape') { zeigeStart(); }
    } else if (aktuelleAnsicht === 'ergebnis' && e.key === 'Escape') {
      zeigeStart();
    }
  });

  zeigeStart();

  /* ---------- Offline-Speicher ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* ohne Offline-Speicher weiter */ });
    });
  }
})();
