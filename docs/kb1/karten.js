/* =====================================================================
 * LERNKARTEN KB I – Diabetes mellitus
 * Alle Texte der Lernkarten stehen in dieser Datei.
 * =====================================================================
 *
 * So ändern Sie eine Karte (direkt auf GitHub: Stift „Edit this file“):
 *  - Ändern Sie nur den Text zwischen den einfachen Hochkommas  ' … '.
 *  - Hochkommas, Kommas am Zeilenende und Klammern { } [ ] bleiben stehen.
 *  - Deutsche Anführungszeichen „ … “ dürfen Sie frei verwenden;
 *    ein einfaches Hochkomma im Text schreiben Sie als  \'
 *  - **fett**  und  *kursiv*  funktionieren wie in der Ich-kann-Liste;
 *    <br> erzwingt einen Zeilenumbruch.
 *
 * Aufbau einer Karte:
 *   {
 *     nr: 2,                        ← Nummer der Kompetenz in der Ich-kann-Liste (optional)
 *     vorne: 'Ich kann …',          ← Vorderseite (die Kompetenz)
 *     fall: 'Jana ist …',           ← (optional) Fall oder Aussage, eingerahmt unter der Kompetenz
 *     hinten: ['Punkt 1', 'Punkt 2'],  ← Rückseite: jeder Eintrag wird ein Stichpunkt
 *     nummeriert: true,             ← (optional) 1., 2., 3. statt Punkten; start: 4 beginnt bei 4.
 *     hinweis: '…'                  ← (optional) kleiner Kasten unten auf der Rückseite
 *   },
 *
 * Neue Karte: eine vorhandene Karte samt { … }, kopieren und darunter einfügen.
 * Der Lernstand der SuS hängt am Text der Vorderseite: Wird die Vorderseite
 * geändert, gilt die Karte auf den Handys wieder als „neu“.
 * ===================================================================== */

