/* ==========================================================================
   INHALTE – Arbeitsblatt 12 (KB II – Beratung)
   ==========================================================================

   In dieser Datei stehen ALLE Texte der Übungen und des Minispiels.
   Sie können die Texte hier ändern, ohne etwas vom Programm zu verstehen.

   So ändern Sie einen Text sicher:
   - Ändern Sie nur, was ZWISCHEN den einfachen Hochkommas ' … ' steht.
   - Die Hochkommas selbst, die Kommas am Zeilenende und die Klammern
     { } [ ] müssen stehen bleiben.
   - Deutsche Anführungszeichen „ … “ dürfen Sie im Text frei verwenden.
     Ein einfaches Hochkomma (') im Text müssen Sie als \' schreiben.
   - Nach dem Speichern die Seite im Browser neu laden und kurz prüfen.

   Aufbau einer Karte (Aussage):
     nummer      – die Nummer, die auf der Karte steht
     text        – die Aussage
     richtig     – das Kürzel der richtigen Antwort, z. B. 'S'.
                   Sind mehrere Antworten richtig, schreiben Sie eine Liste:
                   ['M', 'S']
     erklaerung  – erscheint, wenn richtig geantwortet wurde.
                   Bei mehreren richtigen Antworten pro Antwort eine eigene
                   Erklärung: { M: '…', S: '…' }
     tipp        – erscheint nach einer falschen Antwort.
                   (Die richtige Lösung wird nie direkt verraten.)
   ========================================================================== */

