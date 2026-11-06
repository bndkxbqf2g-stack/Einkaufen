# Einkaufen / Angebotsküche

Die App erstellt Einkaufs- und Rezeptpläne aus Angeboten rund um Zellingen.

GitHub-Pages-Version: https://bndkxbqf2g-stack.github.io/Einkaufen/

## Backend

Das separate Supabase-Projekt ist als sichere Haushalts-/Sync-Grundlage eingerichtet
mit Anmeldung sowie revisionsgeschützter Haushaltssynchronisierung verbunden und auf
GitHub Pages veröffentlicht. Lokale Daten und der optionale D1-Sync bleiben erhalten;
es gab keine automatische Datenübernahme. Details: [Supabase-Setup](docs/SUPABASE.md).

GitHub Actions aktualisieren automatisch die Angebotsdateien für Aldi, Kaufland, EDEKA, Lidl und Netto. Wenn eine Händlerseite vorübergehend blockiert oder strukturell geändert ist, bleibt der letzte gültige Stand erhalten und der manuelle Import in der App verfügbar.

## Lidl-Automation

Der GitHub-Actions-Workflow `.github/workflows/lidl-offers.yml` öffnet den offiziellen Lidl-Prospekt, wählt Zellingen und schreibt erkannte Lebensmittelangebote nach `generated/lidl-offers.json`. Die Angebotsküche liest diese Datei beim offiziellen Quellen-Refresh ein. Wenn Lidl die Prospektstruktur ändert, bleibt der manuelle Import in der App verfügbar.

Manuell starten: GitHub → Actions → **Lidl-Angebote aktualisieren** oder **Aldi, Kaufland, EDEKA und Netto Angebote aktualisieren** → **Run workflow**.

## KaufDA-Angebote

Der GitHub-Actions-Workflow `.github/workflows/kaufda-offers.yml` nutzt strukturierte Angebotskarten der öffentlichen KaufDA-Filialseiten als Standard. Er scrollt nachgeladene Inhalte automatisch, filtert ausschließlich Lebensmittel und schreibt die Ergebnisse nach `generated/*-offers.json`. Wenn die Filialseite keine strukturierten Karten liefert, bleibt OCR für die öffentliche Prospektseite als Fallback verfügbar. Die App zeigt die je Markt erkannte Artikelzahl an.

Der Workflow verarbeitet Aldi Süd Zellingen, EDEKA Traut Zellingen, Lidl Zellingen, Penny Zellingen und Kaufland Würzburg/Nürnberger Straße. Er läuft wöchentlich und kann zusätzlich manuell über GitHub → Actions → **KaufDA-Angebote für Zellingen und Würzburg aktualisieren** → **Run workflow** gestartet werden.

### Erweiterter Browserpfad für vollständige Angebotslisten (optional)

Wenn KaufDA die vollständige Angebotsliste nur in einer Browseransicht anzeigt, kann pro Markt eine zusätzliche Browser-URL als Repository-Variable `KAUFDA_BROWSER_URLS` hinterlegt werden. Eine Zeile hat das Format `Markt|URL`, zum Beispiel:

```text
Aldi|https://...
Lidl|https://...
```

Der Workflow öffnet diese URL headless, scrollt bis keine neuen Karten mehr erscheinen, bedient sichtbare Mehr-/Nächste-Angebote-Steuerungen und übernimmt nur Lebensmittelkarten. Die öffentliche Filialseite bleibt der sichere Standard, wenn keine Browser-URL konfiguriert ist. Für eine geschützte KaufDA-Seite kann optional ein exportierter Playwright-Storage-State als Base64 in das GitHub-Secret `KAUFDA_STORAGE_STATE_B64` gelegt werden. Cookies und Sitzungsdaten niemals committen oder als Repository-Variable speichern. Liefert die Browseransicht keine strukturierten Karten, bricht der Lauf sauber ab; die vorhandenen Daten bleiben erhalten und der manuelle Import bleibt verfügbar.

Wenn KaufDA seine Seitenstruktur ändert, bleibt der manuelle Angebotsimport in der App verfügbar.
