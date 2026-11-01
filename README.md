# Einkaufen / Angebotsküche

Die App erstellt Einkaufs- und Rezeptpläne aus Angeboten rund um Zellingen.

GitHub-Pages-Version: https://bndkxbqf2g-stack.github.io/Einkaufen/

GitHub Actions aktualisieren automatisch die Angebotsdateien für Aldi, Kaufland, EDEKA, Lidl und Netto. Wenn eine Händlerseite vorübergehend blockiert oder strukturell geändert ist, bleibt der letzte gültige Stand erhalten und der manuelle Import in der App verfügbar.

## Lidl-Automation

Der GitHub-Actions-Workflow `.github/workflows/lidl-offers.yml` öffnet den offiziellen Lidl-Prospekt, wählt Zellingen und schreibt erkannte Lebensmittelangebote nach `generated/lidl-offers.json`. Die Angebotsküche liest diese Datei beim offiziellen Quellen-Refresh ein. Wenn Lidl die Prospektstruktur ändert, bleibt der manuelle Import in der App verfügbar.

Manuell starten: GitHub → Actions → **Lidl-Angebote aktualisieren** oder **Aldi, Kaufland, EDEKA und Netto Angebote aktualisieren** → **Run workflow**.

