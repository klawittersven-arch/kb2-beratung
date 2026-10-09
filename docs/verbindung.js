/* Live-Verbindung Handy → Laptop (Programmlogik, keine Texte).
 *
 * Aufbau:
 *   Transport  – austauschbare Schicht mit der Schnittstelle von PeerJS
 *                (knoten(id, optionen) liefert ein Objekt mit on/connect/reconnect/destroy).
 *                'peerjs' = Echtbetrieb über den PeerJS-Cloud-Vermittlungsdienst,
 *                'test'   = Nachbildung über BroadcastChannel (bzw. window.TEST_BUS) für Tests.
 *   Sender     – läuft auf dem Handy, meldet die Bestleistung an die Rangliste.
 *   Empfaenger – läuft auf dem Laptop, nimmt Verbindungen und Meldungen an.
 *
 * Übertragen wird nur { geraeteId, spitzname, figur, punkte, erreichtUm }.
 * Die Rangliste bestätigt mit { typ: 'ok', punkte, erreichtUm }.
 */
(function () {
  'use strict';

  var KB2 = window.KB2;

  /* ---------------- kleine Ereignis-Hilfe ---------------- */
  function Ereignisse() { this._h = {}; }
  Ereignisse.prototype.on = function (name, fn) {
    (this._h[name] = this._h[name] || []).push(fn);
    return this;
  };
  Ereignisse.prototype.emit = function (name) {
    var liste = this._h[name];
    if (!liste) return;
    var args = Array.prototype.slice.call(arguments, 1);
    liste.slice().forEach(function (fn) {
      try { fn.apply(null, args); } catch (e) { setTimeout(function () { throw e; }, 0); }
    });
  };
  function erben(Kind) {
    Kind.prototype = Object.create(Ereignisse.prototype);
    Kind.prototype.constructor = Kind;
  }

  /* =====================================================================
     Transport 1: PeerJS (Echtbetrieb)
     ===================================================================== */
  var PeerTransport = {
    name: 'peerjs',
    knoten: function (id, optionen) {
      if (typeof window.Peer !== 'function') throw new Error('PeerJS nicht geladen');
      var o = { debug: 0 };
      if (optionen && optionen.token) o.token = optionen.token;
      return id ? new window.Peer(id, o) : new window.Peer(o);
    }
  };

  /* =====================================================================
     Transport 2: Test-Transport (BroadcastChannel / window.TEST_BUS)
     Bildet das Verhalten von PeerJS nach: Kennungen anmelden (auch „belegt“),
     Verbindungen aufbauen, Datenkanäle, Abbruch des Vermittlungsdienstes und
     vollständiger Netzausfall (Kanäle brechen nach einigen Sekunden ab).
     ===================================================================== */
  var TestBus = (function () {
    var lokale = [];
    var extern = null;
    function verteilen(m) {
      for (var i = 0; i < lokale.length; i++) lokale[i](m);
    }
    function init() {
      if (extern) return;
      if (window.TEST_BUS) {
        extern = window.TEST_BUS;
        extern.beimEmpfang(verteilen);
      } else if ('BroadcastChannel' in window) {
        var bc = new BroadcastChannel('kb2ab12-testbus');
        bc.onmessage = function (e) { verteilen(e.data); };
        extern = { senden: function (m) { bc.postMessage(m); } };
      } else {
        extern = { senden: function () {} };
      }
    }
    return {
      anmelden: function (fn) { init(); lokale.push(fn); },
      abmelden: function (fn) {
        var i = lokale.indexOf(fn);
        if (i !== -1) lokale.splice(i, 1);
      },
      senden: function (m, absender) {
        init();
        var kopie = JSON.parse(JSON.stringify(m));
        setTimeout(function () {
          for (var i = 0; i < lokale.length; i++) if (lokale[i] !== absender) lokale[i](kopie);
        }, 0);
        extern.senden(m);
      }
    };
  })();

  var testNetz = { aus: false }; // gilt für die ganze Seite (= ein Gerät)
  var testKnotenListe = [];

  function TestKnoten(id, optionen) {
    Ereignisse.call(this);
    this.id = id || ('test-' + KB2.zufallsId(12));
    this._token = (optionen && optionen.token) || KB2.zufallsId(10);
    this._inst = KB2.zufallsId(12);
    this.open = false;
    this.disconnected = false;
    this.destroyed = false;
    this._warOffen = false;
    this._kanaele = {};
    this._netzAus = false;
    var self = this;
    this._fn = function (m) { self._empfang(m); };
    TestBus.anmelden(this._fn);
    testKnotenListe.push(this);
    this._anmelden();
  }
  erben(TestKnoten);

  TestKnoten.prototype._online = function () {
    return !testNetz.aus && !this._netzAus && navigator.onLine !== false;
  };

  TestKnoten.prototype._senden = function (m) {
    if (!this._online() || this.destroyed) return;
    TestBus.senden(m, this._fn);
  };

  TestKnoten.prototype._anmelden = function () {
    var self = this;
    var lauf = this._anmeldeLauf = {};
    if (!this._online()) {
      setTimeout(function () {
        if (self._anmeldeLauf !== lauf || self.destroyed) return;
        self.emit('error', { type: 'network', message: 'Netzwerk nicht erreichbar' });
        if (self._warOffen) { self.disconnected = true; self.emit('disconnected', self.id); }
        else self.destroy();
      }, 400);
      return;
    }
    this._senden({ t: 'reg', id: this.id, token: this._token, von: this._inst });
    setTimeout(function () {
      if (self._anmeldeLauf !== lauf || self.destroyed || self.disconnected || !self._online()) return;
      self.open = true;
      self._warOffen = true;
      self.emit('open', self.id);
    }, 250);
  };

  TestKnoten.prototype.reconnect = function () {
    if (this.destroyed) throw new Error('zerstört');
    if (!this.disconnected) return;
    this.disconnected = false;
    this.open = false;
    this._anmelden();
  };

  TestKnoten.prototype.disconnect = function () {
    if (this.disconnected) return;
    this.disconnected = true;
    this.open = false;
    this._anmeldeLauf = null;
    this.emit('disconnected', this.id);
  };

  TestKnoten.prototype.destroy = function () {
    if (this.destroyed) return;
    var self = this;
    Object.keys(this._kanaele).forEach(function (k) { self._kanaele[k].close(); });
    this.destroyed = true;
    this.disconnected = true;
    this.open = false;
    TestBus.abmelden(this._fn);
    var i = testKnotenListe.indexOf(this);
    if (i !== -1) testKnotenListe.splice(i, 1);
    this.emit('close');
  };

  TestKnoten.prototype.connect = function (ziel) {
    if (this.disconnected || this.destroyed) {
      this.emit('error', { type: 'disconnected', message: 'nicht mit dem Vermittlungsdienst verbunden' });
      return undefined;
    }
    var kid = KB2.zufallsId(12);
    var k = new TestKanal(this, ziel, kid);
    this._kanaele[kid] = k;
    this._senden({ t: 'conn', an: ziel, von: this.id, kanal: kid });
    var self = this;
    setTimeout(function () {
      if (!k.open && !k._zu) {
        delete self._kanaele[kid];
        k._zu = true;
        self.emit('error', { type: 'peer-unavailable', message: 'Gegenstelle nicht erreichbar: ' + ziel });
      }
    }, 3000);
    return k;
  };

  TestKnoten.prototype._empfang = function (m) {
    if (this.destroyed || !this._online() || !m) return;
    var k;
    switch (m.t) {
      case 'reg':
        if (m.id === this.id && m.von !== this._inst && this.open && !this.disconnected) {
          if (m.token !== this._token) this._senden({ t: 'reg-nein', an: m.von });
          else this.disconnect(); // derselbe Besitzer meldet sich neu an
        }
        break;
      case 'reg-nein':
        if (m.an === this._inst && this._anmeldeLauf) {
          this._anmeldeLauf = null;
          this.open = false;
          this.emit('error', { type: 'unavailable-id', message: 'ID "' + this.id + '" is taken' });
          if (this._warOffen) { this.disconnected = true; this.emit('disconnected', this.id); }
          else this.destroy();
        }
        break;
      case 'conn':
        if (m.an === this.id && this.open && !this.disconnected) {
          k = new TestKanal(this, m.von, m.kanal);
          this._kanaele[m.kanal] = k;
          this._senden({ t: 'conn-ok', an: m.von, kanal: m.kanal });
          this.emit('connection', k);
          k._oeffnen();
        }
        break;
      case 'conn-ok':
        k = this._kanaele[m.kanal];
        if (m.an === this.id && k && !k._zu) k._oeffnen();
        break;
      case 'daten':
      case 'ping':
      case 'zu':
        k = this._kanaele[m.kanal];
        if (m.an === this.id && k) k._nachricht(m);
        break;
    }
  };

  function TestKanal(knoten, peer, kid) {
    Ereignisse.call(this);
    this._knoten = knoten;
    this.peer = peer;
    this._kid = kid;
    this.open = false;
    this._zu = false;
    this._zuletzt = Date.now();
    this._takt = null;
  }
  erben(TestKanal);

  TestKanal.prototype._oeffnen = function () {
    var self = this;
    setTimeout(function () {
      if (self._zu || self.open) return;
      self.open = true;
      self._zuletzt = Date.now();
      // Lebenszeichen wie bei WebRTC: ohne Gegenstelle bricht der Kanal nach 4 s ab
      self._takt = setInterval(function () {
        self._knoten._senden({ t: 'ping', an: self.peer, kanal: self._kid });
        if (Date.now() - self._zuletzt > 4000) self._schliessen();
      }, 1000);
      self.emit('open');
    }, 30);
  };

  TestKanal.prototype._nachricht = function (m) {
    if (this._zu) return;
    this._zuletzt = Date.now();
    if (m.t === 'daten' && this.open) this.emit('data', m.d);
    else if (m.t === 'zu') this._schliessen();
  };

  TestKanal.prototype.send = function (d) {
    if (!this.open) { this.emit('error', { type: 'not-open-yet' }); return; }
    this._knoten._senden({ t: 'daten', an: this.peer, kanal: this._kid, d: d });
  };

  TestKanal.prototype.close = function () {
    if (this._zu) return;
    this._knoten._senden({ t: 'zu', an: this.peer, kanal: this._kid });
    this._schliessen();
  };

  TestKanal.prototype._schliessen = function () {
    if (this._zu) return;
    this._zu = true;
    var war = this.open;
    this.open = false;
    clearInterval(this._takt);
    delete this._knoten._kanaele[this._kid];
    if (war) this.emit('close');
  };

  var TestTransport = {
    name: 'test',
    knoten: function (id, optionen) { return new TestKnoten(id, optionen); },
    // Testhilfen: Netz der ganzen Seite oder nur den Vermittlungsdienst trennen
    netzAus: function () { testNetz.aus = true; },
    netzAn: function () { testNetz.aus = false; },
    vermittlungTrennen: function () {
      testKnotenListe.forEach(function (k) { k.disconnect(); });
    },
    knoten_: testKnotenListe
  };

  function transportWaehlen() {
    var name = null;
    try { name = new URLSearchParams(location.search).get('transport'); } catch (e) { /* alt */ }
    name = name || (window.CONFIG && window.CONFIG.TRANSPORT) || 'peerjs';
    return name === 'test' ? TestTransport : PeerTransport;
  }

  /* =====================================================================
     Sender (Handy)
     ===================================================================== */
  var WIEDERHOLEN_MS = 10000;   // Verbindungsversuch alle 10 s
  var MELDE_ABSTAND_MS = 2000;  // höchstens eine Meldung alle 2 s
  var BESTAETIGUNG_MS = 8000;   // ohne Bestätigung gilt die Verbindung als tot
  var HINWEIS_MS = 120000;      // nach 2 min ohne Verbindung: Raumcode prüfen

  /* optionen: { transport, raumId, geraeteId, profil(), bestleistung() }
     profil()       → { spitzname, figur }
     bestleistung() → { punkte, erreichtUm } oder null */
  function Sender(optionen) {
    Ereignisse.call(this);
    this.o = optionen;
    this.transport = optionen.transport || transportWaehlen();
    this.peer = null;
    this.kanal = null;
    this.verbunden = false;
    this.aktiv = false;
    this._versuchSeit = 0;
    this._wartetAufOpen = false;
    this._getrenntSeit = Date.now();
    this._letzteMeldung = 0;
    this._gesendet = null;
    this._gesendetUm = 0;
    this.bestaetigt = null;
    this._meldeTimer = null;
    this._beendet = false;
    var self = this;
    this._takt = setInterval(function () { self._tick(); }, WIEDERHOLEN_MS);
    this._online = function () { self._tick(); };
    window.addEventListener('online', this._online);
  }
  erben(Sender);

  // Nur auf Start- und Game-over-Bildschirm aktiv – nie während eines Laufs.
  Sender.prototype.aktivieren = function () {
    if (this._beendet) return;
    this.aktiv = true;
    this._tick();
  };
  Sender.prototype.deaktivieren = function () { this.aktiv = false; };

  Sender.prototype.beenden = function () {
    this._beendet = true;
    this.aktiv = false;
    clearInterval(this._takt);
    clearTimeout(this._meldeTimer);
    window.removeEventListener('online', this._online);
    if (this.kanal) try { this.kanal.close(); } catch (e) { /* egal */ }
    if (this.peer) try { this.peer.destroy(); } catch (e) { /* egal */ }
    this.kanal = this.peer = null;
    this.verbunden = false;
  };

  Sender.prototype.status = function () {
    var b = this.o.bestleistung();
    var drauf = !!(this.verbunden && b && this.bestaetigt &&
      this.bestaetigt.punkte === b.punkte && this.bestaetigt.erreichtUm === b.erreichtUm);
    return {
      verbunden: this.verbunden,
      aufRangliste: drauf,
      hatBestleistung: !!b,
      pruefen: !this.verbunden && Date.now() - this._getrenntSeit > HINWEIS_MS
    };
  };

  Sender.prototype._statusMelden = function () { this.emit('status', this.status()); };

  Sender.prototype._tick = function () {
    if (!this.aktiv || this._beendet) return;
    if (this.verbunden) {
      if (this._gesendet && !this._istBestaetigt(this._gesendet) &&
          Date.now() - this._gesendetUm > BESTAETIGUNG_MS) {
        this._kanalWeg(true);   // keine Antwort: Verbindung neu aufbauen
      } else {
        this.melden();
        return;
      }
    }
    this._verbinden();
  };

  Sender.prototype._istBestaetigt = function (b) {
    return !!(this.bestaetigt && b && this.bestaetigt.punkte === b.punkte &&
      this.bestaetigt.erreichtUm === b.erreichtUm);
  };

  Sender.prototype._verbinden = function () {
    if (this.verbunden) return;
    if (navigator.onLine === false) return; // offline: erst beim Ereignis „online“ wieder versuchen
    // Läuft schon ein Versuch? Erst nach 15 s als gescheitert betrachten.
    if (this._versuchSeit && Date.now() - this._versuchSeit < 15000) return;
    if (this.kanal) this._kanalWeg(true);
    this._versuchSeit = Date.now();
    try {
      if (!this.peer || this.peer.destroyed) {
        this._peerErstellen();
      } else if (this.peer.disconnected) {
        this.peer.reconnect();
      }
    } catch (e) {
      this.peer = null;
      this._versuchSeit = 0;
      return;
    }
    if (this.peer.open) this._kanalAufbauen();
    else this._wartetAufOpen = true;
  };

  Sender.prototype._peerErstellen = function () {
    var self = this;
    var p = this.transport.knoten(null, {});
    this.peer = p;
    p.on('open', function () {
      if (p !== self.peer || !self._wartetAufOpen) return;
      self._wartetAufOpen = false;
      if (self.aktiv) self._kanalAufbauen();
      else self._versuchSeit = 0;
    });
    p.on('error', function (fehler) {
      if (p !== self.peer) return;
      var typ = fehler && fehler.type;
      if (typ === 'peer-unavailable' || p.destroyed || typ === 'disconnected' || typ === 'network' ||
          typ === 'server-error' || typ === 'socket-error' || typ === 'socket-closed') {
        self._wartetAufOpen = false;
        if (!self.verbunden) self._kanalWeg(true);
        self._versuchSeit = 0;
      }
    });
  };

  Sender.prototype._kanalAufbauen = function () {
    var self = this;
    var k = this.peer.connect(this.o.raumId, { serialization: 'json', reliable: true });
    if (!k) { this._versuchSeit = 0; return; }
    this.kanal = k;
    k.on('open', function () {
      if (k !== self.kanal) { try { k.close(); } catch (e) { /* egal */ } return; }
      self.verbunden = true;
      self._versuchSeit = 0;
      self.bestaetigt = null;
      self._gesendet = null;
      self._statusMelden();
      self.melden();
    });
    k.on('data', function (d) {
      if (k !== self.kanal || !d || d.typ !== 'ok') return;
      self.bestaetigt = { punkte: d.punkte, erreichtUm: d.erreichtUm };
      self._statusMelden();
    });
    k.on('close', function () { if (k === self.kanal) self._kanalWeg(false); });
    k.on('error', function () { if (k === self.kanal && !k.open) self._kanalWeg(true); });
  };

  Sender.prototype._kanalWeg = function (schliessen) {
    var k = this.kanal;
    this.kanal = null;
    if (k && schliessen) try { k.close(); } catch (e) { /* egal */ }
    if (this.verbunden) this._getrenntSeit = Date.now();
    this.verbunden = false;
    this.bestaetigt = null;
    this._gesendet = null;
    this._versuchSeit = 0;
    this._statusMelden();
  };

  // Aktuelle Bestleistung senden (falls neu), höchstens alle 2 Sekunden.
  Sender.prototype.melden = function () {
    if (!this.aktiv || !this.verbunden || !this.kanal) return;
    var b = this.o.bestleistung();
    if (!b || this._istBestaetigt(b)) return;
    if (this._gesendet && this._gesendet.punkte === b.punkte && this._gesendet.erreichtUm === b.erreichtUm &&
        Date.now() - this._gesendetUm < BESTAETIGUNG_MS) return;
    var warten = MELDE_ABSTAND_MS - (Date.now() - this._letzteMeldung);
    var self = this;
    if (warten > 0) {
      clearTimeout(this._meldeTimer);
      this._meldeTimer = setTimeout(function () { self.melden(); }, warten + 20);
      return;
    }
    var p = this.o.profil();
    var nachricht = {
      geraeteId: this.o.geraeteId,
      spitzname: p.spitzname,
      figur: p.figur,
      punkte: b.punkte,
      erreichtUm: b.erreichtUm
    };
    try {
      this.kanal.send(nachricht);
      this._letzteMeldung = Date.now();
      this._gesendet = { punkte: b.punkte, erreichtUm: b.erreichtUm };
      this._gesendetUm = Date.now();
    } catch (e) {
      this._kanalWeg(true);
    }
  };

  /* =====================================================================
     Empfaenger (Laptop / Rangliste)
     ===================================================================== */
  /* optionen: { transport, raumId, token, beiMeldung(daten, antworten), beiStatus(status) }
     status: { zustand: 'verbinde'|'bereit'|'getrennt'|'belegt', spielende: Zahl } */
  function Empfaenger(optionen) {
    Ereignisse.call(this);
    this.o = optionen;
    this.transport = optionen.transport || transportWaehlen();
    this.peer = null;
    this.zustand = 'verbinde';
    this._warOffen = false;
    this._fehlversuche = 0;
    this._neuTimer = null;
    this._kanaele = [];   // { kanal, geraeteId, meldungen: [Zeitpunkte] }
    this._gestoppt = false;
    var self = this;
    this._waechter = setInterval(function () { self._pruefen(); }, 5000);
    this._sichtbar = function () { if (!document.hidden) self._pruefen(); };
    document.addEventListener('visibilitychange', this._sichtbar);
    window.addEventListener('online', this._sichtbar);
  }
  erben(Empfaenger);

  Empfaenger.prototype.starten = function () {
    this._gestoppt = false;
    this._setzen('verbinde');
    this._peerErstellen();
  };

  Empfaenger.prototype.beenden = function () {
    this._gestoppt = true;
    clearInterval(this._waechter);
    clearTimeout(this._neuTimer);
    document.removeEventListener('visibilitychange', this._sichtbar);
    window.removeEventListener('online', this._sichtbar);
    this._kanaele.forEach(function (e) { try { e.kanal.close(); } catch (x) { /* egal */ } });
    this._kanaele = [];
    if (this.peer) try { this.peer.destroy(); } catch (e) { /* egal */ }
    this.peer = null;
  };

  Empfaenger.prototype.spielende = function () {
    var ids = {};
    var n = 0;
    this._kanaele.forEach(function (e) {
      if (!e.kanal.open) return;
      if (e.geraeteId) { if (!ids[e.geraeteId]) { ids[e.geraeteId] = 1; n++; } }
      else n++;
    });
    return n;
  };

  Empfaenger.prototype._setzen = function (zustand) {
    this.zustand = zustand;
    if (this.o.beiStatus) this.o.beiStatus({ zustand: zustand, spielende: this.spielende() });
  };

  Empfaenger.prototype._peerErstellen = function () {
    var self = this;
    var p;
    try {
      p = this.transport.knoten(this.o.raumId, { token: this.o.token });
    } catch (e) {
      this._setzen('getrennt');
      this._baldNeu();
      return;
    }
    this.peer = p;
    p.on('open', function () {
      if (p !== self.peer) return;
      self._warOffen = true;
      self._fehlversuche = 0;
      self._setzen('bereit');
    });
    p.on('connection', function (k) { if (p === self.peer) self._kanalAnnehmen(k); });
    p.on('disconnected', function () {
      if (p !== self.peer || self._gestoppt) return;
      if (self.zustand !== 'belegt') self._setzen('getrennt');
      self._baldNeu();
    });
    p.on('close', function () {
      if (p !== self.peer || self._gestoppt) return;
      if (self.zustand !== 'belegt') self._setzen('getrennt');
      self._baldNeu();
    });
    p.on('error', function (fehler) {
      if (p !== self.peer || self._gestoppt) return;
      var typ = fehler && fehler.type;
      if (typ === 'peer-unavailable') return;
      if (typ === 'unavailable-id' && !self._warOffen) {
        self._setzen('belegt');   // jemand anderes nutzt diesen Raumcode
        return;
      }
      if (self.zustand !== 'belegt') self._setzen('getrennt');
      self._baldNeu();
    });
  };

  // Verbindung zum Vermittlungsdienst unter derselben Kennung wiederherstellen.
  Empfaenger.prototype._baldNeu = function () {
    if (this._neuTimer || this._gestoppt || this.zustand === 'belegt') return;
    var warte = Math.min(15000, 1000 * Math.pow(2, this._fehlversuche));
    this._fehlversuche++;
    var self = this;
    this._neuTimer = setTimeout(function () {
      self._neuTimer = null;
      self._wiederverbinden();
    }, warte);
  };

  Empfaenger.prototype._wiederverbinden = function () {
    if (this._gestoppt || this.zustand === 'belegt') return;
    if (!this.peer || this.peer.destroyed) {
      this._peerErstellen();
      return;
    }
    if (this.peer.disconnected) {
      try {
        this.peer.reconnect();
      } catch (e) {
        try { this.peer.destroy(); } catch (x) { /* egal */ }
        this._peerErstellen();
      }
    }
  };

  Empfaenger.prototype._pruefen = function () {
    if (this._gestoppt || this.zustand === 'belegt' || this._neuTimer) return;
    if (!this.peer || this.peer.destroyed || this.peer.disconnected) {
      this._fehlversuche = 0;
      this._wiederverbinden();
    }
    this._aufraeumen();
  };

  Empfaenger.prototype.erneutVersuchen = function () {
    clearTimeout(this._neuTimer);
    this._neuTimer = null;
    this._fehlversuche = 0;
    this._warOffen = false;
    if (this.peer) try { this.peer.destroy(); } catch (e) { /* egal */ }
    this.peer = null;
    this.starten();
  };

  Empfaenger.prototype._aufraeumen = function () {
    var vorher = this._kanaele.length;
    this._kanaele = this._kanaele.filter(function (e) { return e.kanal.open || !e.geschlossen; });
    if (vorher !== this._kanaele.length) this._setzen(this.zustand);
  };

  Empfaenger.prototype._kanalAnnehmen = function (k) {
    var self = this;
    var eintrag = { kanal: k, geraeteId: null, meldungen: [], geschlossen: false };
    this._kanaele.push(eintrag);
    // Kanäle, die sich nie öffnen, nach 30 s verwerfen
    setTimeout(function () {
      if (!k.open && !eintrag.geschlossen) {
        eintrag.geschlossen = true;
        try { k.close(); } catch (e) { /* egal */ }
        self._entfernen(eintrag);
      }
    }, 30000);
    k.on('open', function () { self._setzen(self.zustand); });
    k.on('data', function (d) {
      var jetzt = Date.now();
      // Schutz vor Überflutung: höchstens 5 Meldungen in 10 s je Verbindung
      eintrag.meldungen = eintrag.meldungen.filter(function (t) { return jetzt - t < 10000; });
      if (eintrag.meldungen.length >= 5) return;
      eintrag.meldungen.push(jetzt);
      if (!d || typeof d !== 'object' || typeof d.geraeteId !== 'string') return;
      if (eintrag.geraeteId !== d.geraeteId) {
        eintrag.geraeteId = d.geraeteId;
        // Ältere Verbindungen desselben Geräts schließen
        self._kanaele.forEach(function (e) {
          if (e !== eintrag && e.geraeteId === d.geraeteId) {
            e.geschlossen = true;
            try { e.kanal.close(); } catch (x) { /* egal */ }
          }
        });
        self._aufraeumen();
        self._setzen(self.zustand);
      }
      if (self.o.beiMeldung) {
        self.o.beiMeldung(d, function (antwort) {
          if (k.open) try { k.send(antwort); } catch (e) { /* egal */ }
        });
      }
    });
    k.on('close', function () {
      eintrag.geschlossen = true;
      self._entfernen(eintrag);
    });
    k.on('error', function () { /* close folgt */ });
  };

  Empfaenger.prototype._entfernen = function (eintrag) {
    var i = this._kanaele.indexOf(eintrag);
    if (i !== -1) this._kanaele.splice(i, 1);
    this._setzen(this.zustand);
  };

  window.KB2Verbindung = {
    Sender: Sender,
    Empfaenger: Empfaenger,
    PeerTransport: PeerTransport,
    TestTransport: TestTransport,
    transportWaehlen: transportWaehlen
  };
})();