var INHALTE = {

  /* ------------------------------------------------------------------------
     Texte, die auf allen Übungsseiten gleich sind
     ------------------------------------------------------------------------ */
  allgemein: {
    kopfzeile: 'KB II – Beratung',
    merksatzUeberschrift: 'Ihr Merksatz',
    merksatzHinweis: 'Schreiben Sie den Merksatz auf Ihr Arbeitsblatt.',
    // {x} und {y} werden automatisch durch Zahlen ersetzt.
    fortschritt: '{x} von {y} richtig',
    ersterVersuch: 'Beim ersten Versuch richtig: {x} von {y}',
    nochEinmal: 'Noch einmal üben',
    richtigText: 'Richtig!',
    falschText: 'Noch nicht richtig – versuchen Sie es noch einmal.',
    tippVorwort: 'Tipp:',
    // Erscheint statt des Merksatzes, wenn zu wenige Karten beim ersten Versuch richtig waren.
    // {x} = beim ersten Versuch richtig, {y} = Anzahl Karten, {z} = nötige Mindestzahl
    durchklickenTitel: 'Hey, nicht einfach durchklicken!',
    durchklickenText: 'Beim ersten Versuch richtig: {x} von {y} – nötig sind mindestens {z}. Lesen Sie jede Aussage genau und überlegen Sie, bevor Sie antworten. Dann erhalten Sie auch Ihren Merksatz.',
    durchklickenKnopf: 'Aufgabe neu starten',
    // Erscheint erst, wenn BEIDE Aufgaben vollständig richtig gelöst sind
    easterEggKnopf: '🎁 Merksatz fertig abgeschrieben? Dann tippen Sie hier!'
  },

  /* ------------------------------------------------------------------------
     ARBEITSAUFTRAG 1 (Seite aa1.html)
     ------------------------------------------------------------------------ */
  aa1: {
    titel: 'Arbeitsauftrag 1: Situativ oder geplant?',
    anweisung: 'Ordnen Sie die Situationen zu: S = situative Beratung, G = geplante Beratung.',

    // Die Antwortknöpfe auf jeder Karte (Kürzel und Beschriftung)
    antworten: [
      { kuerzel: 'S', text: 'S – situativ' },
      { kuerzel: 'G', text: 'G – geplant' }
    ],

    // Wird vor jeden Kartentext gesetzt (hier leer = nichts davor)
    kartenAnfang: '',

    // So viele Karten müssen beim ERSTEN Versuch richtig sein, sonst gibt es
    // keinen Merksatz und die Aufgabe muss neu gestartet werden (0 = keine Prüfung)
    mindestensErsterVersuch: 7,

    karten: [
      {
        nummer: 1,
        text: 'Während der Insulingabe fragt Herr Brenner: „Warum muss ich das Zeug eigentlich abends spritzen?“',
        richtig: 'S',
        erklaerung: 'Die Frage entsteht spontan während einer Pflegehandlung – typisch für situative Beratung.',
        tipp: 'Gab es einen vereinbarten Termin – oder ergibt sich die Frage spontan?'
      },
      {
        nummer: 2,
        text: 'Lina vereinbart mit Herrn und Frau Brenner für Donnerstag, 16:00 Uhr, ein 30-minütiges Gespräch im Wohnzimmer.',
        richtig: 'G',
        erklaerung: 'Fester Termin, ruhiger Ort, ausreichend Zeit und beide Beteiligten – ein geplantes Gespräch.',
        tipp: 'Achten Sie auf Termin, Ort und Zeitrahmen.'
      },
      {
        nummer: 3,
        text: 'Frau Brenner spricht Lina an der Haustür auf den Kuchen an.',
        richtig: 'S',
        erklaerung: 'Ein „Tür-und-Angel-Gespräch“: spontan, unter Zeitdruck, ohne Privatsphäre. Das Thema gehört später in ein geplantes Gespräch.',
        tipp: 'Wo und wann findet dieses Gespräch statt?'
      },
      {
        nummer: 4,
        text: 'Beim Blutzuckermessen erzählt Herr Brenner: „Gestern war mir wieder so komisch.“ Lina fragt nach.',
        richtig: 'S',
        erklaerung: 'Lina greift eine Bemerkung spontan auf. So werden Beratungsbedarfe oft erst erkannt.',
        tipp: 'Hat Lina dieses Gespräch vorbereitet?'
      },
      {
        nummer: 5,
        text: 'Lina und Herr Brenner verabreden, in zwei Wochen gemeinsam auf seine Erfahrungen mit den vereinbarten Schritten zu schauen.',
        richtig: 'G',
        erklaerung: 'Ein vereinbarter Folgetermin zur Auswertung ist Teil des geplanten Beratungsprozesses.',
        tipp: 'Wird hier etwas für später verabredet?'
      },
      // Ab hier: schwierigere Situationen (Hinweise sind weniger eindeutig)
      {
        nummer: 6,
        text: 'Beim Verbandswechsel wirkt Herr Brenner beunruhigt. Lina setzt sich danach zehn Minuten zu ihm und bespricht mit ihm, wie er seine Füße täglich kontrollieren kann.',
        richtig: 'S',
        erklaerung: 'Lina nimmt sich zwar bewusst Zeit – das Gespräch ergibt sich aber spontan aus der Pflegesituation und war nicht verabredet. Das ist situative Beratung.',
        tipp: 'Lina nimmt sich Zeit – aber war dieses Gespräch vorher verabredet?'
      },
      {
        nummer: 7,
        text: 'Wie beim letzten Besuch angekündigt, bringt Lina eine Broschüre zur Unterzuckerung mit und geht sie mit Herrn Brenner in Ruhe Seite für Seite durch.',
        richtig: 'G',
        erklaerung: 'Das Gespräch ist angekündigt und vorbereitet (Thema und Material ausgewählt). Auch wenn es während eines normalen Hausbesuchs stattfindet, ist es geplante Beratung.',
        tipp: 'Nicht der Ort entscheidet: Hat Lina das Gespräch angekündigt und vorbereitet?'
      },
      {
        nummer: 8,
        text: 'Frau Brenner ruft aufgeregt beim Pflegedienst an: Ihr Mann habe drei Stück Kuchen gegessen – was solle sie jetzt tun? Lina beantwortet ihre Fragen am Telefon.',
        richtig: 'S',
        erklaerung: 'Ein unerwarteter Anruf mit einem akuten Anliegen: Lina reagiert situativ. Das Grundthema (Umgang mit Kuchen) gehört danach in ein geplantes Gespräch.',
        tipp: 'Wer hat das Gespräch angestoßen – und war es verabredet?'
      },
      {
        nummer: 9,
        text: 'Beim Gespräch am Donnerstag kommen Herrn Brenner beim Thema Einsamkeit die Tränen. Lina schlägt vor, darüber in der nächsten Woche in einem eigenen Termin in Ruhe zu sprechen.',
        richtig: 'G',
        erklaerung: 'Lina erkennt ein emotionales Thema und verabredet dafür bewusst einen eigenen Termin mit Zeit und Ruhe – das ist geplante Beratung.',
        tipp: 'Worum geht es in der Aussage: um das Gespräch am Donnerstag – oder um das, was Lina vorschlägt?'
      },
      {
        nummer: 10,
        text: 'Die Tochter der Brenners spricht Lina im Treppenhaus an: „Können Sie meinem Vater nicht mal sagen, dass er mit dem Kuchen aufhören soll?“',
        richtig: 'S',
        erklaerung: 'Zwischen Tür und Angel, ohne Termin und ohne Herrn Brenner: situativ. Das Anliegen gehört in ein geplantes Gespräch mit allen Beteiligten.',
        tipp: 'Achten Sie auf Ort, Zeitpunkt und darauf, wer beteiligt ist.'
      }
    ],

    // Erscheint erst, wenn alle Karten richtig gelöst sind.
    // Wörter zwischen **…** werden fett und unterstrichen angezeigt.
    merksatz: 'Situativ wird ein Beratungsbedarf **erkannt** – geplant wird er in Ruhe **bearbeitet**: Komplexe, emotionale oder konfliktreiche Themen brauchen einen vereinbarten Termin.'

    // Alternativen zum Austauschen (einfach eine davon oben einsetzen):
    // 'Situativ erkennen, geplant vertiefen: Im Pflegealltag fallen Beratungsbedarfe auf – in einem vereinbarten Gespräch werden sie mit Zeit und Ruhe gemeinsam bearbeitet.'
    // 'Situative Beratung entdeckt den Bedarf, geplante Beratung bearbeitet ihn – mit Termin, Ruhe, Zeit und allen Beteiligten.'
    // 'Situativ: Bedarf erkennen und kurz reagieren. Geplant: das Thema in Ruhe vertiefen und gemeinsam Lösungen entwickeln.'
    // 'Zwischen Tür und Angel wird ein Thema erkannt – gelöst wird es im geplanten Gespräch.'
  },

  /* ------------------------------------------------------------------------
     ARBEITSAUFTRAG 2 (Seite aa2.html)
     ------------------------------------------------------------------------ */
  aa2: {
    titel: 'Arbeitsauftrag 2: Kompetenzen erkennen',
    anweisung: 'Ordnen Sie Linas Verhaltensweisen jeweils einem Kompetenzbereich zu: F = Fach-, M = Methoden-, S = sozial-kommunikative, P = personale Kompetenz.',

    antworten: [
      { kuerzel: 'F', text: 'F – Fach' },
      { kuerzel: 'M', text: 'M – Methoden' },
      { kuerzel: 'S', text: 'S – sozial-kommunikativ' },
      { kuerzel: 'P', text: 'P – personal' }
    ],

    // Jede Karte beginnt mit „Lina …“
    kartenAnfang: 'Lina',

    // So viele Karten müssen beim ERSTEN Versuch richtig sein (0 = keine Prüfung)
    mindestensErsterVersuch: 5,

    // Diese Aufgabe lässt sich erst öffnen, wenn Arbeitsauftrag 1 gelöst ist
    voraussetzung: 'aa1',
    gesperrtText: 'Lösen Sie zuerst Arbeitsauftrag 1!',
    gesperrtLink: 'Zu Arbeitsauftrag 1',

    karten: [
      {
        nummer: 1,
        text: '… erklärt Herrn Brenner in einfachen Worten, woran man eine Unterzuckerung erkennt.',
        richtig: 'F',
        erklaerung: 'Fachwissen korrekt und verständlich weitergeben gehört zur Fachkompetenz.',
        tipp: 'Geht es um Wissen, um eine Gesprächstechnik, um die Beziehung oder um Lina selbst?'
      },
      {
        nummer: 2,
        text: '… fasst zusammen: „Sie möchten bei der Weinlese helfen – und gleichzeitig sicher sein, dass Ihnen nicht wieder so komisch wird.“',
        // ACHTUNG: Hier sind ZWEI Antworten richtig (M und S).
        richtig: ['M', 'S'],
        erklaerung: {
          M: 'Zusammenfassen ist eine Gesprächstechnik – Methodenkompetenz. Weil Lina damit auch Verständnis zeigt, ist sozial-kommunikative Kompetenz ebenfalls vertretbar.',
          S: 'Vertretbar: Lina zeigt Verständnis für Herrn Brenner. Vor allem ist Zusammenfassen aber eine Gesprächstechnik – also Methodenkompetenz.'
        },
        tipp: 'Welche Gesprächstechnik setzt Lina hier ein?'
      },
      {
        nummer: 3,
        text: '… merkt, dass sie sich über die Aussage „nur ein bisschen Alterszucker“ ärgert, und atmet durch, bevor sie antwortet.',
        richtig: 'P',
        erklaerung: 'Lina nimmt ihre eigenen Gefühle wahr und reguliert sie – personale Kompetenz.',
        tipp: 'Um wessen Gefühle geht es hier?'
      },
      {
        nummer: 4,
        text: '… fragt auch Frau Brenner, wie es ihr mit der Situation geht.',
        richtig: 'S',
        erklaerung: 'Lina bezieht die Bezugsperson ein und erfragt alle Sichtweisen – sozial-kommunikative Kompetenz.',
        tipp: 'Wen bezieht Lina in das Gespräch ein?'
      },
      {
        nummer: 5,
        text: '… weiß, dass eine Insulindosis nur nach ärztlicher Anordnung verändert werden darf.',
        richtig: 'F',
        erklaerung: 'Rechtliche Grenzen zu kennen gehört zur Fachkompetenz.',
        tipp: 'Ist das Wissen, eine Technik, Beziehungsgestaltung oder Selbstreflexion?'
      },
      {
        nummer: 6,
        text: '… fragt: „Wie sicher fühlen Sie sich auf einer Skala von 0 bis 10, eine Unterzuckerung zu erkennen?“',
        richtig: 'M',
        erklaerung: 'Die Skalierungsfrage ist eine Gesprächstechnik – Methodenkompetenz.',
        tipp: 'Welche Fragetechnik nutzt Lina?'
      },
      {
        nummer: 7,
        text: '… akzeptiert, dass Herr Brenner sonntags weiterhin Kuchen essen möchte, und sucht mit ihm nach einem guten Umgang damit.',
        richtig: 'S',
        erklaerung: 'Wertschätzung und der Umgang mit Ambivalenz gehören zur sozial-kommunikativen Kompetenz.',
        tipp: 'Lina gestaltet hier die Beziehung zu Herrn Brenner – denken Sie an die Grundhaltungen nach Rogers.'
      },
      {
        nummer: 8,
        text: '… spricht in der Teambesprechung an, dass sie bei Familie Brenner „zwischen die Fronten“ zu geraten droht.',
        richtig: 'P',
        erklaerung: 'Lina erkennt ihre eigenen Grenzen, klärt ihre Rolle und holt sich Unterstützung – personale Kompetenz.',
        tipp: 'Kümmert sich Lina hier um die Familie – oder um ihre eigene Rolle?'
      }
    ],

    // \n = Zeilenumbruch, **…** = fett und unterstrichen
    merksatz: 'Fach im Kopf, Methode in der Hand,\nsozial mit Herz – und personal: den Blick auf mich gewandt.',

    // Aufklappbare Hilfe (nur bei Arbeitsauftrag 2
    hilfe: {
      ueberschrift: 'Hilfe: Die vier Kompetenzbereiche',
      bereiche: [
        {
          name: 'Fachkompetenz',
          punkte: [
            'aktuelles pflegerisches und medizinisches Fachwissen (z. B. Diabetes, Unterzuckerung)',
            'Wissen über Hilfsangebote und Netzwerke',
            'rechtliche Grenzen kennen',
            'Informationen fachlich korrekt und verständlich geben'
          ]
        },
        {
          name: 'Methodenkompetenz',
          punkte: [
            'Beratungsprozess strukturieren (sechs Phasen)',
            'Gesprächstechniken: offene Fragen, aktives Zuhören, Paraphrasieren, Zusammenfassen, Skalierungsfragen',
            'Ziele SMART formulieren',
            'Material einsetzen, dokumentieren'
          ]
        },
        {
          name: 'Sozial-kommunikative Kompetenz',
          punkte: [
            'Beziehung aufbauen',
            'Grundhaltungen nach Rogers: Empathie, Wertschätzung, Kongruenz',
            'alle Sichtweisen erfragen, keine Partei ergreifen',
            'mit Ambivalenz und Konflikten umgehen',
            'Bezugspersonen einbeziehen'
          ]
        },
        {
          name: 'Personale Kompetenz',
          punkte: [
            'eigene Haltung, Werte und Gefühle reflektieren',
            'eigene Grenzen erkennen und weitervermitteln',
            'Selbstfürsorge („doppelte Fürsorge“)',
            'Verantwortung übernehmen, die eigene Rolle klären'
          ]
        }
      ]
    }
  },

  /* ------------------------------------------------------------------------
     STARTSEITE (index.html)
     ------------------------------------------------------------------------ */
  start: {
    titel: 'Professionell beraten',
    einleitung: 'Wählen Sie die Aufgabe, deren QR-Code Sie auf dem Arbeitsblatt sehen.',
    linkAA1: 'Arbeitsauftrag 1: Situativ oder geplant?',
    linkAA2: 'Arbeitsauftrag 2: Kompetenzen erkennen'
  },

  /* ------------------------------------------------------------------------
     MINISPIEL „Diabetes Run!“ (spiel.html)
     ------------------------------------------------------------------------ */
  spiel: {
    titel: 'Diabetes Run!',
    gesperrt: 'Lösen Sie zuerst beide Aufgaben.',

    spitznameFrage: 'Ihr Vorname:',
    spitznameHinweis: 'Bitte tragen Sie Ihren Vornamen ein – so sieht die Klasse auf der Rangliste, wer gespielt hat. Gibt es Ihren Vornamen zweimal, hängen Sie den ersten Buchstaben Ihres Nachnamens an (z. B. „Mia K“). Vorname und Punkte erscheinen nur während des Unterrichts auf der Rangliste und werden nicht gespeichert.',
    spitznameFehlerLaenge: 'Bitte 2 bis 12 Zeichen eingeben.',
    spitznameFehlerZeichen: 'Erlaubt sind Buchstaben, Ziffern, Leerzeichen, - und _.',
    spitznameFehlerWort: 'Bitte geben Sie Ihren Vornamen ein.',

    raumcodeFrage: 'Geben Sie den vierstelligen Raumcode ein, der gerade in der Präsentation angezeigt wird.',
    raumcodeFehler: 'Bitte genau 4 Ziffern eingeben.',

    weiter: 'Weiter',
    los: 'Los geht’s!',
    nochmal: 'Nochmal',
    zurueckZumStart: 'Zum Startbildschirm',
    raumcodeAendern: 'Raumcode ändern',
    figurAendern: 'Vornamen ändern',
    bestleistung: 'Ihre Bestleistung: {x}',
    punkte: 'Punkte: {x}',
    neueBestleistung: 'Neue Bestleistung!',
    gameOver: 'Game over',
    pausiert: 'Pause – tippen Sie hier, um weiterzuspielen.',

    steuerungHandy: 'Tippen Sie unten auf „⬆ Springen“ oder „⬇ Ducken“. In der Luft noch einmal springen = Doppelsprung.',
    steuerungTastatur: 'Tastatur: Leertaste oder Pfeil hoch = springen, Pfeil runter = ducken.',
    spielidee: 'Die Pflegekraft ist auf Tour, der Zeitplan ist eng – und es lauern zahlreiche Gefahren, nicht nur für ihren Blutzucker! Verlockende Kuchen, Weinkisten, Rollatoren, Pflegewagen und Schlaglöcher überspringen, unter Wespenschwärmen durchducken, und für den Lkw braucht es einen Doppelsprung. Ab 30 Sekunden geht’s erst richtig los!',
    knopfDucken: '⬇ Ducken',
    knopfSpringen: '⬆ Springen',

    // Statuszeile zur Live-Rangliste (nur Start- und Game-over-Bildschirm)
    statusVerbunden: '📡 Ihre Bestleistung ist auf der Rangliste.',
    statusVerbundenOhnePunkte: '📡 Verbunden – Ihre Bestleistung erscheint auf der Rangliste.',
    statusWartet: '📡 Ihre Bestleistung wird automatisch übertragen.',
    statusPruefen: 'Raumcode richtig eingegeben?',

    wusstestDuUeberschrift: 'Wusstest du?',
    // Nach jedem „Game over“ erscheint zufällig einer dieser Sätze.
    wusstestDu: [
      'Anzeichen einer Unterzuckerung: Zittern, Schwitzen, Herzklopfen, Heißhunger, Verwirrtheit.',
      'Unterzuckerung bei wacher Person: 15–20 g schnell wirksame Kohlenhydrate, z. B. Traubenzucker oder 200 ml Fruchtsaft – nach etwa 15 Minuten erneut messen.',
      'Bewusstlos? Nichts einflößen, stabile Seitenlage, Notruf 112.',
      'Beraten statt belehren: Die Entscheidung bleibt bei der beratenen Person.',
      'Komplexe Themen brauchen ein geplantes Gespräch – nicht zwischen Tür und Angel.'
    ]
  },

  /* ------------------------------------------------------------------------
     RANGLISTE für den Beamer (rangliste.html – nirgends verlinkt)
     ------------------------------------------------------------------------ */
  rangliste: {
    titel: 'Diabetes Run! – Rangliste',
    raumcodeFrage: 'Raumcode Ihrer Folie',
    raumcodeFehler: 'Bitte genau 4 Ziffern eingeben.',
    starten: 'Rangliste starten',
    vorschlagen: 'Zufälligen Code vorschlagen',
    einrichtungHinweis: 'Geben Sie denselben vierstelligen Code ein, der auf Ihrer Folie steht. Lassen Sie diese Seite während der Stunde geöffnet (sie darf im Hintergrund bleiben).',
    raumcode: 'Raumcode',
    nachzuegler: 'Nachzügler: Raumcode im Spiel eingeben',
    warten: 'Warten auf die ersten Läufe …',
    punkte: 'Punkte',
    // {x} wird durch die Anzahl ersetzt
    verbunden: '{x} Spielende verbunden',
    statusVerbinde: 'Verbindung wird aufgebaut …',
    statusBereit: 'Bereit',
    statusGetrennt: 'Verbindung unterbrochen – wird automatisch wiederhergestellt …',
    belegt: 'Dieser Raumcode wird gerade schon verwendet – bitte einen anderen wählen.',
    erneutVersuchen: 'Erneut versuchen',
    andererCode: 'Anderen Raumcode wählen',
    vollbild: 'Vollbild',
    vollbildEnde: 'Vollbild beenden',
    leeren: 'Liste leeren',
    leerenFrage: 'Wirklich alle Einträge aus der Rangliste entfernen?',
    leerenJa: 'Ja, Liste leeren',
    abbrechen: 'Abbrechen',
    // {name} wird durch den Spitznamen ersetzt
    ausblendenFrage: 'Eintrag „{name}“ ausblenden?',
    ausblenden: 'Eintrag ausblenden',
    nameAusblenden: 'Diesen Namen überall ausblenden',
    codeWechseln: 'Raumcode wechseln',
    demo: 'Demo-Modus: erfundene Einträge'
  }
};
