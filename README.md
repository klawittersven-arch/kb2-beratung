# KB II – Beratung · Arbeitsblatt 12: digitale Übungen

Kleine Web-App zu Arbeitsblatt 12 („Professionell beraten“) für die generalistische
Pflegeausbildung (2. Ausbildungsjahr, Fach KB II – Kommunikation).

Die Schülerinnen und Schüler scannen einen QR-Code auf dem Arbeitsblatt und bearbeiten
am Smartphone:

| Seite | Inhalt |
|---|---|
| `aa1.html` | Arbeitsauftrag 1: Situativ oder geplant? (10 Situationen, S/G, ab Nr. 6 schwieriger) |
| `aa2.html` | Arbeitsauftrag 2: Kompetenzen erkennen (8 Verhaltensweisen, F/M/S/P) | – erst nach Arbeitsauftrag 1 freigeschaltet
| `index.html` | kurze Startseite mit Links zu beiden Aufgaben |
| `spiel.html` | verstecktes Minispiel „Diabetes Run!“ (Easter Egg) |
| `rangliste.html` | Live-Rangliste für Ihren Laptop/Beamer – **nirgends verlinkt** |

Jede Antwort bekommt sofort eine Rückmeldung: richtig (grün, ✓, Erklärung) oder falsch
(orange, ✗, Tipp; die Lösung wird nie verraten). Sind alle Karten gelöst, erscheint der
**Merksatz**, den die SuS auf das Arbeitsblatt abschreiben. Wer beide Aufgaben gelöst hat,
sieht im Merksatz-Kasten als Belohnung den Knopf „🎁 Merksatz fertig abgeschrieben? Dann tippen
Sie hier!“. Er existiert erst, wenn beide Aufgaben vollständig richtig gelöst sind (gilt 3 Stunden;
„Noch einmal üben“ nimmt die Freischaltung dieser Aufgabe zurück).

**Datenschutz:** keine Anmeldung, keine Cookies, keine Analyse, keine fremden Schriften
oder Skripte. Die Übungen übertragen keine Daten. Nur das Minispiel sendet nach jedem Lauf
Vorname, Figur und Punktzahl direkt vom Handy an Ihren Laptop (WebRTC über PeerJS, siehe
unten). Es gibt keinen eigenen Server und keine Datenbank; nichts wird dauerhaft gespeichert.

## Dateien

```
docs/                 ← alles, was GitHub Pages veröffentlicht
  inhalte.js          ← ALLE Texte (hier ändern Sie Aussagen, Tipps, Merksätze …)
  config.js           ← Einstellungen (Raum-Präfix, Anzeigedauer der Rangliste …)
  aa1.html, aa2.html, index.html, spiel.html, rangliste.html
  app.js, spiel.js, rangliste.js, verbindung.js, pixel.js, gemeinsam.js   ← Programmlogik
  style.css, spiel.css, rangliste.css                                     ← Gestaltung
  sw.js               ← Offline-Speicher (Service Worker)
  vendor/peerjs.min.js, vendor/LICENSE-peerjs.txt   ← Bibliothek PeerJS 1.5.5 (MIT)
qr/                   ← QR-Codes (PNG) für aa1.html und aa2.html
werkzeuge/qr_einsetzen.py   ← erzeugt die QR-Codes und setzt sie ins Arbeitsblatt
KB2_AB12_Professionell_beraten_digital.docx          ← Original (unverändert)
KB2_AB12_Professionell_beraten_digital_mit_QR.docx   ← Arbeitsblatt mit QR-Codes zum Ausdrucken
tests/                ← automatische Tests (siehe tests/README.md)
```

## Texte ändern (`docs/inhalte.js`)

Öffnen Sie auf GitHub die Datei `docs/inhalte.js` und klicken Sie auf den Stift („Edit this file“).

- Ändern Sie nur den Text **zwischen den einfachen Hochkommas** `' … '`.
- Hochkommas, Kommas am Zeilenende und Klammern `{ } [ ]` bleiben stehen.
- Deutsche Anführungszeichen „ … “ dürfen Sie frei verwenden; ein einfaches Hochkomma im
  Text schreiben Sie als `\'`.
- Richtige Antwort: `richtig: 'S'`; sind zwei Antworten richtig: `richtig: ['M', 'S']` und
  dann je Antwort eine Erklärung `erklaerung: { M: '…', S: '…' }`.
