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
- PR #31 verhindert signierte Minuswerte und Teiltreffer aus mehrdeutigen Preisen. PR #35 richtet den App-Parser am Snapshot-Vertrag aus: `1.234 €` ergibt 1234 Euro, `1.234,56 €` ergibt 1234,56 Euro; `1,234 €` bleibt unbekannt. PR-CI #42329694133 (#164) bestätigte 78/78 Tests, Worker-Build und -Validierung; der Deploy-Job im PR wurde übersprungen. Am 07.11.2026 per Squash in Merge-Commit `7ab9a8509edfea82ce36dbd60f0ba84062c54dce` gemergt; Pages-Deploy #42329770530 (#165), Pages-Build/Deployment #42329770330 (#382) und Root-Sync #42329770547 (#94) erfolgreich. Keine zusätzliche Freigabe und keine Angebots- oder Nutzerdatenänderung.
- PR #33 ergänzt einen Regressionstest, dass die veröffentlichte Service-Worker- und Manifest-Datei bytegenau ihren Root-Quellen entsprechen. Lokal und im PR-CI-Lauf #42313464272 (#162) 77/77 Automationstests, Worker-Build und -Validierung grün. Am 07.11.2026 per Squash in Merge-Commit `21eb8884da5581a8fdeb80817c3e0563067c1ffb` gemergt; Pages-Deploy #42313536000 (#163) und Pages-Build/Deployment #42313534516 (#380) erfolgreich. Keine zusätzliche Freigabe und keine Laufzeit- oder Nutzerdatenänderung.
- PR #37 vereinheitlicht das konservative Zutaten-Matching für Angebote, Vorräte und Resteverwendung. CI #42330261096 (#166) bestätigte 81/81 Tests, Worker-Build und -Validierung; Deploy-Job im PR übersprungen. Am 07.11.2026 in Merge-Commit `b6f05e5b52df4fa3e7043942c872a5df75878ebf` gemergt. Keine zusätzliche Freigabe, keine Supabase-, Datenbank-, Nutzerdaten- oder Angebotsdatenänderung.
- PR #38 verwirft unbrauchbare JSON-LD-Rezeptkandidaten und Objektzutaten. CI #42330483770 (#168) bestätigte 81/81 Tests, Worker-Build und Endpoint-Validierung; Deploy-Job im PR übersprungen. Am 07.11.2026 in Merge-Commit `5528a19ac815eccdc0d949b4efadf2800581e2d9` gemergt. Keine zusätzliche Freigabe und keine externe Datenänderung.
- Die frühere Deploy-Pfadsteuerung bleibt uncommittet und pausiert. Chat A prüft aktuell lokal den Backup-/Import-/Restore-Pfad ausschließlich mit synthetischen Testdaten; Chat B prüft unabhängig deterministische Mengen-/Packungsberechnungen. Beide arbeiten in getrennten Worktrees; eigene PRs werden separat geprüft und nicht automatisch gemergt.
- Die zusätzliche Marktstopp-Schwelle und Fahrtkostenbasis werden als spätere Nutzerentscheidung gesammelt. Bis dahin bleibt automatische Routen-/Mehrstoppoptimierung deaktiviert.
- Neue Entscheidungen zu Kosten, Nutzerdaten, Cloud, Rechten oder Produktumfang werden hier vor ihrer Umsetzung gesammelt.

## Koordinierter Arbeitsstand – 07.11.2026

- PR #40 schützt beim lokalen Datei- und Cloud-Restore ausgelassene Einstellungsfelder; gemergt in `400f30c4793d2590dc8a4aa9eafe0ce60e6d8a2d`.
- PR #42 begrenzt den Offline-Shell-Fallback auf Navigationsanfragen und liefert für ungecachte Daten-/Asset-Anfragen keinen falschen HTML-Status; gemergt in `5e68198e4b9d2cd3bc64cb2f6acb8d92ef182a92`.
- PR #44 verwirft abgelaufene Angebots-Snapshots schon bei der Veröffentlichung; gemergt in `770bc43d777ff20fc9c8abc808ebed7e01a4fe4c`.
- PR #43 schützt zusätzlich beim D1- und Supabase-Laden vor dem Verlust lokal vorhandener Settings-Felder. Er bleibt bis zur Rebase-/CI-Prüfung offen: https://github.com/bndkxbqf2g-stack/Einkaufen/pull/43.
- Chat A prüft unabhängig die Frontend-Tagesgrenze des Angebotsimports; Chat B aktualisiert PR #43 und prüft danach die Supabase-Offline-/Sync-Fehleranzeige. Der Hauptchat koordiniert Review, CI und Integration ohne gemeinsame Dateien parallel zu ändern.
- Für diese rückwärtsverträglichen Prüf- und Korrekturschritte ist keine zusätzliche Nutzerfreigabe erforderlich. Keine Datenmigration, keine Änderung am Supabase-Projekt und keine kostenpflichtige Ressource wurde angelegt.

## Koordinierter Arbeitsstand – 07.11.2026, Aktualisierung

- Der aktuelle Integrationsstand ist `main@61af5a0f60097ee7eaecc791d44cdcecb9b80ea5`.
- PR #43 schützt beim D1- und Supabase-Laden vor dem Verlust lokal vorhandener Settings-Felder; CI war grün und der PR ist in `27c9eb6721e971aeefdac435827a5b9dfbd37a9c` gemergt.
- PR #45 korrigiert die Frontend-Tagesgrenze manueller Angebote auf `23:59:59.999`; CI bestätigte 92/92 Tests, gemergt in `61af5a0f60097ee7eaecc791d44cdcecb9b80ea5`.
- PRs #40, #42, #43, #44 und #45 sind damit geprüft und integriert; keine Datenmigration, keine Änderung am Supabase-Projekt und keine kostenpflichtige Ressource wurde angelegt.
- Chat A arbeitet aktiv an einem isolierten Audit der deterministischen Mengen-/Packungsrundung am Übergang Rezept → Einkaufsliste. Chat B arbeitet aktiv an einem isolierten Audit der sichtbaren Supabase-Fehler-/Statusbehandlung bei Offline- oder Lade-/Speicherfehlern. Beide erstellen nur bei einem belegten, kleinen Defekt einen eigenen PR und ändern keine überlappenden Angebots-, Restore-, Service-Worker- oder Supabase-Schema-Bereiche.
- Der Hauptchat arbeitet parallel weiter, prüft eingehende PRs separat und wartet nicht auf die Nebenchats. Für diese rückwärtsverträglichen Prüf- und Korrekturschritte ist keine zusätzliche Nutzerfreigabe erforderlich.
