/* Live-Rangliste für den Beamer (Programmlogik). Texte: inhalte.js, Einstellungen: config.js.
 * Einträge werden nur in diesem Browser gehalten (sessionStorage) und nach
 * ANZEIGE_MINUTEN verworfen. Nichts wird an einen Server gesendet. */
(function () {
  'use strict';

  var KB2 = window.KB2;
  var T = INHALTE.rangliste;
  var el = KB2.element;
  var FENSTER_MS = (CONFIG.ANZEIGE_MINUTEN || 45) * 60000;
  var PLAETZE = CONFIG.RANGLISTE_PLAETZE || 10;
  var SCHLUESSEL = 'kb2ab12_rangliste';

  // Texte in die Seite setzen
  Array.prototype.forEach.call(document.querySelectorAll('[data-text]'), function (e) {
    var t = T[e.getAttribute('data-text')];
    if (t) e.textContent = t;
  });
  document.title = T.titel;

  var parameter = new URLSearchParams(location.search);
  var demo = parameter.get('demo') === '1';

  var einrichtung = document.getElementById('einrichtung');
  var tafel = document.getElementById('tafel');
  var liste = document.getElementById('liste');
  var warten = document.getElementById('warten');
  var statusPunkt = document.getElementById('status-punkt');
  var statusText = document.getElementById('status-text');
  var anzahl = document.getElementById('anzahl');
  var dialog = document.getElementById('dialog');
  var dialogText = document.getElementById('dialog-text');
  var dialogKnoepfe = document.getElementById('dialog-knoepfe');
  var belegt = document.getElementById('belegt');
  var vollbildKnopf = document.getElementById('vollbild');

  /* =====================================================================
     Zustand
     ===================================================================== */
  var z = null;            // { raum, token, eintraege, ausgeblendet, geleertUm, namensFolge }
  var empfaenger = null;
  var schmutzig = true;
  var letzterAufbau = 0;

  function neuerZustand(raum) {
    return {
      raum: raum,
      token: KB2.zufallsId(16),
      eintraege: {},
      ausgeblendet: { geraete: {}, namen: {} },
      geleertUm: 0,
      namensFolge: {}
    };
  }

  function speichern() {
    if (!demo) KB2.Speicher.sitzung.schreiben(SCHLUESSEL, z);
  }

  function namensSchluessel(n) { return String(n).trim().toLowerCase(); }

  /* ---------- Meldungen von Handys prüfen und übernehmen ---------- */
  function meldungAnnehmen(d) {
    if (!d || typeof d !== 'object') return false;
    var schluessel = Object.keys(d).sort().join(',');
    if (schluessel !== 'erreichtUm,figur,geraeteId,punkte,spitzname') return false;
    if (typeof d.geraeteId !== 'string' || !/^[a-z0-9]{6,32}$/.test(d.geraeteId)) return false;
    if (d.figur !== 'schwester') return false;
    if (typeof d.punkte !== 'number' || !isFinite(d.punkte) || d.punkte < 1 || d.punkte > 999999 ||
        Math.floor(d.punkte) !== d.punkte) return false;
    if (typeof d.erreichtUm !== 'number' || !isFinite(d.erreichtUm)) return false;
    if (KB2.spitznamePruefen(d.spitzname) !== '') return false;

    var jetzt = Date.now();
    var um = Math.min(d.erreichtUm, jetzt);  // Uhren der Handys können vorgehen
    if (um < jetzt - FENSTER_MS || um < z.geleertUm) return true; // zu alt: bestätigen, nicht anzeigen

    var name = d.spitzname.trim().replace(/\s+/g, ' ');
    var alt = z.eintraege[d.geraeteId];
    var altAbgelaufen = alt && alt.erreichtUm < jetzt - FENSTER_MS;
    if (!alt || altAbgelaufen || d.punkte >= alt.punkte || alt.spitzname !== name) {
      if (alt && !altAbgelaufen && d.punkte < alt.punkte) {
        // nur der Spitzname hat sich geändert
        alt.spitzname = name;
        alt.figur = d.figur;
      } else {
        z.eintraege[d.geraeteId] = { spitzname: name, figur: d.figur, punkte: d.punkte, erreichtUm: um };
      }
      var ns = namensSchluessel(name);
      var folge = z.namensFolge[ns] = z.namensFolge[ns] || [];
      if (folge.indexOf(d.geraeteId) === -1) folge.push(d.geraeteId);
      schmutzig = true;
    }
    return true;
  }

  function sichtbareEintraege() {
    var grenze = Date.now() - FENSTER_MS;
    var aus = [];
    Object.keys(z.eintraege).forEach(function (id) {
      var e = z.eintraege[id];
      if (e.erreichtUm < grenze) { delete z.eintraege[id]; schmutzig = true; return; }
      if (z.ausgeblendet.geraete[id] || z.ausgeblendet.namen[namensSchluessel(e.spitzname)]) return;
      aus.push({ id: id, e: e });
    });
    aus.sort(function (a, b) { return b.e.punkte - a.e.punkte || a.e.erreichtUm - b.e.erreichtUm; });
    return aus;
  }

  function anzeigeName(id, e) {
    var folge = z.namensFolge[namensSchluessel(e.spitzname)] || [];
    var nr = folge.indexOf(id) + 1;
    return nr > 1 ? e.spitzname + ' (' + nr + ')' : e.spitzname;
  }

  /* =====================================================================
     Anzeige (höchstens einmal pro Sekunde neu aufbauen)
     ===================================================================== */
  var figurBild = {};
  function figurUrl(figur) {
    if (!figurBild[figur]) figurBild[figur] = PIXEL.figur(figur, 'lauf1', 1).toDataURL('image/png');
    return figurBild[figur];
  }

  var zeilen = {};       // geraeteId → <li>
  var letzterPlatz = {}; // geraeteId → Platz beim letzten Aufbau

  var aufbauAnzahl = 0;
  function aufbauen() {
    aufbauAnzahl++;
    letzterAufbau = Date.now();
    schmutzig = false;
    var alle = sichtbareEintraege();
    var oben = alle.slice(0, PLAETZE);
    document.body.classList.toggle('leer', alle.length === 0);
    warten.hidden = alle.length > 0;

    // Positionen vorher (für eine ruhige Verschiebe-Animation)
    var vorher = {};
    Object.keys(zeilen).forEach(function (id) { vorher[id] = zeilen[id].getBoundingClientRect().top; });

    var neueIds = {};
    oben.forEach(function (eintrag, i) {
      var id = eintrag.id;
      neueIds[id] = true;
      var li = zeilen[id];
      var neu = false;
      if (!li) {
        li = el('li', 'zeile');
        li.tabIndex = 0;
        li.setAttribute('data-id', id);
        li.appendChild(el('span', 'platz'));
        var img = el('img');
        img.alt = '';
        li.appendChild(img);
        li.appendChild(el('span', 'name'));
        li.appendChild(el('span', 'pkt'));
        li.addEventListener('click', function () { ausblendenFragen(id); });
        li.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ausblendenFragen(id); }
        });
        zeilen[id] = li;
        neu = true;
      }
      li.children[0].textContent = (i + 1) + '.';
      var url = figurUrl(eintrag.e.figur);
      if (li.children[1].getAttribute('src') !== url) li.children[1].src = url;
      li.children[2].textContent = anzeigeName(id, eintrag.e);
      li.children[3].textContent = String(eintrag.e.punkte);
      li.setAttribute('data-punkte', eintrag.e.punkte);

      var vorherPlatz = letzterPlatz[id];
      li.classList.remove('neu', 'hoch');
      if (neu && !document.hidden) {
        void li.offsetWidth;
        li.classList.add('neu');
      } else if (vorherPlatz !== undefined && i < vorherPlatz && !document.hidden) {
        void li.offsetWidth;
        li.classList.add('hoch');
      }
      letzterPlatz[id] = i;
      liste.appendChild(li); // in die richtige Reihenfolge bringen
    });

    Object.keys(zeilen).forEach(function (id) {
      if (!neueIds[id]) {
        if (zeilen[id].parentNode) zeilen[id].parentNode.removeChild(zeilen[id]);
        delete zeilen[id];
        delete letzterPlatz[id];
      }
    });

    // Verschiebe-Animation (FLIP)
    if (!document.hidden) {
      Object.keys(zeilen).forEach(function (id) {
        if (vorher[id] === undefined) return;
        var li = zeilen[id];
        var dy = vorher[id] - li.getBoundingClientRect().top;
        if (Math.abs(dy) < 1) return;
        li.style.transition = 'none';
        li.style.transform = 'translateY(' + dy + 'px)';
        void li.offsetWidth;
        li.style.transition = 'transform .6s ease';
        li.style.transform = '';
      });
    }
    speichern();
  }

  function statusZeigen(s) {
    var zust = s ? s.zustand : 'verbinde';
    statusPunkt.className = 'punkt' + (zust === 'bereit' ? ' bereit' : (zust === 'getrennt' ? ' getrennt' : ''));
    statusText.textContent = zust === 'bereit' ? T.statusBereit
      : (zust === 'getrennt' ? T.statusGetrennt : T.statusVerbinde);
    anzahl.textContent = KB2.ersetzen(T.verbunden, { x: s ? s.spielende : 0 });
    belegt.hidden = zust !== 'belegt';
  }

  function etwasAbgelaufen() {
    var grenze = Date.now() - FENSTER_MS;
    for (var id in z.eintraege) if (z.eintraege[id].erreichtUm < grenze) return true;
    return false;
  }

  setInterval(function () {
    if (!z) return;
    if (schmutzig || Date.now() - letzterAufbau > 10000 || etwasAbgelaufen()) aufbauen();
  }, 1000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && z) { aufbauen(); wachHalten(); }
  });

  /* =====================================================================
     Moderation (ohne Browser-Dialoge)
     ===================================================================== */
  function dialogZeigen(text, knoepfe) {
    dialogText.textContent = text;
    dialogKnoepfe.textContent = '';
    knoepfe.forEach(function (k) {
      var b = el('button', 'knopf' + (k.zweit ? ' knopf-zweit' : ''), k.text);
      b.type = 'button';
      b.addEventListener('click', function () { dialog.hidden = true; if (k.fn) k.fn(); });
      dialogKnoepfe.appendChild(b);
    });
    dialog.hidden = false;
    var erster = dialogKnoepfe.querySelector('button');
    if (erster) erster.focus();
  }

  function ausblendenFragen(id) {
    var e = z.eintraege[id];
    if (!e) return;
    dialogZeigen(KB2.ersetzen(T.ausblendenFrage, { name: anzeigeName(id, e) }), [
      { text: T.ausblenden, fn: function () { z.ausgeblendet.geraete[id] = true; aufbauen(); } },
      { text: T.nameAusblenden, zweit: true, fn: function () {
        z.ausgeblendet.namen[namensSchluessel(e.spitzname)] = true; aufbauen();
      } },
      { text: T.abbrechen, zweit: true }
    ]);
  }

  document.getElementById('leeren').addEventListener('click', function () {
    dialogZeigen(T.leerenFrage, [
      { text: T.leerenJa, fn: function () {
        z.eintraege = {};
        z.namensFolge = {};
        z.geleertUm = Date.now();
        aufbauen();
      } },
      { text: T.abbrechen, zweit: true }
    ]);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') dialog.hidden = true;
  });

  /* =====================================================================
     Vollbild und Bildschirm wach halten
     ===================================================================== */
  function imVollbild() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function vollbildText() { vollbildKnopf.textContent = imVollbild() ? T.vollbildEnde : T.vollbild; }
  vollbildKnopf.addEventListener('click', function () {
    var d = document.documentElement;
    try {
      if (imVollbild()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (d.requestFullscreen || d.webkitRequestFullscreen).call(d);
    } catch (e) { /* nicht unterstützt */ }
  });
  document.addEventListener('fullscreenchange', vollbildText);
  document.addEventListener('webkitfullscreenchange', vollbildText);
  vollbildText();

  var wachSperre = null;
  function wachHalten() {
    if (!('wakeLock' in navigator) || document.hidden || (wachSperre && !wachSperre.released)) return;
    navigator.wakeLock.request('screen').then(function (s) { wachSperre = s; }).catch(function () { /* egal */ });
  }

  /* =====================================================================
     Start
     ===================================================================== */
  function tafelStarten(raum) {
    var gespeichert = KB2.Speicher.sitzung.lesen(SCHLUESSEL);
    z = (!demo && gespeichert && gespeichert.raum === raum && gespeichert.token) ? gespeichert : neuerZustand(raum);
    if (!z.ausgeblendet) z.ausgeblendet = { geraete: {}, namen: {} };
    if (!z.namensFolge) z.namensFolge = {};
    speichern();

    einrichtung.hidden = true;
    tafel.hidden = false;
    document.getElementById('raum-code').textContent = raum;
    aufbauen();
    wachHalten();

    if (demo) {
      demoStarten();
      return;
    }
    empfaenger = new KB2Verbindung.Empfaenger({
      raumId: CONFIG.RAUM_PRAEFIX + raum,
      token: z.token,
      beiStatus: statusZeigen,
      beiMeldung: function (d, antworten) {
        if (meldungAnnehmen(d)) {
          antworten({ typ: 'ok', punkte: d.punkte, erreichtUm: d.erreichtUm });
        }
      }
    });
    statusZeigen(null);
    empfaenger.starten();
  }

  function einrichtungZeigen(fehlerText) {
    if (empfaenger) { empfaenger.beenden(); empfaenger = null; }
    z = null;
    tafel.hidden = true;
    belegt.hidden = true;
    einrichtung.hidden = false;
    document.getElementById('einrichtung-fehler').textContent = fehlerText || '';
    var feld = document.getElementById('raum-eingabe');
    setTimeout(function () { feld.focus(); }, 50);
  }

  var feld = document.getElementById('raum-eingabe');
  feld.addEventListener('input', function () {
    var v = feld.value.replace(/\D/g, '').slice(0, 4);
    if (v !== feld.value) feld.value = v;
  });
  document.getElementById('einrichtung-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!/^\d{4}$/.test(feld.value)) {
      document.getElementById('einrichtung-fehler').textContent = T.raumcodeFehler;
      return;
    }
    tafelStarten(feld.value);
  });
  document.getElementById('vorschlagen').addEventListener('click', function () {
    var n = new Uint16Array(1);
    window.crypto.getRandomValues(n);
    feld.value = String(1000 + (n[0] % 9000));
    document.getElementById('einrichtung-fehler').textContent = '';
  });
  document.getElementById('wechseln').addEventListener('click', function () {
    KB2.Speicher.sitzung.schreiben(SCHLUESSEL, null);
    einrichtungZeigen('');
  });
  document.getElementById('belegt-erneut').addEventListener('click', function () {
    belegt.hidden = true;
    if (empfaenger) empfaenger.erneutVersuchen();
  });
  document.getElementById('belegt-anderer').addEventListener('click', function () {
    KB2.Speicher.sitzung.schreiben(SCHLUESSEL, null);
    einrichtungZeigen('');
  });

  /* ---------- Demo-Modus mit erfundenen Einträgen ---------- */
  function demoStarten() {
    document.getElementById('demo-hinweis').hidden = false;
    var namen = ['Mia', 'Leon', 'Sophie', 'Ben', 'Emma', 'Noah', 'Mia', 'Lea', 'Finn', 'Hannah', 'Elias', 'Amira'];
    var jetzt = Date.now();
    var demoIds = [];
    function demoMeldung(i, punkte) {
      meldungAnnehmen({
        geraeteId: demoIds[i], spitzname: namen[i], figur: 'schwester',
        punkte: punkte, erreichtUm: Date.now()
      });
    }
    namen.forEach(function (n, i) { demoIds.push('demo' + KB2.zufallsId(8)); });
    // die ersten Einträge nach und nach einblenden
    var i = 0;
    var anfang = setInterval(function () {
      if (i >= namen.length) { clearInterval(anfang); return; }
      demoMeldung(i, 300 + Math.floor(Math.random() * 1500));
      i++;
    }, 700);
    setInterval(function () {
      var k = Math.floor(Math.random() * Math.min(i, namen.length));
      var e = z.eintraege[demoIds[k]];
      if (e) demoMeldung(k, e.punkte + 100 + Math.floor(Math.random() * 600));
    }, 3000);
    statusZeigen({ zustand: 'bereit', spielende: namen.length });
    void jetzt;
  }

  // Direkter Start über die Adresse (rangliste.html?raum=4821) oder nach Neuladen
  var raumParameter = parameter.get('raum');
  var gespeichert = KB2.Speicher.sitzung.lesen(SCHLUESSEL);
  if (demo) tafelStarten('4821');
  else if (raumParameter && /^\d{4}$/.test(raumParameter)) tafelStarten(raumParameter);
  else if (gespeichert && /^\d{4}$/.test(gespeichert.raum)) tafelStarten(gespeichert.raum);
  else einrichtungZeigen('');

  // Für automatische Tests (nur lesend)
  window.Rangliste = {
    eintraege: function () { return z ? sichtbareEintraege().map(function (x) {
      return { id: x.id, name: anzeigeName(x.id, x.e), punkte: x.e.punkte, figur: x.e.figur };
    }) : []; },
    empfaenger: function () { return empfaenger; },
    aufbauZaehler: function () { return aufbauAnzahl; },
    alleEintraege: function () { return z ? Object.keys(z.eintraege).length : 0; }
  };
})();
