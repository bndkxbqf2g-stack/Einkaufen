# Gebündelte Freigaben und externe Voraussetzungen

Stand: 07.11.2026

Kleine, rückwärtsverträgliche Programmier- und Testschritte laufen weiter. Die
folgenden Punkte werden gesammelt und erst umgesetzt, wenn sie ausdrücklich
freigegeben oder entschieden wurden.

## Später ausdrücklich freigeben

1. **Kostenpflichtige Dienste oder Tarifwechsel** – z. B. bezahlte KI/API,
   eigener SMTP-Dienst, Karten-/Routenanbieter oder Supabase-Upgrade. Der
   bestätigte Supabase-Tarif ist Free; es werden keine kostenpflichtigen
   Ressourcen angelegt.
2. **Übernahme vorhandener Haushaltsdaten in Supabase** – Auswahl der Quelle
   (Geräte-LocalStorage und/oder bisheriges D1), des maßgeblichen Stands und der
   zu übertragenden Haushalte. Bis dahin bleiben lokale Daten unangetastet und
   es erfolgt kein Upload ohne ausdrückliche Bestätigung.
3. **Automatische Offline-Konfliktzusammenführung** – fachliche Regeln für
   konkurrierende Änderungen, Löschungen und Vorratsmengen. Bis dahin stoppt
   der Revisionsschutz veraltete Schreibvorgänge, statt Nutzerdaten still zu
   überschreiben.
4. **Haushaltseinladungen und Beitrittsmodell** – wer Mitglieder einladen darf,
   wie Links ablaufen und welche Rechte Owner, Editor und Viewer erhalten.
5. **Frameworkwechsel auf Vue 3/TypeScript** – erst nach einem belegten Nutzen
   gegenüber der vorhandenen statischen App und ausdrücklicher Freigabe.
6. **KI-Anbieter und Betriebsbudget** – Auswahl eines Anbieters, Umfang der
   an ihn übermittelten Daten, Kostenlimit und Fallback-Verhalten. Bis dahin
   bleiben Vorschläge und Preis-/Mengenberechnungen lokal und deterministisch.

7. **Zusätzlicher Marktstopp** – den Startwert der erforderlichen Nettoersparnis
   sowie die Berechnungsbasis der Fahrtkosten festlegen. Die Schwelle soll
   einstellbar sein; bis zur Entscheidung werden keine zusätzlichen Stopps
   automatisch empfohlen und keine Fahrtkosten geschätzt.
8. **Umfang des ersten zusätzlichen Mahlzeiten-Slots** – entscheiden, ob der
   erste Pilot ein globaler, optionaler Frühstücks-Slot je Planungstag sein soll
   oder direkt eine Auswahl pro Tag und Person. Bis zur Entscheidung bleibt der
   bestehende Hauptgerichte-Plan unverändert; Rezepte werden nicht automatisch
   umklassifiziert. Ein kleiner Pilot kann das vorhandene optionale
   mealPurpose-Feld nutzen und braucht laut aktuellem Code keine
   Datenbankmigration; der Settings-Schreibpfad sowie alte Sync- und
   Backup-Payloads müssen vor der Umsetzung rückwärtskompatibel getestet werden.
9. **Erfassung tatsächlicher Einkäufe und Auswertung** – festlegen, ob nur ein
   Gesamtbetrag je Einkauf oder tatsächlich gezahlte Preise und Mengen je
   Position gespeichert werden sollen; außerdem, ob eine Belegerfassung
   überhaupt gewünscht ist und ob die Historie gerätegebunden bleibt oder
   ausdrücklich mit dem Haushalt synchronisiert wird. Bis zur Entscheidung
   bleiben vorhandene Einkaufschecks reine Statusdaten. Es werden keine
   Kassenpreise erfunden, keine Belegbilder hochgeladen und keine OCR- oder
   Ausgabenhistorie eingeführt.

## Benötigt später Nutzeraktion, keine Zugangsdaten im Chat

- Für den echten Auth-End-to-End-Test wird ein vom Nutzer angelegtes
  Testkonto benötigt. Passwort, Einmalcode oder Sitzungstoken bitte nicht in
  den Chat senden.
- Die Auth Site-URL und Redirect-Allowlist wurden laut Nutzer auf die
  Produktionsadresse gesetzt; die Werte konnten über die getrennte
  Codex-Browsersitzung nicht unabhängig ausgelesen werden.

## Abgleich der laufenden Codex-Arbeitsstränge (06.11.2026)

