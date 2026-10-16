# Automatische Tests

Die Tests nutzen [Playwright](https://playwright.dev) mit Chromium und starten selbst einen
kleinen lokalen Webserver für den Ordner `docs/`. Die Live-Rangliste wird mit der
**Test-Transportschicht** geprüft (`?transport=test`): Statt über den PeerJS-Dienst laufen die
Nachrichten über `window.TEST_BUS`, den die Tests zwischen mehreren Browser-Kontexten
(= mehreren „Handys“ und dem „Laptop“) weiterreichen.

```
cd tests
npm install            # installiert Playwright
npx playwright install chromium
node uebungen.test.js            # aa1/aa2 in Handygröße 390 × 844
node inhalte.test.js             # Texte in inhalte.js Zeichen für Zeichen gegen den Auftrag
node spiel.test.js               # Sperre, Einrichtung, Tastatur, Touch, 30/60/120 Hz
node rangliste.test.js           # Live-Rangliste, Szenarien (a)–(h)  (~4 Minuten)
node offline_datenschutz.test.js # Offline, externe Adressen, Cookies, Dateigrößen
node leistung.test.js [Sekunden] # Bildrate mit CPU-Drosselung 1×/4×/6×, 40 Handys (~11 Minuten)
```

Ergebnisse der letzten Läufe liegen in `tests/ergebnisse/`.