var LERNKARTEN = {
  titel: 'KB I – Diabetes mellitus',
  untertitel: 'Lernkarten zur Ich-kann-Liste',
  klausur: 'Klausur am 09.11.2026',
  // Schlüssel für den Lernstand auf dem Handy – nur ändern, wenn alle neu beginnen sollen
  speicherName: 'kb1-diabetes',

  themen: [

    /* ------------------------------------------------------------------ */
    {
      titel: 'Operatoren – was wird von mir erwartet?',
      karten: [
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *nennen* steht?',
          hinten: 'Fakten knapp aufzählen, ohne Erklärung.',
          hinweis: 'Niveau I – Wissen wiedergeben' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *beschreiben* steht?',
          hinten: 'geordnet in Fachsprache wiedergeben',
          hinweis: 'Niveau I – Wissen wiedergeben' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *identifizieren* steht?',
          hinten: 'Informationen im Fall erkennen, benennen',
          hinweis: 'Niveau I – Wissen wiedergeben' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *erklären* steht?',
          hinten: 'Ursache → Wirkung begründet herleiten',
          hinweis: 'Niveau II – Wissen anwenden' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *erläutern* steht?',
          hinten: 'mit Beispielen veranschaulichen',
          hinweis: 'Niveau II – Wissen anwenden' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *begründen* steht?',
          hinten: 'mit Argumenten stützen („…, weil …“)',
          hinweis: 'Niveau II – Wissen anwenden' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *ableiten* steht?',
          hinten: 'aus Informationen Schlüsse ziehen',
          hinweis: 'Niveau II – Wissen anwenden' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *vergleichen* steht?',
          hinten: 'Gemeinsamkeiten und Unterschiede zeigen',
          hinweis: 'Niveau II – Wissen anwenden' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *zuordnen* steht?',
          hinten: 'Inhalte passenden Oberbegriffen zuordnen',
          hinweis: 'Niveau II – Wissen anwenden' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *beurteilen* steht?',
          hinten: 'prüfen, ob etwas fachlich angemessen ist',
          hinweis: 'Niveau III – Beurteilen' },
        { vorne: 'Was wird von mir erwartet, wenn in der Klausur der Operator *bewerten* steht?',
          hinten: 'an Normwerten messen (Wert ↔ Grenzwert)',
          hinweis: 'Niveau III – Beurteilen' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Mehr als nur hohe Werte – Leben mit Diabetes mellitus',
      karten: [
        { nr: 1,
          vorne: 'Ich kann in einer Fallsituation pflegerelevante Informationen, Ressourcen und auffällige Veränderungen *identifizieren*: **Wie gehe ich beim Falltext vor?**',
          hinten: [
            'In der Klausur gibt es einen längeren Fließtext. Die wichtigen Informationen stehen nicht als Liste, sondern verteilt im Text: selbst herauslesen und ordnen.',
            'Text zweimal lesen und mit drei Farben markieren: **Informationen**, **Ressourcen**, **Veränderungen**.'
          ] },
        { nr: 1,
          vorne: 'Ich kann im Text über Frau Schneider (75 J.) die **gesicherten Informationen** *identifizieren*.',
          hinten: [
            'Diabetes mellitus Typ 2 seit 13 Jahren',
            'Mischinsulin morgens und abends durch den ambulanten Pflegedienst',
            'arterielle Hypertonie',
            'diabetische Polyneuropathie',
            '1,60 m / 77 kg'
          ] },
        { nr: 1,
          vorne: 'Ich kann im Text über Frau Schneider (75 J.) die **Ressourcen** *identifizieren*.',
          hinten: [
            'im Ort gut eingebunden (Seniorennachmittag, Gartenparzelle)',
            'der Pflegedienst übernimmt BZ-Messung und Insulingabe'
          ] },
        { nr: 1,
          vorne: 'Ich kann im Text über Frau Schneider (75 J.) die **auffälligen Veränderungen** *identifizieren*.',
          hinten: [
            'sozialer Rückzug',
            'Treppensteigen fällt schwer',
            'Schmerzen und Schwäche in den Beinen',
            'unbemerkter Hautdefekt an der rechten Ferse',
            'stärker schwankende Blutzuckerwerte'
          ] }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Es war einmal … das Leben – Die Hormone',
      karten: [
        { nr: 1,
          vorne: 'Ich kann *erklären*, wie **Glukagon** den Blutzucker erhöht.',
          hinten: [
            '**Glukagon** wird in den **α-Zellen** der Bauchspeicheldrüse gebildet.',
            'In der **Leber** bewirkt es, dass gespeichertes Glykogen abgebaut (**Glykogenolyse**) und als Glukose ins Blut abgegeben wird → der Blutzucker **steigt**.'
          ] },
        { nr: 1,
          vorne: 'Ich kann *erklären*, warum der Blutzucker bei **körperlicher Belastung** steigt.',
          hinten: 'Die Muskeln brauchen mehr Energie (Glukose und Sauerstoff) → der Körper stellt zusätzliche Glukose bereit.' },
        { nr: 1,
          vorne: 'Ich kann *erklären*, warum der Blutzucker bei **Stress oder einem Infekt** (z. B. Fieber) steigt – und was das pflegerisch bedeutet.',
          hinten: [
            'Stresshormone wie Adrenalin mobilisieren die Zuckerreserven → der Blutzucker steigt.',
            '**Pflegerisch:** Bei Infekten den BZ häufiger kontrollieren.'
          ] }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Diabetes mellitus – gleiche Folge, unterschiedliche Ursachen?',
      karten: [
        { nr: 1,
          vorne: 'Ich kann am Beispiel einer Muskelzelle *beschreiben*, was bei **normaler Insulinwirkung** geschieht.',
          hinten: 'Insulin wirkt an der Muskelzelle → Glukose gelangt in die Zelle.' },
        { nr: 1,
          vorne: 'Ich kann am Beispiel einer Muskelzelle *beschreiben*, was bei **Insulinmangel (Typ 1)** geschieht.',
          hinten: 'Insulin fehlt → Glukose bleibt außerhalb der Zelle.' },
        { nr: 1,
          vorne: 'Ich kann am Beispiel einer Muskelzelle *beschreiben*, was bei **Insulinresistenz (Typ 2)** geschieht.',
          hinten: 'Insulin ist vorhanden, die Zelle reagiert aber nur vermindert darauf → Glukose bleibt außerhalb der Zelle.' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'So regelt Insulin den Blutzucker',
      karten: [
        { nr: 1,
          vorne: 'Ich kann den Regelkreis des Blutzuckers *beschreiben*: **Schritte 1–3** – was geschieht nach einer kohlenhydratreichen Mahlzeit?',
          nummeriert: true,
          hinten: [
            'Nach einer kohlenhydratreichen Mahlzeit steigt der Glukosegehalt im Blut.',
            'Die β-Zellen der Bauchspeicheldrüse geben mehr Insulin ab.',
            'Insulin wirkt an den Körperzellen: Die Muskelzellen nehmen Glukose auf, die Leber speichert Glukose als Glykogen (**Glykogenese**) → der Blutzucker sinkt.'
          ] },
        { nr: 1,
          vorne: 'Ich kann den Regelkreis des Blutzuckers *beschreiben*: **Schritte 4–5** – was geschieht, wenn der Blutzucker sinkt?',
          nummeriert: true, start: 4,
          hinten: [
            'Sinkt der Blutzucker, wird weniger Insulin und mehr Glukagon aus den α-Zellen abgegeben.',
            'Die Leber baut Glykogen ab (**Glykogenolyse**) und bildet neue Glukose (**Glukoneogenese**); auch Adrenalin und Kortisol wirken mit → der Blutzucker steigt wieder.'
          ] },
        { nr: 1,
          vorne: 'Ich kann die Fachbegriffe **Glykogenese**, **Glykogenolyse** und **Glukoneogenese** *erklären*.',
          hinten: [
            '**Glykogenese:** Die Leber speichert Glukose als Glykogen.',
            '**Glykogenolyse:** Die Leber baut Glykogen ab.',
            '**Glukoneogenese:** Die Leber bildet neue Glukose.'
          ] },
        { nr: 2,
          vorne: 'Ich kann das Krankheitsbild Diabetes mellitus *beschreiben*: **Definition**',
          hinten: 'chronische Stoffwechselerkrankung mit dauerhaft erhöhtem Blutzucker (Hyperglykämie) durch Insulinmangel, verminderte Insulinwirkung oder beides.' },
        { nr: 2,
          vorne: 'Ich kann das Krankheitsbild Diabetes mellitus *beschreiben*: **Ursache von Typ 1**',
          hinten: [
            'Eine Autoimmunreaktion zerstört die β-Zellen → absoluter Insulinmangel.',
            'Beginn meist im Kindes- oder Jugendalter, aber auch später möglich.'
          ] },
        { nr: 2,
          vorne: 'Ich kann das Krankheitsbild Diabetes mellitus *beschreiben*: **Risikofaktoren von Typ 1**',
          hinten: 'v. a. erbliche Veranlagung; durch den Lebensstil nicht beeinflussbar.' },
        { nr: 2,
          vorne: 'Ich kann das Krankheitsbild Diabetes mellitus *beschreiben*: **Ursache von Typ 2**',
          hinten: [
            'Leber-, Muskel- und Fettzellen reagieren vermindert auf Insulin (Insulinresistenz).',
            'Anfangs bildet der Körper noch genug oder sogar mehr Insulin, später immer weniger.'
          ] },
        { nr: 2,
          vorne: 'Ich kann das Krankheitsbild Diabetes mellitus *beschreiben*: **Risikofaktoren von Typ 2**',
          hinten: [
            'Übergewicht (v. a. am Bauch)',
            'Bewegungsmangel',
            'ungünstige Ernährung',
            'höheres Alter',
            'familiäre Veranlagung'
          ] }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Vergleichen und Zusammenhänge erklären',
      karten: [
        { nr: 1,
          vorne: 'Ich kann falsche Aussagen zu Typ 1 und Typ 2 *identifizieren* und die Korrektur fachlich *begründen*:',
          fall: '„Bei Typ 1 ist genug Insulin vorhanden, aber die Zellen reagieren nicht darauf.“',
          hinten: '**Falsch:** Bei Typ 1 werden die β-Zellen zerstört; es fehlt Insulin.',
          hinweis: 'Die Aussagen sind nur Beispiele – in der Klausur kommen sie NICHT wortgleich vor!' },
        { nr: 1,
          vorne: 'Ich kann falsche Aussagen zu Typ 1 und Typ 2 *identifizieren* und die Korrektur fachlich *begründen*:',
          fall: '„Wenn Insulin fehlt oder nicht wirkt, bleibt weniger Glukose im Blut.“',
          hinten: '**Falsch:** Die Zellen nehmen weniger Glukose auf, deshalb bleibt *mehr* Glukose im Blut.',
          hinweis: 'Die Aussagen sind nur Beispiele – in der Klausur kommen sie NICHT wortgleich vor!' },
        { nr: 1,
          vorne: 'Ich kann falsche Aussagen zu Typ 1 und Typ 2 *identifizieren* und die Korrektur fachlich *begründen*:',
          fall: '„Nach einer Mahlzeit geben die α-Zellen mehr Insulin ab.“',
          hinten: '**Falsch:** Insulin kommt aus den β-Zellen; die α-Zellen bilden Glukagon.',
          hinweis: 'Die Aussagen sind nur Beispiele – in der Klausur kommen sie NICHT wortgleich vor!' },
        { nr: 2,
          vorne: 'Ich kann einer Patientin mit Typ-2-Diabetes verständlich *erklären*, warum ihr Blutzucker trotz eigener Insulinbildung erhöht ist.',
          hinten: [
            '„Insulin ist wie ein Schlüssel: Es öffnet die Zellen für den Zucker.“',
            '„Ihr Körper macht noch genug Schlüssel, am Anfang sogar mehr als nötig.“',
            '„Aber die Schlösser an den Zellen klemmen. Das nennt man *Insulinresistenz*.“',
            '„Darum bleibt der Zucker im Blut, und Ihr Blutzucker steigt.“',
            '„Später macht Ihr Körper oft auch weniger Schlüssel.“'
          ] }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: ['Insulinarten erschließen und ordnen (mit Karten und Tabelle)', 'Die Wirkprofile der Insulinarten'],
      karten: [
        { nr: 1,
          vorne: 'Ich kann die **fünf Insulinarten** *nennen*.',
          hinten: [
            'Normalinsulin (kurzwirksam)',
            'kurzwirksames Insulinanalogon (Bolus)',
            'NPH-/Intermediärinsulin (Basal)',
            'langwirksames Insulinanalogon (Basal)',
            'Mischinsulin'
          ] },
        { nr: 1,
          vorne: 'Ich kann die pflegerisch wichtigen Besonderheiten von **Normalinsulin** (kurzwirksam) *beschreiben*.',
          hinten: [
            'Spritz-Ess-Abstand von 20–30 min',
            'zur Korrektur hoher BZ-Werte',
            'auch i. v. möglich'
          ] },
        { nr: 1,
          vorne: 'Ich kann die pflegerisch wichtigen Besonderheiten eines **kurzwirksamen Insulinanalogons** (Bolus) *beschreiben*.',
          hinten: [
            'wirkt schnell und kurz',
            'kein klassischer Spritz-Ess-Abstand nötig'
          ] },
        { nr: 1,
          vorne: 'Ich kann die pflegerisch wichtigen Besonderheiten von **NPH-/Intermediärinsulin** (Basal) *beschreiben*.',
          hinten: [
            'basale Versorgung',
            'trüb (Protamin) → vor der Gabe gleichmäßig durchmischen'
          ] },
        { nr: 1,
          vorne: 'Ich kann die pflegerisch wichtigen Besonderheiten eines **langwirksamen Insulinanalogons** (Basal) *beschreiben*.',
          hinten: [
            'basale Versorgung',
            'klar → nicht durchmischen',
            'meist 1 × täglich'
          ] },
        { nr: 1,
          vorne: 'Ich kann die pflegerisch wichtigen Besonderheiten von **Mischinsulin** *beschreiben*.',
          hinten: [
            'kurz und länger wirksamer Anteil, z. B. 30/70 oder 50/50',
            'trüb → vor der Gabe durchmischen'
          ] },
        { nr: 1,
          vorne: 'Ich kann *nennen*, welche Insuline vor der Gabe **durchmischt** werden müssen – und welches nicht.',
          hinten: [
            '**trüb → vor der Gabe durchmischen:** NPH-/Intermediärinsulin (Protamin), Mischinsulin',
            '**klar → nicht durchmischen:** langwirksames Insulinanalogon'
          ] },
        { nr: 1,
          vorne: 'Ich kann **Basal- und Bolusinsulin** *vergleichen*.',
          hinten: [
            '**Basalinsulin** deckt den Grundbedarf rund um die Uhr – unabhängig von den Mahlzeiten.',
            '**Bolusinsulin** deckt den zusätzlichen Bedarf zu den Mahlzeiten.'
          ] },
        { nr: 2,
          vorne: 'Ich kann *erklären*, was „**Mahlzeitenbezug**“ bedeutet.',
          hinten: [
            '**Mahlzeitenbezug:** Die Insulingabe wird zeitlich so auf die Mahlzeit abgestimmt, dass Insulinwirkung und Aufnahme der Kohlenhydrate zusammenpassen.',
            'Er hängt vom **Wirkeintritt** ab: **Normalinsulin** (ca. 20–30 min) → Spritz-Ess-Abstand 20–30 min; **kurzwirksame Analoga** (ca. 5–15 min) → direkt zur Mahlzeit; bei **Mischinsulin** zählt der kurz wirksame Anteil; **Basalinsulin** hat keinen direkten Mahlzeitenbezug.'
          ] },
        { nr: 2,
          vorne: 'Ich kann im Zusammenhang mit dem „Mahlzeitenbezug“ *erklären*, warum eine **verspätete Mahlzeit** gefährlich sein kann.',
          hinten: '**Gefahr:** Kommt die Mahlzeit zu spät, wirkt das Insulin, bevor Kohlenhydrate aufgenommen werden → **Hypoglykämie**.' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Sicher entscheiden vor der Insulingabe',
      karten: [
        { nr: 1,
          vorne: 'Ich kann die **8 Punkte der STOPP-Checkliste** *nennen*.',
          nummeriert: true,
          hinten: [
            'richtige Person',
            'ärztliche Anordnung',
            'richtiges Insulinpräparat',
            'richtige Dosis',
            'richtiger Zeitpunkt',
            'aktueller Blutzuckerwert',
            'Mahlzeit / Nahrungsverfügbarkeit',
            'Besonderheiten des Präparats'
          ] },
        { nr: 1,
          vorne: 'Ich kann mithilfe der STOPP-Checkliste *beurteilen*, ob die Insulingabe wie geplant durchgeführt werden kann, und meine Entscheidung *begründen*:',
          fall: 'Normalinsulin ist für 12:00 Uhr angeordnet, das Essen kommt erst um 12:45 Uhr.',
          hinten: '→ **nicht wie geplant** (Punkte 5, 7): Der Spritz-Ess-Abstand passt nicht; Zeitpunkt und Mahlzeit klären.' },
        { nr: 1,
          vorne: 'Ich kann mithilfe der STOPP-Checkliste *beurteilen*, ob die Insulingabe wie geplant durchgeführt werden kann, und meine Entscheidung *begründen*:',
          fall: 'Es ist kein aktueller BZ-Wert dokumentiert.',
          hinten: '→ **erst klären** (Punkt 6): vor der Gabe den BZ messen.' },
        { nr: 1,
          vorne: 'Ich kann mithilfe der STOPP-Checkliste *beurteilen*, ob die Insulingabe wie geplant durchgeführt werden kann, und meine Entscheidung *begründen*:',
          fall: 'Basalinsulin ist fällig, der Patient hat abends wenig gegessen.',
          hinten: '→ **Gabe möglich** (Punkte 2, 5, 7): Basalinsulin deckt den Grundbedarf.' },
        { nr: 2,
          vorne: 'Ich kann die **vier Bereiche** *nennen*, zu denen es Wenn-dann-Regeln zum sicheren Umgang mit Insulin gibt.',
          hinten: ['Lagerung', 'Rotation', 'Lipohypertrophie', 'Entsorgung'] },
        { nr: 2,
          vorne: 'Ich kann die Regel zur **Lagerung** von Insulin als Wenn-dann-Regel *erklären*.',
          hinten: 'Wenn Insulin ungeöffnet ist, dann im Kühlschrank lagern (meist 2–8 °C), nicht einfrieren.' },
        { nr: 2,
          vorne: 'Ich kann die Regel zur **Rotation** als Wenn-dann-Regel *erklären*.',
          hinten: 'Wenn Insulin regelmäßig gespritzt wird, dann die Einstichstellen planmäßig wechseln.' },
        { nr: 2,
          vorne: 'Ich kann die Regel zur **Lipohypertrophie** als Wenn-dann-Regel *erklären*.',
          hinten: 'Wenn die Unterhaut verdickt ist, dann dort nicht spritzen, dokumentieren und weitergeben.' },
        { nr: 2,
          vorne: 'Ich kann die Regel zur **Entsorgung** als Wenn-dann-Regel *erklären*.',
          hinten: 'Wenn eine Kanüle benutzt wurde, dann sofort im stichfesten Abwurfbehälter entsorgen.' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Akutkomplikation: Hyperglykämie (A) / Hypoglykämie (B)',
      karten: [
        { nr: 1,
          vorne: 'Ich kann Hypoglykämie und Hyperglykämie *vergleichen*: **Blutzuckerwert**',
          hinten: [
            '**Hypoglykämie:** unter 70 mg/dl',
            '**Hyperglykämie:** über 180 mg/dl'
          ],
          hinweis: 'Sie haben Text A oder B bearbeitet – lernen Sie für die Klausur beide Mind-Maps!' },
        { nr: 1,
          vorne: 'Ich kann Hypoglykämie und Hyperglykämie *vergleichen*: **Ursachen einer Hypoglykämie**',
          hinten: [
            'zu hohe Insulindosis (Therapiefehler)',
            'zu wenig Kohlenhydrate, z. B. vergessene Mahlzeit',
            'vermehrte Bewegung',
            'Durchfall/Erbrechen',
            'Alkohol (hemmt noch Stunden später die Glukosefreisetzung aus der Leber)'
          ] },
        { nr: 1,
          vorne: 'Ich kann Hypoglykämie und Hyperglykämie *vergleichen*: **Ursachen einer Hyperglykämie**',
          hinten: [
            'falsch angepasste Insulindosis (Therapiefehler)',
            'akute Erkrankungen, Infekte',
            'Stress',
            'Bewegungsmangel'
          ] },
        { nr: 1,
          vorne: 'Ich kann Hypoglykämie und Hyperglykämie *vergleichen*: **Symptome einer Hypoglykämie**',
          hinten: [
            'Blässe, Schwitzen, Zittern, (Konzentrations-)Schwäche, Tachykardie',
            'durch den Glukosemangel im Gehirn auch Sprachstörungen und Krampfanfälle',
            '(individuell und altersabhängig unterschiedlich ausgeprägt)'
          ] },
        { nr: 1,
          vorne: 'Ich kann Hypoglykämie und Hyperglykämie *vergleichen*: **Symptome einer Hyperglykämie**',
          hinten: [
            'zunächst unspezifisch: Schwäche, Abgeschlagenheit',
            'starker Durst, häufiges Wasserlassen (Polyurie), Kopf- und Bauchschmerzen, Übelkeit',
            'durch den Flüssigkeitsverlust Bewusstseinsstörungen bis zum Koma'
          ] },
        { nr: 2,
          vorne: 'Ich kann *erklären*, wie bei einer Hyperglykämie ein **ketoazidotisches Koma** entsteht.',
          hinten: '**v. a. bei Typ 1:** absoluter Insulinmangel → vermehrter Fettabbau → es entstehen Ketonkörper → der pH-Wert des Blutes sinkt, das Blut wird „saurer“ (Azidose).' },
        { nr: 2,
          vorne: 'Ich kann die **Anzeichen** eines ketoazidotischen Komas *nennen*.',
          hinten: [
            'Übelkeit, Erbrechen, Bauchschmerzen',
            'vertiefte Atmung (Kußmaul-Atmung), mit der der Körper die Säure ausgleichen will',
            'der Atem riecht nach Azeton („obstartig“)'
          ] },
        { nr: 3,
          vorne: 'Ich kann die Notfallmaßnahmen bei einer **Hypoglykämie** *beschreiben* und *begründen*.',
          hinten: [
            'Aktivität pausieren, weil Bewegung zusätzlich Glukose verbraucht',
            'schnell wirksame Kohlenhydrate geben (z. B. Traubenzucker, Saft), weil sie rasch ins Blut gelangen',
            'nach ca. 30 min den BZ kontrollieren, um zu prüfen, ob er wieder steigt'
          ] },
        { nr: 3,
          vorne: 'Ich kann die Notfallmaßnahmen bei einer **Hyperglykämie** *beschreiben* und *begründen*.',
          hinten: [
            'keine Kohlenhydrate zuführen, damit der BZ nicht weiter steigt',
            'Ketonkörper messen, um eine Ketoazidose zu erkennen',
            'Insulin zuführen, weil es den BZ senkt'
          ] },
        { nr: 3,
          vorne: 'Ich kann *beschreiben*, was bei einer Hypo- und einer Hyperglykämie für das **Insulin** gilt.',
          hinten: [
            'bei einer Hypoglykämie reduzieren, bei einer Hyperglykämie zuführen',
            'beides nur nach ärztlicher Anordnung bzw. Rücksprache',
            '**Die Dosis nie eigenmächtig ändern!**'
          ] },
        { nr: 4,
          vorne: 'Ich kann *identifizieren*, ob eine Hypo- oder eine Hyperglykämie vorliegt, und meine Zuordnung *begründen*:',
          fall: 'Jana ist plötzlich blass, schwitzt, zittert und klagt über weiche Knie.',
          hinten: '**Hypoglykämie**, weil Blässe, Schwitzen und Zittern typisch sind: Den Zellen fehlt Glukose zur Energiegewinnung → Energieverlust → Schwäche („weiche Knie“).',
          hinweis: 'In der Klausur kommt ein anderer Fall: Auf BZ-Wert, Anzeichen und Ursachen achten!' },
        { nr: 4,
          vorne: 'Ich kann die **Dringlichkeit** *begründen*:',
          fall: 'Jana ist plötzlich blass, schwitzt, zittert und klagt über weiche Knie.',
          hinten: '**sofort handeln**, weil den Gehirnzellen Glukose fehlt → es drohen Sprachstörungen und Krampfanfälle.',
          hinweis: 'In der Klausur kommt ein anderer Fall: Auf BZ-Wert, Anzeichen und Ursachen achten!' },
        { nr: 4,
          vorne: 'Ich kann *identifizieren*, ob eine Hypo- oder eine Hyperglykämie vorliegt, und meine Zuordnung *begründen*:',
          fall: 'Jana ist sehr durstig, muss häufig auf Toilette und klagt über Kopfschmerzen.',
          hinten: '**Hyperglykämie**, weil der Körper versucht, den zu hohen BZ über den Urin auszuscheiden (Polyurie). Durch den Flüssigkeitsverlust meldet das Gehirn Durst.',
          hinweis: 'In der Klausur kommt ein anderer Fall: Auf BZ-Wert, Anzeichen und Ursachen achten!' },
        { nr: 4,
          vorne: 'Ich kann die **Dringlichkeit** *begründen*:',
          fall: 'Jana ist sehr durstig, muss häufig auf Toilette und klagt über Kopfschmerzen.',
          hinten: '**zeitnah handeln** (BZ und Ketonkörper messen, Ärztin/Arzt informieren), weil durch den Flüssigkeitsverlust Bewusstseinsstörungen bis zum Koma drohen.',
          hinweis: 'In der Klausur kommt ein anderer Fall: Auf BZ-Wert, Anzeichen und Ursachen achten!' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Kapilläre Blutzuckermessung – Wie messe ich richtig?',
      karten: [
        { nr: 1,
          vorne: 'Ich kann den Begriff „**Indikation**“ *erklären*.',
          hinten: 'der fachlich begründete Anlass für eine Maßnahme.' },
        { nr: 1,
          vorne: 'Ich kann am Fall Frau Schneider die Indikation für eine **Blutzuckermessung** *ableiten*.',
          hinten: 'Die zuletzt schwankenden BZ-Werte und die ärztliche Anordnung begründen die zusätzliche Messung vor dem Mittagessen.' },
        { nr: 2,
          vorne: 'Ich kann Angaben aus einer Fallsituation den „Richtig“-Kontrollen der **10-R-Regel** *zuordnen*:',
          fall: 'morgens und abends · NovoMix 30® · aktueller Medikationsplan · Frau Schneider · 16 I.E. morgens / 10 I.E. abends',
          hinten: [
            '**R-Person:** Frau Schneider',
            '**R-Medikament:** NovoMix 30®',
            '**R-Dosierung:** 16 I.E. morgens / 10 I.E. abends',
            '**R-Zeitpunkt:** morgens und abends',
            '**R-Dokumentation:** aktueller Medikationsplan'
          ] },
        { nr: 3,
          vorne: 'Ich kann Blutzuckerwerte von **mg/dl in mmol/l** (und umgekehrt) umrechnen.',
          hinten: [
            '**1 mmol/l ≙ 18 mg/dl**',
            'mg/dl : 18 = mmol/l',
            'mmol/l × 18 = mg/dl'
          ] },
        { nr: 3,
          vorne: 'Ich kann anhand einer Vorgabe *bewerten*, ob Handlungsbedarf besteht:',
          fall: 'Bei Werten über 10 mmol/l soll die zuständige Pflegefachperson informiert werden. Gemessen: 215 mg/dl.',
          hinten: '215 mg/dl : 18 = 11,9 mmol/l → über 10 mmol/l → Pflegefachperson **informieren**.' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Pflegepraxis Blutzuckermessung',
      karten: [
        { nr: 1,
          vorne: 'Ich kann den Ablauf der kapillären Blutzuckermessung *beschreiben*: **4 Handlungsschritte der Vorbereitung**',
          hinten: [
            'Anordnung und Messzeitpunkt prüfen; Patientin informieren',
            'Material und Teststreifen (Verfallsdatum!) prüfen und bereitlegen',
            'Hände desinfizieren; Hände der Patientin ggf. erwärmen',
            'Einmalhandschuhe anziehen, weil Blut potenziell infektiös ist'
          ] },
        { nr: 1,
          vorne: 'Ich kann den Ablauf der kapillären Blutzuckermessung *beschreiben*: **4 Handlungsschritte der Durchführung**',
          hinten: [
            'Mittel- oder Ringfinger wählen, weil Daumen und Zeigefinger im Alltag geschont werden sollen',
            'Desinfektionsmittel vollständig trocknen lassen, weil es den Messwert verfälscht',
            'Seitliche Fingerbeere punktieren, weil das weniger schmerzhaft ist',
            'Ersten Tropfen abwischen, weil er Gewebsflüssigkeit enthält; zweiten Tropfen aufnehmen'
          ] },
        { nr: 1,
          vorne: 'Ich kann den Ablauf der kapillären Blutzuckermessung *beschreiben*: **4 Handlungsschritte der Nachbereitung**',
          hinten: [
            'Tupfer zum Komprimieren geben, weil die Stelle nachbluten kann',
            'Lanzette im stichfesten Abwurfbehälter entsorgen',
            'Handschuhe ausziehen; Hände desinfizieren',
            'Messwert beurteilen, weitergeben und dokumentieren'
          ] },
        { nr: 1,
          vorne: 'Ich kann *begründen*, warum ich bei der Blutzuckermessung **Einmalhandschuhe** anziehe.',
          hinten: '…, weil Blut potenziell infektiös ist.' },
        { nr: 1,
          vorne: 'Ich kann *begründen*, warum ich für die Blutzuckermessung den **Mittel- oder Ringfinger** wähle.',
          hinten: '…, weil Daumen und Zeigefinger im Alltag geschont werden sollen.' },
        { nr: 1,
          vorne: 'Ich kann *begründen*, warum ich das **Desinfektionsmittel vollständig trocknen** lasse.',
          hinten: '…, weil es den Messwert verfälscht.' },
        { nr: 1,
          vorne: 'Ich kann *begründen*, warum ich die **seitliche Fingerbeere** punktiere.',
          hinten: '…, weil das weniger schmerzhaft ist.' },
        { nr: 1,
          vorne: 'Ich kann *begründen*, warum ich den **ersten Tropfen** abwische.',
          hinten: '…, weil er Gewebsflüssigkeit enthält; den zweiten Tropfen aufnehmen.' },
        { nr: 1,
          vorne: 'Ich kann *begründen*, warum ich der Patientin nach der Messung einen **Tupfer zum Komprimieren** gebe.',
          hinten: '…, weil die Stelle nachbluten kann.' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      ab: 'Kapilläre Blutzuckermessung – Wie vermeide und erkenne ich Messfehler?',
      karten: [
        { nr: 1,
          vorne: 'Ich kann **vier typische Fehlerquellen** bei der Blutzuckermessung *nennen*.',
          hinten: [
            'kalte Hände / Finger ausgedrückt',
            'feuchte Haut / Desinfektionsmittel',
            'verschmutzte Hände / Obstreste',
            'Teststreifendose offen'
          ] },
        { nr: 1,
          vorne: 'Ich kann aus einer Fehlerquelle bei der Blutzuckermessung eine Regel *ableiten*:',
          fall: 'Kalte Hände / Finger ausgedrückt',
          hinten: 'Hände ggf. erwärmen; den Finger nicht „ausmelken“.' },
        { nr: 1,
          vorne: 'Ich kann aus einer Fehlerquelle bei der Blutzuckermessung eine Regel *ableiten*:',
          fall: 'Feuchte Haut / Desinfektionsmittel',
          hinten: 'vollständig abtrocknen lassen.' },
        { nr: 1,
          vorne: 'Ich kann aus einer Fehlerquelle bei der Blutzuckermessung eine Regel *ableiten*:',
          fall: 'Verschmutzte Hände / Obstreste',
          hinten: 'Hände vorher waschen und gut abtrocknen.' },
        { nr: 1,
          vorne: 'Ich kann aus einer Fehlerquelle bei der Blutzuckermessung eine Regel *ableiten*:',
          fall: 'Teststreifendose offen',
          hinten: 'sofort verschließen; Teststreifen trocken lagern.' },
        { nr: 2,
          vorne: 'Ich kann eine Blutzuckermessung *beurteilen*:',
          fall: 'Lina misst bei Frau Schneider vor dem Mittagessen den Blutzucker mit abgelaufenen Teststreifen; das Gerät zeigt 284 mg/dl.',
          hinten: 'Die Teststreifen sind abgelaufen → der Wert ist nicht verlässlich; Messung mit gültigen Teststreifen wiederholen.' },
        { nr: 2,
          vorne: 'Ich kann mögliche Folgen eines **falsch hohen Messwerts** *beschreiben*.',
          hinten: 'Wird ein falsch hoher Wert übernommen, kann zu viel Insulin gegeben werden → Gefahr einer **Hypoglykämie**.' }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      // In der Ich-kann-Liste steht hier noch ein Platzhalter für den Titel des
      // Arbeitsblatts. Sobald er feststeht, die Zeile „titel“ ersetzen durch:
      //   ab: 'Titel des Arbeitsblatts',
      titel: 'Langzeitschäden und diabetisches Fußsyndrom',
      karten: [
        { nr: 1,
          vorne: 'Ich kann Langzeitschäden des Diabetes mellitus an den **kleinen Gefäßen** *nennen*.',
          hinten: [
            'Retinopathie (Netzhaut, bis Erblindung)',
            'Nephropathie (Niere, bis Niereninsuffizienz)'
          ] },
        { nr: 1,
          vorne: 'Ich kann Langzeitschäden des Diabetes mellitus an den **großen Gefäßen** *nennen*.',
          hinten: 'Arteriosklerose → Herzinfarkt, Schlaganfall, pAVK' },
        { nr: 1,
          vorne: 'Ich kann Langzeitschäden des Diabetes mellitus an den **Nerven** *nennen*.',
          hinten: 'Polyneuropathie mit vermindertem Schmerz- und Temperaturempfinden' },
        { nr: 1,
          vorne: 'Ich kann die Entstehung eines **diabetischen Fußsyndroms** *erklären*.',
          hinten: [
            'Wegen der Neuropathie werden Druckstellen und kleine Verletzungen nicht bemerkt.',
            'Wegen der Durchblutungsstörung heilen sie schlecht → Geschwür (Ulkus), Infektion, im schlimmsten Fall Amputation.'
          ] },
        { nr: 2,
          vorne: 'Ich kann *beschreiben*, worauf ich bei der **Fußinspektion** achte.',
          hinten: [
            'beide Füße täglich, auch Sohle, Ferse und Zehenzwischenräume',
            'Rötungen, Druckstellen, Blasen, Risse, Hornhaut, Verletzungen, Nagelveränderungen, Fußpilz',
            'Schuhe auf Fremdkörper prüfen'
          ] },
        { nr: 2,
          vorne: 'Ich kann Maßnahmen zur **Vorbeugung** eines diabetischen Fußsyndroms *ableiten*.',
          hinten: [
            'lauwarm waschen (unter 37 °C), gut abtrocknen, eincremen (nicht zwischen den Zehen)',
            'Nägel feilen, Podologie nutzen',
            'nie barfuß, passende Schuhe, keine Wärmflasche',
            'gute BZ-Einstellung, nicht rauchen'
          ] },
        { nr: 3,
          vorne: 'Ich kann am Fall Frau Schneider den **Hautdefekt an der Ferse** *bewerten*.',
          hinten: 'Polyneuropathie, ein schmerzloser, unbemerkter Hautdefekt und trockene Haut sind Warnzeichen für ein beginnendes diabetisches Fußsyndrom.' },
        { nr: 3,
          vorne: 'Ich kann am Fall Frau Schneider (Hautdefekt an der Ferse) das **weitere Vorgehen** *begründen*.',
          hinten: [
            'Wunde beschreiben und dokumentieren',
            'Hausärztin informieren',
            'Ferse druckentlasten',
            'Füße täglich inspizieren',
            'zur Fußpflege beraten'
          ] },
        { nr: 3,
          vorne: 'Ich kann am Fall Frau Schneider (Hautdefekt an der Ferse) *beschreiben*, mit wem ich **zusammenarbeite**.',
          hinten: [
            '**Hausärztin** (Diagnose, Verordnung)',
            '**Wundexpertin** (Wundversorgung)',
            '**Podologie** (Fuß- und Nagelpflege)',
            '**Diabetesberatung** (Schulung)'
          ] }
      ]
    }
  ],

  /* ---------- Beschriftungen der Oberfläche ---------- */
  texte: {
    start: 'Lernen starten',
    weiterlernen: 'Weiterlernen',
    weiterlernenInfo: 'Karte {x} von {y}',
    nurOffene: 'Nur offene Karten lernen ({x})',
    alleNeu: 'Alle {x} Karten lernen',
    themenWaehlen: 'Was möchten Sie lernen?',
    alleThemen: 'Alle',
    keineThemen: 'Keine',
    mischen: 'Karten mischen',
    gewusst: 'Gewusst',
    nochNicht: 'Noch nicht',
    umdrehen: 'Tippen zum Umdrehen',
    vorderseite: 'Kompetenz',
    rueckseite: 'Beispielantwort',
    zurueck: 'Zurück',
    beenden: 'Zur Übersicht',
    rundeFertig: 'Runde geschafft!',
    allesGewusst: 'Alles gewusst – stark!',
    ergebnis: '{x} von {y} Karten gewusst',
    wiederholen: '{x} Karten wiederholen',
    wiederholenEine: '1 Karte wiederholen',
    nochmalAlle: 'Alle Karten noch einmal',
    stand: '{x} von {y} gewusst',
    gesamt: 'Ihr Lernstand: {x} von {y} Karten gewusst',
    insgesamt: 'Insgesamt: {x} von {y} Karten gewusst',
    zuruecksetzen: 'Lernstand löschen',
    zuruecksetzenFrage: 'Ihren gesamten Lernstand auf diesem Gerät löschen?',
    datenschutz: 'Keine Anmeldung, keine Cookies. Ihr Lernstand wird nur auf diesem Gerät gespeichert.',
    bedienung: 'Karte antippen zum Umdrehen. Wischen nach rechts = gewusst, nach links = noch nicht.'
  }
};