- Unten auf „Commit changes“ klicken. Nach 1–2 Minuten ist die Änderung online.

Die Datei ist ausführlich kommentiert. Auch die „Wusstest du?“-Sätze des Spiels und alle
Beschriftungen der Rangliste stehen dort.

### Schutz gegen Durchklicken

Bei jeder Aufgabe steht in `docs/inhalte.js` `mindestensErsterVersuch` (Aufgabe 1: 7 von 10,
Aufgabe 2: 5 von 8). Sind weniger Karten beim ersten Versuch richtig, erscheint statt des
Merksatzes „Hey, nicht einfach durchklicken!“ mit dem Knopf „Aufgabe neu starten“. Dann gibt es
weder Merksatz noch Freischaltung. Mit `0` schalten Sie die Prüfung ab.

## Einstellungen ändern (`docs/config.js`)

| Einstellung | Bedeutung |
|---|---|
| `RAUM_PRAEFIX` | wird vor den vierstelligen Raumcode gesetzt (`kb2-ab12-pflegesprint-4821`), damit es keine Überschneidung mit fremden Nutzern des PeerJS-Dienstes gibt |
| `ANZEIGE_MINUTEN` | die Rangliste zeigt nur Punkte der letzten so vielen Minuten (Standard 45) |
| `RAUMCODE_GUELTIG_STUNDEN` | so lange merkt sich ein Handy den Raumcode (Standard 3) |
| `RANGLISTE_PLAETZE` | Anzahl der angezeigten Plätze (Standard 10) |
| `SPERRWOERTER` | einfacher Filter gegen beleidigende Vornamen – beliebig ergänzbar |

Nach größeren Änderungen können Sie in `docs/sw.js` die Zeile `var VERSION = 'v1';` auf
`'v2'` usw. erhöhen. Dann erneuern alle Handys ihren Offline-Speicher. (Kleine Textänderungen
kommen auch ohne das an, sobald ein Handy Netz hat.)

## GitHub Pages einschalten

1. Auf GitHub im Repository oben **Settings** öffnen.
2. Links **Pages** wählen.
3. Bei „Build and deployment“ → Source: **Deploy from a branch**.
4. Branch: **main**, Ordner: **/docs** → **Save**.
5. Nach etwa 1–5 Minuten sind die Seiten erreichbar:
   - https://klawittersven-arch.github.io/kb2-beratung/aa1.html
   - https://klawittersven-arch.github.io/kb2-beratung/aa2.html
   - https://klawittersven-arch.github.io/kb2-beratung/ (Startseite)

Die QR-Codes im Arbeitsblatt zeigen bereits auf diese Adressen.

## QR-Codes neu erzeugen

Nur nötig, wenn sich Repository-Name oder Besitzer ändern:

```
pip install segno python-docx zxing-cpp pillow
python werkzeuge/qr_einsetzen.py
```

Das Skript liest die Adresse aus dem Git-Remote, erzeugt `qr/qr_aa1.png` und `qr/qr_aa2.png`
(Fehlerkorrektur M, Ruhezone 4 Module, 615 × 615 px), prüft, dass sie sich lesen lassen, und
setzt sie anstelle der Platzhalter `[QR-AA1]`, `[QR-AA2]`, `[LINK-AA1]`, `[LINK-AA2]` in das
Arbeitsblatt ein (Ergebnis: `…_mit_QR.docx`, das Original bleibt unverändert).

## Minispiel „Diabetes Run!“ und Live-Rangliste im Unterricht

**Idee:** Wer beide Aufgaben gelöst hat, findet das versteckte Spiel. Die Krankenschwester läuft auf
der Tour des ambulanten Pflegedienstes durchs Kochertal: über Kuchen, Weinkisten, Rollatoren
Pflegewagen und Schlaglöcher springen (auch Doppelsprung), unter Wespenschwärmen wegducken. Nach 30 Sekunden
wird es rasant schwerer; ein Lauf dauert praktisch nie länger als 2 Minuten. Kein Ton.
Das Spiel läuft komplett auf dem Handy; nur nach jedem Lauf geht eine winzige Punktemeldung
an Ihren Laptop.

**Vor der Stunde**

1. Denken Sie sich einen vierstelligen **Raumcode** aus (z. B. `4821`) – oder lassen Sie sich
   auf der Ranglisten-Seite mit „Zufälligen Code vorschlagen“ einen geben.
