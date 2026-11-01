# Einkaufen / Angebotsküche

Die App erstellt Einkaufs- und Rezeptpläne aus Angeboten rund um Zellingen.

## App

**GitHub-Pages-Version:** https://bndkxbqf2g-stack.github.io/Einkaufen/

Die statische GitHub-Pages-Version speichert Favoriten, Tagesauswahl, Bewertungen und Backups lokal im Browser. Lidl-Angebote werden aus dem GitHub-Actions-Datensatz geladen. Für Aldi, Kaufland, EDEKA und Netto bleibt der manuelle Angebotsimport verfügbar; serverseitige Cloud-Synchronisierung und direkte Rezeptparser benötigen ein Backend.

## Lidl-Automation

Der GitHub-Actions-Workflow `.github/workflows/lidl-offers.yml` öffnet den offiziellen Lidl-Prospekt, wählt Zellingen und schreibt erkannte Lebensmittelangebote nach `generated/lidl-offers.json`. Die GitHub-Pages-App liest diese Datei beim Quellen-Refresh ein. Wenn Lidl die Prospektstruktur ändert, bleibt der manuelle Import in der App verfügbar.

Manuell starten: GitHub → Actions → **Lidl-Angebote aktualisieren** → **Run workflow**.

## GitHub Pages

Der Workflow `.github/workflows/github-pages.yml` veröffentlicht den Inhalt von `dist/` automatisch über GitHub Pages.
