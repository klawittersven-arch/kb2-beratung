/* Gemeinsame Hilfsfunktionen für alle Seiten (Programmlogik – Texte stehen in inhalte.js). */
(function () {
  'use strict';

  /* ---------- Speicher: jeder Zugriff abgesichert, Seite läuft auch ohne ---------- */
  function lager(art) {
    try {
      var s = window[art];
      var probe = '__kb2_probe__';
      s.setItem(probe, '1');
      s.removeItem(probe);
      return s;
    } catch (e) {
      return null;
    }
  }

  function lesen(s, schluessel) {
    if (!s) return null;
    try {
      var roh = s.getItem(schluessel);
      return roh === null ? null : JSON.parse(roh);
    } catch (e) {
      return null;
    }
  }

  function schreiben(s, schluessel, wert) {
    if (!s) return false;
    try {
      if (wert === null || wert === undefined) s.removeItem(schluessel);
      else s.setItem(schluessel, JSON.stringify(wert));
      return true;
    } catch (e) {
      return false;
    }
  }

  var sitzungLager = lager('sessionStorage');
  var dauerLager = lager('localStorage');

  var Speicher = {
    // Nur für diesen Tab (übersteht Neuladen)
    sitzung: {
      lesen: function (k) { return lesen(sitzungLager, k); },
      schreiben: function (k, w) { return schreiben(sitzungLager, k, w); }
    },
    // Dauerhaft auf dem Gerät; ohne localStorage Ausweichen auf sessionStorage
    dauer: {
      lesen: function (k) {
        var w = lesen(dauerLager, k);
        return w !== null ? w : lesen(sitzungLager, k);
      },
      schreiben: function (k, w) {
        return schreiben(dauerLager, k, w) || schreiben(sitzungLager, k, w);
      }
    }
  };

  /* ---------- Freischaltung des Minispiels ---------- */
  // „Gelöst“ gilt 3 Stunden (eine Unterrichtssitzung), danach muss neu gelöst werden.
  var GELOEST_GUELTIG_MS = 3 * 3600000;
  var Freischaltung = {
    alsGeloestMerken: function (aufgabe) {
      Speicher.dauer.schreiben('kb2ab12_geloest_' + aufgabe, Date.now());
    },
    zuruecknehmen: function (aufgabe) {
      Speicher.dauer.schreiben('kb2ab12_geloest_' + aufgabe, null);
    },
    istGeloest: function (aufgabe) {
      var um = Speicher.dauer.lesen('kb2ab12_geloest_' + aufgabe);
      return typeof um === 'number' && um <= Date.now() + 60000 && Date.now() - um < GELOEST_GUELTIG_MS;
    },
    beideGeloest: function () {
      return Freischaltung.istGeloest('aa1') && Freischaltung.istGeloest('aa2');
    }
  };

  /* ---------- Spitznamen prüfen (Handy und Rangliste) ---------- */
  var ERLAUBT = /^[A-Za-z0-9ÄÖÜäöüßÀ-ÖØ-öø-ÿ _-]+$/;
  var ERSATZ = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's' };

  function normalisieren(text) {
    var t = String(text).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
    var aus = '';
    for (var i = 0; i < t.length; i++) {
      var z = ERSATZ[t[i]] || t[i];
      if (z >= 'a' && z <= 'z') aus += z;
    }
    // doppelte Buchstaben zusammenziehen (z. B. „fiiick“)
    return aus.replace(/(.)\1+/g, '$1');
  }

  // Ergebnis: '' (in Ordnung), 'laenge', 'zeichen' oder 'wort'
  function spitznamePruefen(name) {
    if (typeof name !== 'string') return 'zeichen';
    var n = name.trim().replace(/\s+/g, ' ');
    if (n.length < 2 || n.length > 12) return 'laenge';
    if (!ERLAUBT.test(n)) return 'zeichen';
    var norm = normalisieren(n);
    var liste = (window.CONFIG && window.CONFIG.SPERRWOERTER) || [];
    for (var i = 0; i < liste.length; i++) {
      var wort = normalisieren(liste[i]);
      if (wort && norm.indexOf(wort) !== -1) return 'wort';
    }
    return '';
  }

  /* ---------- Kleine Helfer ---------- */
  function element(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function ersetzen(vorlage, werte) {
    return String(vorlage).replace(/\{(\w+)\}/g, function (_, k) {
      return werte[k] !== undefined ? werte[k] : '';
    });
  }

  function zufallsId(laenge) {
    var zeichen = 'abcdefghijkmnpqrstuvwxyz23456789';
    var aus = '';
    var zahlen = new Uint8Array(laenge);
    (window.crypto || window.msCrypto).getRandomValues(zahlen);
    for (var i = 0; i < laenge; i++) aus += zeichen[zahlen[i] % zeichen.length];
    return aus;
  }

  /* ---------- Offline-Fähigkeit: Service Worker anmelden ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* ohne Offline-Modus weiter */ });
    });
  }

  window.KB2 = {
    Speicher: Speicher,
    Freischaltung: Freischaltung,
    spitznamePruefen: spitznamePruefen,
    element: element,
    ersetzen: ersetzen,
    zufallsId: zufallsId
  };
})();