2. Setzen Sie die Zahl **kommentarlos** auf eine Folie Ihrer Präsentation.
3. Öffnen Sie am Laptop `https://klawittersven-arch.github.io/kb2-beratung/rangliste.html`,
   geben Sie denselben Code ein und klicken Sie „Rangliste starten“.
   (Abkürzung: `…/rangliste.html?raum=4821` startet direkt.)
4. Lassen Sie die Seite **im Hintergrund offen** (PowerPoint im Vordergrund ist in Ordnung).
   Den Laptop nicht in den Ruhezustand gehen lassen (Energieeinstellungen; die Seite hält den
   Bildschirm wach, solange sie sichtbar ist).

**In der Stunde**

- Wer beide Aufgaben gelöst hat, wird im Spiel nach dem Raumcode „der gerade in der
  Präsentation angezeigt wird“ gefragt – jetzt wird klar, wozu die Zahl auf der Folie dient.
- Das Spiel ist sofort spielbar, auch wenn die Rangliste noch nicht offen ist. Bestleistungen
  werden automatisch nachgereicht, sobald die Rangliste erreichbar ist.
- Zum passenden Zeitpunkt wechseln Sie zur Ranglisten-Seite und klicken **Vollbild**.
- Der Raumcode steht groß in der Ecke („Nachzügler: Raumcode im Spiel eingeben“).
- Solange noch niemand gespielt hat, zeigt die Seite nur ruhig „Warten auf die ersten Läufe …“.
- **Moderation:** Klick auf einen Eintrag → „Eintrag ausblenden“ (dieses Gerät) oder „Diesen
  Namen überall ausblenden“. „Liste leeren“ entfernt alle Einträge (mit Rückfrage).
- Gleiche Vornamen werden unterschieden („Mia“, „Mia (2)“). Pro Gerät zählt die Bestleistung
  der letzten `ANZEIGE_MINUTEN` Minuten.
- Ein versehentliches Neuladen der Rangliste ist unproblematisch (Einträge bleiben erhalten).
- **Probeansicht:** `…/rangliste.html?demo=1` zeigt erfundene Einträge – ideal, um vorab das
  Aussehen am Beamer zu prüfen.

**Direktlink zum Spiel** (ohne vorher die Aufgaben zu lösen, z. B. für eine Vertretung oder
eine Pause): `https://klawittersven-arch.github.io/kb2-beratung/spiel.html?zugang=kochertal`
– mit Raumcode gleich eingetragen: `…/spiel.html?zugang=kochertal&raum=4821`. Das Schlüsselwort
steht in `docs/config.js` (`DIREKTLINK_SCHLUESSEL`); ändern Sie es, wenn ein verschickter Link
nicht mehr funktionieren soll.

**Technik und Datenschutz der Live-Verbindung:** Handy und Laptop verbinden sich direkt per
WebRTC. Zum „Bekanntmachen“ nutzt die Bibliothek PeerJS den kostenlosen Vermittlungsdienst
`0.peerjs.com`; für den Verbindungsaufbau werden die STUN-Server von Google und – falls ein
Schulnetz direkte Verbindungen blockiert – die TURN-Server von PeerJS verwendet (Standard-
Einstellung von PeerJS). Übertragen werden nur `{ geraeteId, spitzname, figur, punkte, erreichtUm }`
(die Geräte-ID ist eine Zufallszahl). Die Rangliste hält alles nur im Browser des Laptops
(`sessionStorage`) und verwirft Einträge nach `ANZEIGE_MINUTEN` Minuten.

Wenn die Verbindung im Schulnetz nicht klappt, funktionieren Übungen und Spiel trotzdem –
nur die Rangliste bleibt leer. Probieren Sie es deshalb vorher einmal im Klassenzimmer aus
(Laptop im Schul-WLAN, ein Handy im Schul-WLAN, eins mit mobilen Daten).

## Offline

Beim ersten Aufruf speichert ein Service Worker alle Dateien. Danach funktionieren Übungen
und Spiel auch bei schlechtem oder kurz unterbrochenem WLAN; Punkte werden nachgereicht,
sobald wieder eine Verbindung besteht.

## Tests

Siehe `tests/README.md` (Playwright: Übungen, Texte, Spiel, Live-Rangliste, Leistung, Offline).

## Lizenzen

PeerJS 1.5.5 – MIT-Lizenz (`docs/vendor/LICENSE-peerjs.txt`). Alle Grafiken des Spiels sind
im Code selbst gezeichnet.
