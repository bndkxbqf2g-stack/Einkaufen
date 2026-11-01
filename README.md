# Einkaufen / Angebotsküche

Die App erstellt Einkaufs- und Rezeptpläne aus Angeboten rund um Zellingen.

GitHub-Pages-Version: https://bndkxbqf2g-stack.github.io/Einkaufen/

GitHub Actions aktualisieren automatisch die Angebotsdateien für Aldi, Kaufland, EDEKA, Lidl und Netto. Wenn eine Händlerseite vorübergehend blockiert oder strukturell geändert ist, bleibt der letzte gültige Stand erhalten und der manuelle Import in der App verfügbar.

## Lidl-Automation

Der GitHub-Actions-Workflow `.github/workflows/lidl-offers.yml` öffnet den offiziellen Lidl-Prospekt, wählt Zellingen und schreibt erkannte Lebensmittelangebote nach `generated/lidl-offers.json`. Die Angebotsküche liest diese Datei beim offiziellen Quellen-Refresh ein. Wenn Lidl die Prospektstruktur ändert, bleibt der manuelle Import in der App verfügbar.

Manuell starten: GitHub → Actions → **Lidl-Angebote aktualisieren** oder **Aldi, Kaufland, EDEKA und Netto Angebote aktualisieren** → **Run workflow**.

## Bring-Prospekte

Der Workflow `.github/workflows/bring-offers.yml` öffnet die Bring-Web-App in einem Playwright-Browser, wählt den konfigurierten Ort, lädt sichtbare Prospektbilder und liest Lebensmittelangebote per Tesseract-OCR aus. Er läuft sonntags und schreibt die erkannte Artikelzahl nach `generated/bring-offers.json`.

Für den eingeloggten Abruf muss im öffentlichen Repository unter **Settings → Secrets and variables → Actions** das Secret `BRING_STORAGE_STATE_B64` hinterlegt werden. Es enthält nur einen verschlüsselten Playwright-Storage-State, niemals das Passwort. Optional kann die Repository-Variable `BRING_BROCHURE_URLS` zeilenweise geteilte Bring-Prospektlinks enthalten. Ohne Sitzung oder Links bricht der Workflow kontrolliert ab und erzeugt keine erfundenen Angebote.

