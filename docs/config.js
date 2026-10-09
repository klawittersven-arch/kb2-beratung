/* ==========================================================================
   EINSTELLUNGEN – Minispiel „Diabetes Run!“ und Live-Rangliste
   ==========================================================================
   Ändern Sie nur die Werte rechts vom Gleichheitszeichen.
   Texte stehen zwischen einfachen Hochkommas ' … ', Zahlen ohne.
   ========================================================================== */

var CONFIG = {

  // Wird dem vierstelligen Raumcode vorangestellt. So entsteht eine Kennung
  // wie „kb2-ab12-pflegesprint-4821“, die sich nicht mit fremden Nutzern des
  // kostenlosen PeerJS-Vermittlungsdienstes überschneidet.
  // Erlaubt: Kleinbuchstaben a–z, Ziffern und Bindestrich.
  RAUM_PRAEFIX: 'kb2-ab12-pflegesprint-',

  // Die Rangliste zeigt nur Punkte, die in den letzten so vielen Minuten
  // erzielt wurden. Ältere Einträge verschwinden automatisch.
  ANZEIGE_MINUTEN: 45,

  // So viele Stunden merkt sich ein Handy den eingegebenen Raumcode.
  // Danach wird er erneut abgefragt.
  RAUMCODE_GUELTIG_STUNDEN: 3,

  // So viele Einträge zeigt die Rangliste an.
  RANGLISTE_PLAETZE: 10,

  // Einfacher Filter für Spitznamen: Enthält ein Spitzname eines dieser
  // Wörter (Groß-/Kleinschreibung egal, auch mit Leerzeichen oder Ziffern
  // wie „4“ statt „a“ dazwischen), wird er abgelehnt.
  // Sie können die Liste beliebig ergänzen – nur Kleinbuchstaben verwenden.
  SPERRWOERTER: [
    'arsch', 'fick', 'fotze', 'hure', 'nutte', 'wichs', 'schlampe', 'bitch',
    'fuck', 'shit', 'scheis', 'kacke', 'pisse', 'penis', 'pimmel', 'schwanz',
    'muschi', 'vagina', 'titte', 'porn', 'sex', 'nazi', 'hitler',
    'neger', 'nigg', 'kanake', 'zigeuner', 'schwuchtel', 'spast', 'mongo',
    'behindert', 'missgeburt', 'bastard', 'wixer', 'wixxer', 'opfer',
    'dick', 'cock', 'pussy', 'slut', 'whore', 'cunt', 'kill'
  ],

  // Direktlink zum Spiel (ohne vorher die Aufgaben zu lösen):
  //   …/spiel.html?zugang=kochertal          → Spiel sofort spielbar
  //   …/spiel.html?zugang=kochertal&raum=4821 → zusätzlich Raumcode schon eingetragen
  // Ändern Sie das Wort, wenn der Link nicht mehr funktionieren soll.
  // Leer lassen ('') = kein Direktlink möglich.
  DIREKTLINK_SCHLUESSEL: 'kochertal',

  // Technik der Live-Verbindung. Bitte nicht ändern.
  // 'peerjs' = Echtbetrieb. 'test' = nur für automatische Tests
  // (kann auch mit ?transport=test an der Adresse gewählt werden).
  TRANSPORT: 'peerjs'
};
