"""QR-Codes erzeugen und in das Arbeitsblatt einsetzen.

Aufruf (im Hauptverzeichnis des Repositorys):
    pip install segno python-docx zxing-cpp pillow
    python werkzeuge/qr_einsetzen.py

- Liest Besitzer und Namen des Repositorys aus dem Git-Remote „origin“.
- Erzeugt qr/qr_aa1.png und qr/qr_aa2.png (Fehlerkorrektur M, Ruhezone 4 Module,
  mindestens 600 × 600 px) und prüft, dass sie sich dekodieren lassen.
- Ersetzt im Arbeitsblatt die Absätze [QR-AA1]/[QR-AA2] durch die QR-Bilder
  (Breite 3,2 cm) und [LINK-AA1]/[LINK-AA2] durch die Adresse ohne „https://“.
- Speichert das Ergebnis als KB2_AB12_Professionell_beraten_digital_mit_QR.docx;
  das Original bleibt unverändert.
"""
import re
import subprocess
import sys
from pathlib import Path

import segno
from docx import Document
from docx.shared import Cm

WURZEL = Path(__file__).resolve().parent.parent
ORIGINAL = WURZEL / "KB2_AB12_Professionell_beraten_digital.docx"
ERGEBNIS = WURZEL / "KB2_AB12_Professionell_beraten_digital_mit_QR.docx"
QR_ORDNER = WURZEL / "qr"


def repo_aus_remote():
    url = subprocess.check_output(["git", "-C", str(WURZEL), "remote", "get-url", "origin"], text=True).strip()
    m = re.search(r"github\.com[/:]([^/]+)/([^/]+?)(?:\.git)?/?$", url)
    if not m:
        sys.exit(f"Git-Remote nicht erkannt: {url}")
    return m.group(1), m.group(2)


def qr_erzeugen(adresse, datei):
    qr = segno.make(adresse, error="m", micro=False)
    breite_module = qr.symbol_size(scale=1, border=4)[0]
    massstab = -(-600 // breite_module)  # aufrunden, damit mindestens 600 px
    qr.save(str(datei), kind="png", scale=massstab, border=4, dark="#000000", light="#FFFFFF")
    return qr


def qr_pruefen(datei, erwartet):
    try:
        import zxingcpp
        from PIL import Image
    except ImportError:
        print("  (zxing-cpp/Pillow nicht installiert – Dekodierprüfung übersprungen)")
        return
    from PIL import Image
    bild = Image.open(datei)
    ergebnisse = zxingcpp.read_barcodes(bild)
    texte = [e.text for e in ergebnisse]
    if texte != [erwartet]:
        sys.exit(f"QR-Prüfung fehlgeschlagen für {datei}: {texte}")
    print(f"  dekodiert: {texte[0]}  ({bild.size[0]} × {bild.size[1]} px, Fehlerkorrektur {ergebnisse[0].ec_level})")


def alle_absaetze(behaelter):
    """Alle Absätze, auch in (verschachtelten) Tabellenzellen."""
    for p in behaelter.paragraphs:
        yield p
    for tabelle in behaelter.tables:
        for zeile in tabelle.rows:
            for zelle in zeile.cells:
                yield from alle_absaetze(zelle)


def eindeutig(absaetze):
    gesehen = set()  # verbundene Zellen liefern denselben Absatz mehrfach
    for p in absaetze:
        if p._p in gesehen:
            continue
        gesehen.add(p._p)
        yield p


def main():
    besitzer, repo = repo_aus_remote()
    basis = f"{besitzer.lower()}.github.io/{repo}"
    adressen = {"AA1": f"https://{basis}/aa1.html", "AA2": f"https://{basis}/aa2.html"}
    print("Adressen:", adressen)

    QR_ORDNER.mkdir(exist_ok=True)
    bilder = {}
    for name, adresse in adressen.items():
        datei = QR_ORDNER / f"qr_{name.lower()}.png"
        qr_erzeugen(adresse, datei)
        qr_pruefen(datei, adresse)
        bilder[name] = datei

    doc = Document(str(ORIGINAL))
    bilder_vorher = len(doc.inline_shapes)
    ersetzt = {"QR-AA1": 0, "QR-AA2": 0, "LINK-AA1": 0, "LINK-AA2": 0}

    for p in eindeutig(alle_absaetze(doc)):
        text = p.text
        for name in ("AA1", "AA2"):
            if text == f"[QR-{name}]":
                # Absatz leeren (Absatzformat bleibt) und das Bild einsetzen
                for r in p.runs[1:]:
                    r._r.getparent().remove(r._r)
                lauf = p.runs[0]
                lauf.text = ""
                lauf.add_picture(str(bilder[name]), width=Cm(3.2))
                ersetzt[f"QR-{name}"] += 1
            platzhalter = f"[LINK-{name}]"
            if platzhalter in text:
                for r in p.runs:
                    if platzhalter in r.text:
                        r.text = r.text.replace(platzhalter, adressen[name].replace("https://", ""))
                        ersetzt[f"LINK-{name}"] += 1

    if any(v != 1 for v in ersetzt.values()):
        sys.exit(f"Platzhalter nicht genau einmal gefunden: {ersetzt}")
    doc.save(str(ERGEBNIS))

    # Prüfung des Ergebnisses
    neu = Document(str(ERGEBNIS))
    rest = [p.text for p in eindeutig(alle_absaetze(neu)) if re.search(r"\[(QR|LINK)-AA[12]\]", p.text)]
    for s in neu.sections:
        for teil in (s.header, s.footer):
            rest += [p.text for p in eindeutig(alle_absaetze(teil)) if re.search(r"\[(QR|LINK)-AA[12]\]", p.text)]
    if rest:
        sys.exit(f"Es sind noch Platzhalter vorhanden: {rest}")
    eingefuegt = len(neu.inline_shapes) - bilder_vorher
    if eingefuegt != 2:
        sys.exit(f"Erwartet 2 neue Bilder, gefunden {eingefuegt}")
    print(f"Gespeichert: {ERGEBNIS.name} (Bilder vorher {bilder_vorher}, nachher {len(neu.inline_shapes)}, keine Platzhalter mehr)")


if __name__ == "__main__":
    main()
