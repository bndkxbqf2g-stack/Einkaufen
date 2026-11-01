# Einkaufen / Angebotsküche

Die private Live-App erstellt Einkaufs- und Rezeptpläne aus Angeboten rund um Zellingen.

## Lidl-Automation

Der GitHub-Actions-Workflow `.github/workflows/lidl-offers.yml` öffnet den offiziellen Lidl-Prospekt, wählt Zellingen und schreibt erkannte Lebensmittelangebote nach `generated/lidl-offers.json`. Die Angebotsküche liest diese Datei beim offiziellen Quellen-Refresh ein. Wenn Lidl die Prospektstruktur ändert, bleibt der manuelle Import in der App verfügbar.

Manuell starten: GitHub → Actions → **Lidl-Angebote aktualisieren** → **Run workflow**.