- PRs #13, #14, #16 und #17 wurden nach Review und jeweils grüner CI gemergt. Sie ergänzen konservative Markt-/Prospekt-Evidenz, sichere bekannte Preisbeträge, centgenaue Summen und Service-Worker-Regressionstests. Keine zusätzliche Nutzerentscheidung erforderlich.
- PR #19 ergänzt optionale Rezept-Mahlzeitenzwecke ohne Migration vorhandener Daten. CI war grün; am 06.11.2026 per Squash gemergt, automatischer Pages-Lauf #42284984325 erfolgreich.
- PR #20 vereinheitlicht den Centbetrag im Teilen der Einkaufsliste mit der bestehenden Angebotslogik. Lokal und in CI 57/57 Tests sowie Worker-Prüfungen grün; am 06.11.2026 per Squash gemergt, automatischer Pages-Deploy #42286814419 erfolgreich.
- PR #21 ergänzt bekannte Angebotssummen je Markt; unbekannte Preise bleiben separat. 58/58 Tests, Worker-Prüfungen und CI grün; am 06.11.2026 gemergt. Automatischer Pages-Lauf #42288762437 erfolgreich.
- PR #22 schließt Grundpreise wie „€/kg“ aus Packungspreissummen aus. 59/59 Tests, Worker-Build/-Validierung und PR-CI grün; am 06.11.2026 in Merge-Commit `7ce7d8e1abffad7f65103255c52a47cf1f13c4d4` gemergt. Keine zusätzliche Freigabe, keine Supabase-, Auth-, Nutzerdaten- oder Kostenänderung.
- PR #23 ergänzt den konservativen Kandidatenvergleich: Relevanz bleibt vorrangig; nur bei gleicher Relevanz, gleicher sicherer Packungsgröße und bekanntem Packungspreis darf die günstigere Packung gewinnen. 64/64 Tests, Worker-Build/-Validierung und CI waren grün; am 06.11.2026 per Squash in Merge-Commit `f8874b3c74a63d3d54acc2e1c2e6010e4dcc119e` gemergt. Keine zusätzliche Nutzerfreigabe erforderlich.
- PR #24 erhält lokale v1-Haushaltsfelder bei älteren Cloud-Snapshots und validiert Sync-Payloads vor jeder lokalen Mutation. 69/69 Tests, Worker-Build/-Validierung und CI grün; gemergt, Pages-Lauf erfolgreich. Keine Migration oder Änderung am Supabase-Projekt.
- PR #25 sichert die Erhaltung aller ausgelassenen Backup-Felder mit Regressionstests ab. 69/69 Tests, Worker-Build/-Validierung und CI grün; gemergt. Keine Produktivlogik geändert.
- PR #26 ergänzt ausschließlich den gebündelten Freigabepunkt 9 zur Speicherung tatsächlicher Einkaufsdaten; lokal 69/69 Tests grün und am 06.11.2026 gemergt. Keine Kassen-, Beleg- oder Nutzerdaten erfasst.
- Die erste zusätzliche Mahlzeiten-Erweiterung ist weiter durch Freigabepunkt 8 begrenzt: Das optionale `mealPurpose` ist vorhanden, aber keinem zusätzlichen Planungsslot zugeordnet. Die frühere Read-only-Prüfung ergab keine Migrationserfordernis für einen kleinen Frühstücks-Pilot; Auswahl pro Tag/Person bleibt bis zur Entscheidung offen.
- Chat B wurde auf Nutzerwunsch nach Übergabe seines Matcher-Schritts pausiert. Sein Branch und Worktree bleiben erhalten; der Hauptchat prüft und übernimmt die fachliche Abdeckung in einem separaten Worktree. Keine Änderung an Nutzer-, Supabase- oder Angebotsdaten; für diesen sicheren Code-Schritt ist keine zusätzliche Freigabe erforderlich.
- PR #27 verbessert den Zutaten-Angebotsabgleich anhand belegter Produktfamilien und Regressionstests. Die abschließende PR-CI (Run #42309440579) bestätigte 74/74 Tests, Worker-Build und Worker-Validierung; der Deploy-Job wurde im PR übersprungen. Am 07.11.2026 per Squash in Merge-Commit `55c0d8d28da9191b5f4b6409b281f88078be1bfa` gemergt; Pages-Deploy #42309573224 und Root-Sync #42309573166 erfolgreich. Keine zusätzliche Freigabe und keine Supabase-, Nutzerdaten- oder Angebotsdatenänderung.
- PR #29 verhindert, dass signierte negative Eurobeträge als positive Angebotspreise in Zwischensummen eingehen; solche Beträge bleiben unbekannt. Lokal und im abschließenden PR-CI-Lauf #42311622542 (#158) 75/75 Automationstests sowie Worker-Build und -Validierung grün; Deploy-Job im PR übersprungen. Am 07.11.2026 per Squash in Merge-Commit `8c8d6963bb15a9fd7ea62fb8011c91c98ec7c80f` gemergt; Pages-Deploy #42311719384 (#159), Root-Sync #42311719441 (#92) und Pages-Build/Deployment #42311719255 (#376) erfolgreich. Keine zusätzliche Freigabe, keine Angebots- oder Nutzerdatenänderung.
- PR #31 verwirft signierte negative und mehrdeutig gruppierte Eurobeträge als bekannte Preise, statt negative Werte positiv zu zählen oder aus `1.234 €` einen Teilbetrag `234 €` zu lesen. Lokal und im abschließenden PR-CI-Lauf #42312768996 (#160) 76/76 Automationstests sowie Worker-Build und -Validierung grün. Am 07.11.2026 per Squash in Merge-Commit `480e4a9fb5ef7887df79ec3052ffab067bc90a8c` gemergt; Pages-Deploy #42312834634 (#161), Root-Sync #42312834610 (#93) und Pages-Build/Deployment #42312833924 (#378) erfolgreich. Keine zusätzliche Freigabe, keine Angebots- oder Nutzerdatenänderung.
- PR #33 ergänzt einen Regressionstest, dass die veröffentlichte Service-Worker- und Manifest-Datei bytegenau ihren Root-Quellen entsprechen. Lokal 77/77 Automationstests grün; keine zusätzliche Freigabe und keine Laufzeit- oder Nutzerdatenänderung.
- Chat A ist auf Wunsch pausiert. Die Deploy-Pfadsteuerung bleibt uncommittet im verwalteten Worktree; keine Deploy-, Auth- oder Datenbankänderungen wurden ausgeführt.
- Die zusätzliche Marktstopp-Schwelle und Fahrtkostenbasis werden als spätere Nutzerentscheidung gesammelt. Bis dahin bleibt automatische Routen-/Mehrstoppoptimierung deaktiviert.
- Neue Entscheidungen zu Kosten, Nutzerdaten, Cloud, Rechten oder Produktumfang werden hier vor ihrer Umsetzung gesammelt.
