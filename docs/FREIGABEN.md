# Gebündelte Freigaben und externe Voraussetzungen

Stand: 10.11.2026

Kleine, rückwärtsverträgliche Programmier- und Testschritte laufen weiter. Die
folgenden Punkte werden gesammelt und erst umgesetzt, wenn sie ausdrücklich
freigegeben oder entschieden wurden.

## Qualitätsstand 10.11.2026

- Der Qualitätsaudit wurde gegen `main@d3bcf3c0e196a9a7f82ae4fb8993dc449bc70778` ausgeführt; PR #340 präzisierte den historischen Budget-Audit und PR #341 dokumentierte die Paritätsprüfung. Beide sind gemergt.
- Die zentralen Root-/`dist`-Dateien für App, Supabase-Sync, Kosten-/Budgetmodell, Service Worker, Abwechslung, Mengen und Vorratsdeckung sind bytegleich geprüft.
- Die Prüfung war read-only: keine Nutzer-, Angebots-, Supabase-, Schema-, Daten- oder Produktionsänderung.
- Unabhängige Tests und Dokumentationsprüfungen laufen weiter. Der nächste Laufzeitblock bleibt der gebündelt freizugebende Kaufabschluss gemäß Punkt 9.


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
8. **Umfang des ersten zusätzlichen Mahlzeiten-Slots** – entschieden:
   Es gibt keinen Frühstücks-Slot. Der bestehende Hauptgericht-Slot gilt als
   Mittagessen; zusätzlich ist ausschließlich ein optionaler Abendessen-Slot
   vorgesehen. Die additive Umsetzung kann je Planungstag zunächst nur die
   Personenzahl `2`, `3` oder `4` festlegen und nutzt den globalen Wert als
   Default; eine benannte Auswahl einzelner Haushaltsteilnehmer/Kinderprofile
   und eine automatische Umklassifizierung bestehender Rezepte sind nicht
   vorgesehen.
   Der Pilot darf das vorhandene optionale mealPurpose-Feld nutzen und braucht
   laut aktuellem Code keine Datenbankmigration; Settings-Schreibpfad sowie
   alte Sync- und Backup-Payloads müssen rückwärtskompatibel bleiben und durch
   Tests abgesichert werden.
9. **Erfassung tatsächlicher Einkäufe und Auswertung** – festlegen, ob nur ein
   Gesamtbetrag je Einkauf oder tatsächlich gezahlte Preise und Mengen je
   Position gespeichert werden sollen; außerdem, ob eine Belegerfassung
   überhaupt gewünscht ist und ob die Historie gerätegebunden bleibt oder
   ausdrücklich mit dem Haushalt synchronisiert wird. Bis zur Entscheidung
   bleiben vorhandene Einkaufschecks reine Statusdaten. Es werden keine
   Kassenpreise erfunden, keine Belegbilder hochgeladen und keine OCR- oder
   Ausgabenhistorie eingeführt.

**Entscheidungscheckliste für die spätere Freigabe von Punkt 9**

Die folgenden Punkte müssen vor einer produktiven IST-Erfassung festgelegt werden; diese Checkliste ist selbst noch keine Freigabe und ändert keine Daten:

- **Erfassungsgranularität:** nur ein Gesamtbetrag je Einkauf oder Positionen mit tatsächlich bezahlten Mengen und Preisen.
- **Quelle:** ausschließlich manuelle Eingabe, spätere Belegerfassung/OCR oder eine ausdrücklich begrenzte Kombination.
- **Zeitbezug:** Kaufdatum, Monatszuordnung und maßgebliche Zeitzone sowie der Umgang mit nachträglichen Korrekturen.
- **Historie und Rechte:** nur auf diesem Gerät oder haushaltsweit synchronisiert; außerdem Aufbewahrung und Löschung.
- **Umfang:** ob Märkte, Haushaltswaren und Fahrtkosten getrennt erfasst oder ausgeschlossen werden.
- **Budgetanzeige:** Monatsziel und Überziehung ausschließlich aus bestätigten IST-Werten; Plan- und Angebotswerte bleiben getrennt.
- **Null-/Korrekturbeträge:** festlegen, ob ein Einkauf mit 0 Cent zulässig ist (z. B. kostenlos erhalten), ob Korrekturen separat erfasst oder Einträge geändert/gelöscht werden und ob negative Beträge grundsätzlich ausgeschlossen bleiben.


## Offene Nutzerentscheidung – mengenfähige Vorräte

Die folgende Entscheidung ist für eine spätere mengenfähige Vorratserfassung zu bündeln; sie ist noch keine Freigabe und ändert keine bestehenden Vorratsdaten:

- **Mengenmodell:** nur eine ungefähre Restmenge je Zutat oder zusätzlich Einheit/Packungsgröße.
- **Genauigkeit:** freie Angabe wie „wenig/halb/voll“ oder normierte Werte; keine Genauigkeit vortäuschen, die aus dem Bestand nicht ablesbar ist.
- **Verbrauch:** Vorräte nur als „vorhanden“ abziehen oder pro Gericht eine geplante Verbrauchsmenge reservieren.
- **Nullbestand und Korrektur:** Verhalten bei „aufgebraucht“, negativen Korrekturen und unbekannter Menge.
- **Zeitbezug:** Haltbarkeit/Mindesthaltbarkeit überhaupt erfassen oder bewusst weglassen.
- **Datenhoheit:** nur lokal, im Backup, oder haushaltsweit synchronisiert; inklusive Löschung und Konfliktbehandlung.
- **Angebotswert:** Vorräte weiterhin vollständig aus dem Angebots-Zwischenwert und dem bestätigten Monatsbudget ausnehmen.

### Freigegebener Pilotumfang 09.11.2026

Die lokale, lesende erste Einkaufslistenintegration ist freigegeben und umgesetzt:

- Bedarf aus Mittagessen und optionalem Abendessen wird je Zutatenidentität vor der Deckung zusammengeführt.
- Es werden ausschließlich positive, explizite Mengen in g/kg, ml/l oder Stück verrechnet; Familienwechsel werden nicht angenommen.
- Vollständige Deckung wird aus der Einkaufsliste entfernt, Teildeckung reduziert nur den Restbedarf. Unbekannte, null/negative und inkompatible Bestände erhalten den vollen Bedarf.
- Packungsrundung erfolgt erst nach der Deckung und nur bei passender Packungsgröße; manuelle, mengenlose und alte String-Pantry-Positionen bleiben unverändert.
- Der Pilot liest `pantryQuantities` nur lokal und verändert weder Vorrat, Mengenbestand, LocalStorage, Backup, Cloud, Supabase noch Sync-Payloads. Frühstück und automatische Verbrauchsbuchung gehören nicht dazu.

Die weitergehenden Entscheidungen oben bleiben für Verbrauchsreservierung, Genauigkeit, Nullbestand, Zeitbezug, Datenhoheit und Budgetausnahme offen.


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
- Der historische Freigabepunkt 8 ist durch die Nutzerentscheidung vom 07.11.2026 überholt: `mealPurpose` bleibt zwar als Rezeptmetadatum bestehen, aber es gibt keinen Frühstücks-Slot und keine Auswahl pro Tag/Person. Der bestätigte Planumfang bleibt Mittagessen plus optionales Abendessen.
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

## Koordinierter Arbeitsstand – 07.11.2026, PWA-Update

- Der aktuelle Integrationsstand ist `main@52f8d6e66e5ec650a1c2bbd3742387a655329190`.
- PR #47 aktualisierte den Koordinationsstand in dieser Datei; gemergt nach erfolgreicher Prüfung.
- PR #48 ergänzt installierbare SVG-App-Icons in Root und `dist`, synchronisiert beide Manifeste, prüft die Icon-Metadaten automatisiert und ergänzt die bisher fehlenden CI-Pfade für Manifest-/Icon-Änderungen. Die PR-CI (Run `42334269590`) war vollständig grün; gemergt in `52f8d6e66e5ec650a1c2bbd3742387a655329190`. Keine Nutzer-, Supabase- oder Angebotsdaten geändert.
- Chat A hat den Mengen-/Packungsaudit ohne reproduzierbaren Defekt abgeschlossen und arbeitet nun an einem getrennten Audit der Angebotsnormalisierung. Chat B prüft weiterhin die sichtbare Supabase-Fehler-/Statusbehandlung. Der Hauptchat arbeitet parallel an weiteren unabhängigen, kleinen Verbesserungen.
- Für diese rückwärtsverträglichen Prüf- und Korrekturschritte ist keine zusätzliche Nutzerfreigabe erforderlich. Kostenpflichtige Ressourcen und Datenbankmigrationen bleiben ausgeschlossen.

## Koordinierter Arbeitsstand – 07.11.2026, Kontingentsteuerung

- Aktueller Integrationsstand: `main@a61cb7217ed324a1101a409b7ddaf2402a73dfeb`.
- PR #50 hält den Root-Sync für PWA-Icons konsistent; CI Run `42334533497` war vollständig grün und der PR wurde gemergt.
- PR #51 korrigiert die irreführende Supabase-Anmeldeaufforderung bei nicht erreichbarer Initialisierung. Die lokale Nutzung bleibt möglich, Einstellungen werden im Offline-Fehlerpfad nicht geöffnet; CI Run `42334865729` war vollständig grün und der PR wurde gemergt. Keine Datenbankmigration, Auth-URL- oder Supabase-Projektänderung.
- Chat A hat im Angebotsnormalisierungs-Audit einen reproduzierbaren Kaufland-Grenzfall gefunden: Dezimal-Packungsgrößen wie `0,33-l-Dose` wurden beim Namenstrimming als Preis interpretiert und der Produktname zu früh abgeschnitten. Ein minimaler PR mit direktem Regressionstest steht noch aus; bis dahin keine Angebotsdaten ändern.
- Die Kontingentsteuerung arbeitet mit den Regeln: bei 60 % Verbrauch im 5-Stunden-Fenster keine neuen Nebentasks, bei 80 % Verbrauch Projektarbeit pausieren; bei höchstens 10 % Wochenrest ebenfalls pausieren. Der zuletzt geprüfte Stand lag bei 3 % Verbrauch im 5-Stunden-Fenster und 30 % im Wochenfenster.

## Koordinierter Arbeitsstand – 07.11.2026, Normalisierung

- Aktueller Integrationsstand: `main@e7b0c88adec41dd04bf0acad5cda24b71d40522e`.
- PR #53 korrigiert das Abschneiden dezimaler Packungsgrößen im Angebotsnamen, z. B. `0,33-l-Dose` bei Kaufland. Der konkrete Produktname bleibt erhalten; Preis und Packungsgröße werden weiterhin deterministisch geprüft. Die PR-CI (Run `42335185938`) war vollständig grün; gemergt in `e7b0c88adec41dd04bf0acad5cda24b71d40522e`.
- Keine Datenbankmigration, keine Änderung am Supabase-Projekt, keine erfundenen Angebotsdaten und keine neue kostenpflichtige Ressource.
- Chat A hat den begrenzten Audit abgeschlossen; Chat B bleibt nach PR #51 abgeschlossen. Neue Nebentasks werden erst nach erneuter Kontingentprüfung und nur unterhalb der vereinbarten Verbrauchsgrenzen gestartet.

## Koordinierter Arbeitsstand – 07.11.2026, Auditabschluss

- Der Kostenmodell-Audit von Chat B fand keinen reproduzierbaren Defekt: bekannte positive Angebotspreise werden centgenau und packungsbezogen summiert; unbekannte, negative, Grund- und mehrdeutige Preise bleiben getrennt. Der fokussierte Teststand war 7/7 grün; kein PR und keine Dateiänderung.
- Der Angebots-Deduplikationsaudit von Chat A fand keinen reproduzierbaren Defekt: gleiche Namen und Preise mit unterschiedlichen Packungsgrößen wurden in der Probe nicht zusammengelegt. Das verbleibende Namensartefakt gehört zum bereits behobenen bzw. separat abgegrenzten Normalisierungsthema; kein PR und keine Dateiänderung.
- Beide Nebenchats haben ihre begrenzten Aufgaben abgeschlossen. Es werden keine Folgeaufgaben gestartet, bis eine neue Kontingentprüfung erfolgt. Der zuletzt geprüfte Verbrauch lag bei 6 % im 5-Stunden-Fenster und 31 % im Wochenfenster.

## Koordinierter Arbeitsstand – 07.11.2026, PR #57

- PR #57 schützt `getActiveOffers()` vor ungültigen persistierten Markt-IDs und Markt-Limits; der PR ist in `6d75fe642d43f170b9fc8d8d25b9c9ccede54371` gemergt.
- Die PR-CI war nach Korrektur des Regressionstests grün.
- Der B-Wochenplan-Audit fand keinen reproduzierbaren Defekt. Manuell fixierte und vorgemerkte Gerichte bleiben bei geänderter Kandidatenreihenfolge erhalten; bekannte Randbedingung: Eine Zuordnung kann entfallen, wenn das Rezept entfernt oder verworfen wurde.
- Keine Produktdateien oder Supabase-Änderungen; keine neue Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Read-only-Audits

- Der Markt-/Routen-Audit fand keine Warenkorb-/Fahrtkostenoptimierung: Die App zeigt statische Entfernungen und sortiert ausgewählte Märkte danach. Ausgangspunkt/Datenschutz, Verkehrsmittel und Kostenbasis, Nettoersparnisschwelle, maximale Stopps sowie Routingquelle sind vor einer Umsetzung zu entscheiden.
- Der Monatsbudget-/IST-Audit bestätigte damals, dass noch keine produktive Kauf-/IST-Erfassung verbunden war. Der lokale Budget- und `purchaseRecords`-Kern ist inzwischen als sichere Grundlage vorhanden, bleibt aber bis zu Freigabepunkt 9 aus UI, Speicherung und Sync heraus. `shoppingChecks` bleiben reine Checklisten. Vorher sind Gesamtbetrag je Einkauf oder Positionen mit echten Mengen/Preisen, Beleg/OCR, Geräte- oder Haushaltshistorie, Zeitraumdefinition und Fahrtkostenabgrenzung zu entscheiden.
- Beide Audits waren read-only: keine Produkt- oder Supabase-Änderung, keine Datenänderung und keine Umsetzung eines neuen Freigabepunkts.


## Koordinierter Arbeitsstand – 07.11.2026, Konzeptprüfungen Markt und IST-Budget

- Die Konzeptprüfung für eine spätere pure lokale Funktion `optimizeMarketSelection(input)` hält fest: Eingaben werden nur mit sicheren Centbeträgen, normalisierten Packungsgrößen und gültigen Angebotszeiträumen verarbeitet; fehlende, mehrdeutige oder abgelaufene Daten werden nicht zu 0 € oder einer Ersparnis gemacht. Einkaufsbetrag und Fahrtkosten bleiben getrennte Werte. Fehlen notwendige Daten, liefert die Funktion den Status `insufficient_data` mit nachvollziehbaren Gründen.
- Eine Mehrstopp-Variante darf nur bei überschrittener Nettoersparnisschwelle und innerhalb von `maxStops` empfohlen werden. Gleichstände werden deterministisch entschieden, z. B. Nettoersparnis absteigend, Fahrtkosten aufsteigend, weniger Stopps zuerst und anschließend stabile kanonische Markt-Reihenfolge. Die Umsetzung bleibt bis zur Entscheidung über Schwelle, Fahrtkostenbasis, Ausgangspunkt/Datenschutz, `maxStops` und Routingdienst zurückgestellt.
- Die Konzeptprüfung für die erste lokale IST-Budget-Etappe definiert `purchaseRecords` als `{ id, purchaseDate, month, totalCents, market, source: 'manual' }`. Das feste Monatsziel beträgt zunächst 40.000 Cent; Planwert, Angebots-Zwischensumme und IST-Ausgaben werden getrennt berechnet. `shoppingChecks` bleiben reine Checklisten und erzeugen keine Ausgaben.
- Offen bleiben vor der Umsetzung: Gesamtbetrag je Einkauf oder Positionen mit echten Mengen/Preisen, Beleg/OCR, gerätegebundene oder Haushaltshistorie, Zeitraumdefinition sowie die Abgrenzung von Fahrtkosten und Haushaltswaren.
- Beide Konzeptprüfungen waren read-only. Keine Produktdateien, keine Supabase-Änderung, keine OCR-/Belegverarbeitung und keine Datenänderung.

## Koordinierter Arbeitsstand – 07.11.2026, Umsetzungspakete Marktoptimierung und IST-Budget

- Die Marktoptimierung bleibt bis zu den fachlichen Freigaben vorbereitet, nicht umgesetzt:
  - **MO-0 Freigabe/Vertrag:** Eingabe-/Ausgabevertrag, sichere Cent-/Packungs-/Gültigkeitsdaten, `insufficient_data` und Entscheidungen zu Schwelle, Fahrtkostenbasis, Ausgangspunkt/Datenschutz, `maxStops`, Vergleichspreisen und Routingdienst festlegen.
  - **MO-1 Pure Kernfunktion:** `optimizeMarketSelection(input)` lokal, deterministisch und ohne Netzwerk; Einkaufs- und Fahrtkosten getrennt, Mehrstopp nur bei erfüllter Nettoersparnisschwelle.
  - **MO-2 Synthetische Tests:** gültige/ungültige Angebote, abgelaufene Daten, fehlende Preise, Schwellenwerte, `maxStops` und deterministische Tie-Breaker prüfen.
  - **MO-3 Verpackung/Worker:** Modulgrenzen, Build und Worker-Auslieferung vorbereiten; keine externe Routing- oder Kostenquelle ohne Freigabe anbinden.
  - **MO-4 Adapter/UI:** erst nach MO-0 bis MO-3 ausgewählte Markt-/Routenadapter und getrennte Ergebnisanzeige ergänzen.
  - **MO-5 CI/Rollout:** CI-Gates, Regressionen und gestuften Rollout prüfen; Veröffentlichung erst nach grüner CI und den fachlichen Freigaben.
- Die IST-Budget-Etappe bleibt ebenfalls vorbereitet, nicht produktiv umgesetzt:
  - **WP1 Validator:** lokales `purchaseRecords`-Schema mit Datum/Monat, positivem Centbetrag, optionalem kanonischem Markt und `source: 'manual'` validieren.
  - **WP2 LocalStorage:** eigener lokaler Schlüssel, Round-trip, Korrektur/Löschung sowie Quota-/korruptes-JSON-Verhalten absichern.
  - **WP3 Payload-/Cloud-Grenze:** zunächst nicht in D1, Supabase oder bestehende v1-Payloads aufnehmen; Backup-/Sync-Aufnahme separat entscheiden.
  - **WP4 Monatsrechnung:** 40.000 Cent Zielbudget, monatliche IST-Summe und Restbudget deterministisch berechnen; Plan- und Angebotswerte getrennt halten.
  - **WP5 UI:** manuelle Eingabe und getrennte Anzeige von Plan/Schätzung, Angebots-Zwischenwert, IST-Ausgaben, Budget und Restbudget; `shoppingChecks` bleiben Checkliste.
  - **WP6 Tests:** Validator, Monatssummen, Überziehung, Persistence, Trennung von Checks/Planwerten und Ausbleiben von Netzwerkaufrufen testen.
- Die produktive Speicherung tatsächlicher Einkäufe sowie jede Änderung an Backup, D1, Supabase, Beleg/OCR, Positionsdaten oder Haushaltshistorie startet erst nach ausdrücklicher Freigabe von Freigabepunkt 9. Diese Liste ist nur eine Umsetzungsvorbereitung und keine Freigabe.

## Koordinierter Arbeitsstand – 07.11.2026, Settings- und Restore-Stabilisierung

- Der aktuelle Integrationsstand ist `main@629e0a2a5197e50a4b17463c52e7a7c30c1d02c3`.
- PR [#62](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/62) ist gemergt und normalisiert beim Restore ungültige bzw. ältere Settings-Werte für Personen, Tage, Märkte und Booleans. Unbekannte `selectedMarkets` werden gefiltert und sicher auf die Standardauswahl zurückgeführt; gültige Einstellungen bleiben erhalten. Die CI war grün.
- PR [#63](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/63) ist gemergt und vergibt für ältere `manualShoppingItems` stabile deterministische IDs. Außerdem bleiben `shoppingChecks` über Reload und Restore erhalten. Die CI war ebenfalls grün.
- Beide Änderungen waren rückwärtsverträgliche Stabilitätskorrekturen ohne Supabase-, Datenmodell-, Kosten- oder Produktarchitekturänderung; es ist keine zusätzliche Nutzerfreigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Restore-Normalisierung und Favoriten-/Angebotsaudit

- Der aktuelle Integrationsstand ist `main@637bf834f738fede695bcb432fa2fe94a9542030`.
- PR [#65](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/65) ist gemergt. `recipeHistory` und `pantry` werden vor Backup und Cloud-Synchronisierung normalisiert und persistiert; die CI war grün.
- Der abgeschlossene Read-only-Audit von `favorites` und `customOffers` fand keinen reproduzierbaren Datenverlust oder instabile Identität über Reload, Backup und Restore. Namen, Preise, Ablaufdaten und Zusatzfelder bleiben im aktuell erzeugten Datenformat erhalten.
- Als nicht belegter, unveränderter Randbefund bleibt dokumentiert: Ein unmarkiertes Legacy-Angebot ohne Quellen-/Manuellkennzeichnung kann im bestehenden Migrationspfad als automatisches Angebot eingestuft und archiviert werden. Es wurde hierzu kein Defekt bestätigt und keine Produktdatei geändert.
- PR #65 und der Audit erforderten keine Supabase-, Datenmodell-, Kosten- oder Produktarchitekturänderung.

## Koordinierter Arbeitsstand – 07.11.2026, PWA-Cache-Marker

- Der aktuelle Integrationsstand ist `main@4d376f1b1dbf217af240e74d9b1363a5ed9fae19`.
- Der gemergte PR #67 veröffentlicht den neuen `APP_BUILD`-Marker `2026-11-07-restore-stability-1` in Root und `dist`, damit bestehende PWA-Clients den Shell-Cache nach den Restore-Stabilisierungen invalidieren.
- Der GitHub-Pages-Deploy (Run #214), der Pages-Build/Deploy (Run #414) und der Root-Sync (Run #108) liefen für diesen Merge-Commit erfolgreich durch. Es wurden keine Produktdaten, Supabase-Daten oder Datenmodelle geändert.

## Koordinierter Arbeitsstand – 07.11.2026, GitHub-Pages-Pfade

- Der aktuelle Integrationsstand ist `main@113e179c21247f11e14d7a48c6eb9f66a3a66e1a`.
- PR [#69](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/69) ist gemergt und ergänzt `docs/**` in `push.paths` und `pull_request.paths` von `.github/workflows/github-pages.yml`.
- Die PR-CI (Run `42340472415`) war grün. Keine Produktlogik, Daten- oder Supabase-Änderung.

## Koordinierter Arbeitsstand – 07.11.2026, Audit Wochenumfang

- Read-only-Audit: `mealPurpose` erlaubt bereits `Hauptgericht`, `Frühstück`, `Brotzeit`, `Snack`, `Getränk` und `Flexibel`; die Planung nutzt weiterhin ein Hauptgericht pro Tag.
- Eine approval-freie Erweiterung ist nicht vertretbar, weil zusätzliche Slots die Auswahl, Mengen, Kosten sowie Settings-/Backup-/Sync-Kompatibilität fachlich berühren.
- Historischer Freigabepunkt 8 ist durch die Nutzerentscheidung vom 07.11.2026 überholt: Es gibt keinen Frühstücks-Slot; der Umfang bleibt Mittagessen plus optionales Abendessen. Dieser Hinweis ist keine Freigabe und ändert weder Produkt-, Daten- noch Supabase-Stand.

## Koordinierter Arbeitsstand – 07.11.2026, Offline-Sync-Test

- Der aktuelle Integrationsstand ist `main@f5fe78254ac14e504f3164b9751a1bc99e172e5e`.
- PR [#72](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/72) ist gemergt; `automation/supabase-sync.test.mjs` seedet lokale Settings und Pantry und prüft deren Unverändertheit bei fehlgeschlagener Supabase-Initialisierung.
- Der CI/Deploy-Run `42341229263` war erfolgreich. Keine Produktions-, Datenformat-, Schema- oder Produktänderung.

## Koordinierter Arbeitsstand – 07.11.2026, Angebots- und Zutatenkorrekturen

- Der aktuelle Integrationsstand ist `main@2de36bd061dbd1931e60099f1829573778199941`.
- PR [#74](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/74) filtert Lidl-OCR-Grundpreiszeilen wie `(1 kg = 1,58 €)` vor der Preis-/Packungsanalyse; Regressionstests sichern die Korrektur.
- PR [#75](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/75) vereinheitlicht Singular/Plural gemeinsamer Zutaten in der Einkaufsliste, erhält den zuerst vorhandenen Schlüssel und enthält Regressionstests. Beide PRs sind gemergt und die CI war grün. Keine Supabase-, Datenmodell- oder Budgetänderung.

## Koordinierter Arbeitsstand – 07.11.2026, Snapshot-Deduplizierung

- PR [#77](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/77) ist in den aktuellen Integrationsstand `main@6e07fc8864e836413790b053540da74627215210` gemergt.
- Der zentrale Validator weist exakte Angebots-Snapshot-Duplikate anhand der normalisierten Identität aus Name, Preis, Packungsgröße und Gültigkeitsdatum zurück. Unterschiedliche Packungsgrößen bleiben zulässig.
- Der Regressionstest und die PR-CI (Run [#42342350172](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42342350172)) waren erfolgreich.
- Keine Supabase-, Datenmodell-, Budget- oder Angebotsdatenänderung; keine zusätzliche Nutzerfreigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, PWA-Client-Aktivierung

- PR [#79](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/79) ist in den aktuellen Integrationsstand `main@37c22a08239cbb99ad02b99abbf46e0b79a850d6` gemergt.
- `sw.js` und `dist/sw.js` warten beim `activate`-Ereignis nun über `event.waitUntil()` auf `clients.claim()`, damit bestehende Clients die Aktivierung vollständig abwarten.
- Der verzögerte-Claim-Regressionstest und die PR-CI (Run [#42342824800](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42342824800)) waren erfolgreich.
- Keine Daten-, Supabase- oder Architekturänderung; keine zusätzliche Nutzerfreigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Manuelle Einkaufsvarianten

- PR [#81](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/81) ist in den aktuellen Integrationsstand `main@1d13cdbaa9921d40a725564639787a74fbe79b5b` gemergt.
- Manuelle Singular-/Pluralvarianten bleiben von der Zusammenführung der Rezeptzutaten getrennt; stabile `manual-*`-IDs und `shoppingChecks` bleiben dadurch erhalten.
- Der Regressionstest und die PR-CI (Run [#42343231403](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42343231403)) waren erfolgreich.
- Keine neue Datenstruktur, keine Supabase- oder Budgetänderung; keine zusätzliche Nutzerfreigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Einkaufsliste-Checks

- PR [#83](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/83) ist in den aktuellen Integrationsstand `main@eddbca9da1ee101b63aa382c0cf54d82fdd4fe99` gemergt.
- `shoppingChecks` werden vor dem Rendern auf aktuelle Einkaufslisten-IDs und ausschließlich den exakten Wert `true` bereinigt.
- Die Regressionstests decken Planwechsel, stabile manuelle IDs und ungültige Checkwerte ab; Root und `dist` bleiben bytegleich.
- Die PR-CI (Run [#42343682651](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42343682651)) war erfolgreich.
- Keine neue Datenstruktur, keine Supabase- oder Budgetänderung; keine zusätzliche Nutzerfreigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Backup-/Restore-Roundtrip

- PR [#85](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/85) ist in den aktuellen Integrationsstand `main@f61d83f6c33287086aa34834c2bb790a2ce32843` gemergt.
- Der kombinierte Regressionstest deckt Legacy-`manualShoppingItems` ohne IDs, fehlende Backup-Felder, Reload-Normalisierung mit Kollisionssuffixen, einen zweiten stabilen Reload sowie aktuelle `true`-, veraltete, `false`- und sonstige nicht-boolesche `shoppingChecks` ab.
- Die PR-CI (Run [#42344235081](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42344235081)) war erfolgreich.
- Keine Produktionsdatei, keine neue Datenstruktur, keine Supabase- oder Budgetänderung; keine zusätzliche Nutzerfreigabe erforderlich.
## Read-only-Supabase-Audit – 07.11.2026

- Das Projekt `Angebotskueche` mit der Projekt-Referenz `idcejbnkpeaaqchtkvkd` ist in `eu-central-1` aktiv und gesund (`ACTIVE_HEALTHY`) und läuft in der Organisation `FamSchicht` im Free-Tarif.
- `mein-geldplan` ist ein separates Supabase-Projekt mit eigener Projekt-Referenz und blieb unverändert. Die App-Quelle verweist ausschließlich auf die Angebotsküche-Projekt-URL; es wurden keine `service_role`- oder `sb_secret`-Schlüssel gefunden.
- RLS, die haushaltsbezogenen Policies, die Payload-Grenzen und der Compare-and-swap-Revisionsschutz wurden im Repository und remote read-only geprüft. Die drei `app_private`-Tabellen sind remote vorhanden, RLS ist aktiviert und die Tabellen waren zum Prüfzeitpunkt leer.
- Die vier eingecheckten Migrationen sind remote vorhanden. Es wurde keine Migration angewendet und keine Schreibaktion am Supabase-Projekt ausgeführt.
- Offene Freigabe bleibt ein echter Login-/E-Mail-Bestätigungs-/Redirect-End-to-End-Test mit einem vom Nutzer angelegten Testkonto. Es erfolgt keine automatische Kontenerstellung; Passwort, Einmalcode und Sitzungstoken gehören nicht in den Chat.
- Als spätere Produktentscheidungen bleiben eine Offline-Queue mit Konflikt-UX sowie der Einladungs- und Beitrittsablauf offen. Dieser Audit stellt dafür keine Freigabe dar.


## Nutzerentscheidung – Mahlzeitenumfang – 07.11.2026

- Der Nutzer hat klargestellt: kein Frühstücks-Slot; nur Mittagessen und bei Bedarf ein optionales Abendessen.
- Diese Entscheidung ersetzt die frühere offene Frühstücksfrage in Freigabepunkt 8. Sie ist keine Freigabe für Supabase-, Datenbank-, Kosten- oder Deployment-Änderungen.
- Für die technische Umsetzung wird als kleinster rückwärtskompatibler Umfang ein optionaler Abendessen-Slot je Planungstag angenommen. Bestehende Mittagessen-/manualPlan-Daten bleiben unverändert; alte Backups und Sync-Payloads ohne Abendessen bleiben gültig.

## Umgesetzt ohne zusätzliche Freigabe – additive Tagespersonenzahl – 08.11.2026

- `settings.dayPeople` speichert ausschließlich explizite Abweichungen vom globalen `peopleSelect`-Wert je nullbasiertem Planungstag. Nicht belegte Tage und alte Einstellungen ohne dieses Feld fallen auf den bisherigen globalen Default zurück.
- Mittagessen und optionales Abendessen eines Tages greifen auf denselben Tageswert zu. Einkaufsmengen, Packungsrundung und bekannte Angebotssummen verwenden die daraus summierten Portionsanteile; unbekannte Preise bleiben aus dem bekannten Angebotsbetrag ausgeschlossen.
- Root/`dist`, Backup-Export, lokaler Restore, bestätigter Cloud-Merge und Offline-App-Shell sind durch Regressionstests abgesichert. Es wurde keine Supabase-Migration angewendet und keine Supabase- oder Nutzerdatenänderung ausgeführt.
- Offen bleiben benannte Teilnehmer-/Kinderprofile, die echte Kassenhistorie aus Punkt 9, die späteren Sync-/Konfliktentscheidungen und kostenpflichtige Dienste.

## Nutzerentscheidung – Mittagessen und optionales Abendessen – 07.11.2026

- Es gibt keinen Frühstücks-Slot. Der bestehende Hauptgericht-Slot bleibt das Mittagessen.
- Pro Planungstag kann optional höchstens ein separates Abendessen hinterlegt werden; die neue Struktur `manualDinnerPlan` startet leer und verändert `manualPlan` nicht.
- `mealPurpose` wird für die automatische Slot-Auswahl explizit behandelt: `Hauptgericht` gehört zum Mittagessen, `Brotzeit` zum Abendessen, `Flexibel` ist für beide Slots zugelassen. `Frühstück`, `Snack` und `Getränk` werden in diesem Plan nicht automatisch eingeordnet; bestehende manuelle `manualPlan`-Zuordnungen bleiben unverändert.
- Alte Backups/Cloud-Payloads ohne `manualDinnerPlan` bleiben gültig. Es gibt keine Supabase-Schemaänderung, Migration, automatische Umklassifizierung oder Frühstücksänderung.


## Koordinierter Arbeitsstand – 07.11.2026, Dinner- und Payload-Härtung

- PR #92 ergänzt den optionalen Abendessen-Slot je Planungstag; manualDinnerPlan bleibt von manualPlan getrennt. Auswahl, Einkaufsliste, Teilen, Bewertungen und Backup/Restore berücksichtigen den Slot; CI war grün.
- PR #93 verhindert, dass dasselbe Rezept am selben Tag gleichzeitig als Mittag- und Abendessen erscheint oder doppelt in Kosten-/Einkaufsberechnungen eingeht. Stale Dinner-Zuordnungen werden ausgeblendet; CI war grün.
- PR #94 validiert manualDinnerPlan explizit als Objekt an den Supabase- und Worker/D1-Payload-Grenzen. Ungültige Arrays und null werden abgewiesen; Root-/dist-Artefakte und Regressionstests sind synchron. CI war nach Aktualisierung auf den aktuellen main grün.
- PRs #95 und #96 bereinigen widersprüchliche Frühstücksannahmen in docs/PRODUKTZIEL.md. Der bestätigte Umfang ist Mittagessen plus optionales Abendessen; der nächste fachliche Schritt ist der Kosten-/Kassenfluss.
- Keine Migration, keine Supabase-Datenänderung, keine automatische Kassenpreis-Erfassung und keine kostenpflichtige Ressource.


## Read-only-Kosten- und Einkaufslisten-Audit – 07.11.2026

- Die Kosten-/Einkaufslistenprüfung mit synthetischen Daten fand keinen reproduzierbaren Defekt. Mittagessen und aktivierte Abendessen werden in der Plankostensumme jeweils einmal berücksichtigt.
- Packungsrundung, Personenmultiplikator, Vorratsfilter, bekannte positive Angebotspreise sowie getrennte unbekannte/mehrdeutige Preise verhalten sich deterministisch. Fehlende Artikel bleiben außerhalb der Angebotssumme und erhalten keinen erfundenen Preis.
- Das Ergebnis ist weiterhin nur ein Angebots-Zwischenwert, kein vollständiger Kassenbetrag. Der reguläre Vergleich ist separat aus belegten Quellen umgesetzt; belastbare Vorratsmengen, bestätigte IST-Ausgaben und Fahrtkosten fehlen bewusst.
- Kein PR, keine Produktänderung und keine Supabase-/Datenbankaktion aus diesem Audit. Die nächste Umsetzung des tatsächlichen Einkaufs-/Kassenflusses bleibt Freigabepunkt 9.
## Read-only-PWA-/Offline-/Restore-Audit – 07.11.2026

- Der read-only Audit auf `main@d547ff89d2c3114324d808a61838df4cbc7b9fb7` fand keinen reproduzierbaren Datenverlust-, Offline- oder Restore-Defekt; es gibt keinen Produktcode- oder Datenänderungsbedarf.
- Root und `dist` bleiben bei `index.html`, `supabase-sync.js`, `sw.js`, Manifest und PWA-Icons bytegleich.
- Service-Worker-Verhalten, lokale Backup-/Restore-Pfade und alte v1-Payloads ohne `manualDinnerPlan` sind durch `automation/service-worker.test.mjs`, `automation/user-data-payload.test.mjs`, `automation/supabase-sync.test.mjs` und `automation/dinner-slot.test.mjs` abgedeckt.
- Der aktuelle CI-Lauf auf dem nachfolgenden `main@4bd8c8c2c26faa3821b0f3ca18d8f9a6e05e49cd` war grün: [Run #42375649128](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42375649128).
- Der Bytevergleich einer frisch erzeugten `dist/server/index.js` mit dem eingecheckten Artefakt zeigte einen nicht-funktionalen Drift, unter anderem `Abends optional` gegenüber `Abendessen optional`. Der Drift wird durch den CI-Schritt `Build worker bundle` erklärt, der das Worker-Artefakt vor Tests reproduzierbar neu erzeugt; es gibt keine Auswirkung auf PWA-, Offline- oder Restore-Daten.
- Keine Produktcode-, Supabase-, Datenbank- oder Kassenänderung.

## Koordinierter Arbeitsstand – 07.11.2026, Angebots-/Preis-Audit und Initialisierung

- Der read-only Angebots-/Preis-Audit bestätigt bei synthetischen Prüfwerten die centgenaue Berechnung bekannter positiver Angebotspreise. Die erforderliche Packungsanzahl wird deterministisch auf ganze Packungen aufgerundet; Personenmultiplikator, Vorratsabzug und Angebots-Zwischensumme bleiben getrennt nachvollziehbar.
- Unbekannte, negative oder mehrdeutige Preise werden nicht als 0 € oder als erfundene Ersparnis verwendet. Sie bleiben aus der belastbaren Angebotssumme heraus und werden in der Darstellung nicht als scheinbar gültiger Preis weiterverarbeitet. Der Audit fand keinen reproduzierbaren Defekt.
- [PR #101](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/101) behebt den Initialisierungsfehler, bei dem vor der ersten Planung noch keine aktuellen `generated/*-offers.json` geladen wurden. Auf GitHub Pages wird der aktuelle Snapshot nun vor der ersten Plan-/Kostendarstellung erzwungen geladen; `seedOffers` bleiben ausschließlich der klar abgegrenzte Offline-/Fallbackpfad.
- PR #101 wurde separat mit grüner CI geprüft. Diese Dokumentation ist eine eigenständige docs-only Änderung und führt keine Code-, Supabase-, Datenbank-, Kassen- oder Angebotsdatenänderung ein.

## Read-only-Audits – Accessibility, Mobile und Restore – 07.11.2026

- Der Accessibility-/Mobile-Audit auf `main@aa37a481e1e584b96631ed9d46aef34c5a0796a9` prüfte Planung, Angebote und Einkaufsliste statisch auf Tastaturbedienung, semantische Controls, mobile Breakpoints/Reflow sowie sichtbare Status- und Fehlermeldungen.
- Zentrale Aktionen verwenden echte `button`-, `select`- und `input`-Controls. Die mobile Darstellung besitzt Breakpoints bis 420 px; Navigation, Karten, Filter, Zusammenfassungen und Einkaufspositionen werden für schmale Ansichten umgebrochen bzw. gestapelt.
- PR [#103](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/103) behob den reproduzierbaren Accessibility-Fehler am globalen `#toast`: Die von Planung, Angeboten und Einkaufsliste verwendeten Erfolgs-/Fehlermeldungen besitzen nun `role="status"`, `aria-live="polite"` und `aria-atomic="true"`. Root und `dist` bleiben bytegleich; `automation/accessibility.test.mjs` sichert die Regression ab.
- Die Absicherung war statisch und regressionstest-basiert. Ein echter Geräte-, Tastatur- oder Screenreader-Laufzeittest wurde in diesem Audit nicht durchgeführt und bleibt eine spätere Qualitätssicherungsmaßnahme.
- Der Restore-/Altbestands-Audit fand keinen reproduzierbaren Defekt. Payload- und Settings-Validierung erfolgt vor lokalen `localStorage`-Mutationen; ältere Payloads und Einstellungen bleiben rückwärtskompatibel. Die Prüfungen decken außerdem Root-/`dist`-Gleichheit, Service-Worker-/Offline-Pfade, alte Payloads ohne `manualDinnerPlan` sowie den initialen Angebotsrefresh vor der ersten Plan-/Kostendarstellung ab.
- Relevante Absicherung: `automation/user-data-payload.test.mjs`, `automation/settings-restore.test.mjs`, `automation/supabase-sync.test.mjs`, `automation/service-worker.test.mjs`, `automation/dinner-slot.test.mjs`, `automation/offer-initial-refresh.test.mjs` und der vollständige CI-Workflow.
- Keine Code-, Supabase-, Datenbank-, Kassen-, Angebotsdaten- oder kostenpflichtige Ressourcenänderung aus diesem Dokumentationsschritt.

## Koordinierter Arbeitsstand – 07.11.2026, Sync-/Konflikt-Audit

- Der read-only Sync-/Konflikt-Audit auf `main@3ca5fdcc525258af0488c577734e0bd889274f1e` prüfte lokale Änderungen, Haushalt-/Revisionsmarker, Payload-Validierung, ältere Payloads und den Offline-Wiederanlauf. Es wurde kein Verlust lokaler App-Daten durch PR #105 festgestellt.
- [PR #105](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/105) behebt das lokale Session-Kontext-Overwrite-Risiko: Beim Sign-out oder Benutzerwechsel werden der aktive Haushaltsmarker und der lokale Revisionsmarker bereinigt; lokale App-Daten selbst bleiben erhalten. Die PR-CI war grün.
- Der Compare-and-Swap-Schutz bleibt unverändert: Revision 0 legt einen neuen Cloud-Stand an, spätere Speicherungen schreiben nur bei passender Revision; stale Writes werden abgewiesen. Die Owner-/Editor-Berechtigungsprüfung und RLS für die drei `app_private`-Tabellen sind aktiv. Die bestehenden Offline-/Restore-Regressionstests blieben unauffällig.
- **Offener Freigabepunkt – serverseitige Payload-Validierung:** `save_household_state_impl` prüft `recipeHistory` und `manualDinnerPlan` derzeit noch nicht vollständig entsprechend den Client-/Worker-Validatoren. Eine Angleichung würde eine Supabase-Migration erfordern. Bis zu einer ausdrücklichen Freigabe wird keine Migration und keine Supabase-Schreibänderung vorgenommen.
- Der read-only Security-Advisor hatte keine Findings; der Performance-Advisor meldete ausschließlich drei INFO-Hinweise zu bisher unbenutzten Indizes. Keine Kassen-/IST-Daten, keine erfundenen Angebote und keine kostenpflichtige Ressource wurden angelegt.


## Validierter Vertrag – manuelle Einkaufsvarianten – 07.11.2026

- Die CI-Prüfung des Einkaufslisten-Abgleichs bestätigt: Manuelle Singular-/Pluralvarianten bleiben von Rezeptzutaten getrennt. Das ist beabsichtigtes Verhalten für zusätzlich frei erfasste Artikel und darf nicht durch eine allgemeinere Zutaten-Normalisierung überschrieben werden.
- Ein darauf zielender Kandidat (PR #107) wurde wegen des bestehenden Regressionstests nicht gemergt. Die Prüfung war damit ein Audit des bestehenden Vertrags, keine Produktänderung.
- Exakte doppelte manuelle Artikel bleiben weiterhin durch den bestehenden Schlüsselabgleich begrenzt. Eine fachliche Zusammenführung semantisch ähnlicher manueller Varianten bleibt bis zu einer ausdrücklichen Produktentscheidung ausgeschlossen.


## Validierter Datenfluss – Demo-Angebote – 07.11.2026

- [PR #109](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/109) verhindert, dass die fest eingebauten `Demo-Import`-Beispiele als aktuelle Angebotsdaten in Planung, Marktanzahl, Highlights oder Angebotskosten einfließen.
- Die Offline-Beispiele bleiben für die Darstellung erhalten; verifizierte Händlerimporte und manuelle Nutzerimporte bleiben nutzbar. Ohne verifizierte Quelle weist die Oberfläche ausdrücklich darauf hin, dass keine Angebotsdaten für Planung oder Kosten verwendet werden.
- Die Regression-Suite prüft die Demo-Quellerkennung, die drei aktiven Filterpfade und die Bytegleichheit von `index.html` und `dist/index.html`. Keine Nutzerdaten, Supabase-Daten, Migrationen, Deployments oder kostenpflichtigen Ressourcen wurden verändert.


## Validierter Planbezug – Angebots-Evidenz – 07.11.2026

- [PR #111](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/111) verhindert, dass vorgegebene Rezeptgründe oder alte Textbausteine als aktueller Angebotsbeleg erscheinen, wenn kein verifiziertes Angebot gematcht wurde.
- Ein Plan-Eintrag erhält den Tag `Angebotsanker` nur bei mindestens einer tatsächlich gematchten Angebotszutat; sonst wird `Angebotsbezug offen` angezeigt. Preise und Angebotsquellen werden dadurch nicht ergänzt oder erfunden.
- Regressionstests prüfen den Textvertrag und die Bytegleichheit von `index.html` und `dist/index.html`. Keine Nutzerdaten, Supabase-Daten, Migrationen, Deployments oder kostenpflichtigen Ressourcen wurden verändert.


## Validierter Kostenfluss – Planansicht – 07.11.2026

- [PR #113](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/113) entfernt statische Rezeptkosten als Fallback aus der Planansicht. Ohne ausreichende verifizierte Angebotsbasis erscheinen `–` und `Preis unbekannt` statt eines erfundenen Betrags.
- Bekannte Angebots-Packungssummen werden als solche bezeichnet; der vollständige Kassenbetrag bleibt ausdrücklich offen. Bestehende Rezepte, lokale Daten und Einstellungen bleiben erhalten.
- Die Regression-Suite prüft den unbekannten Kostenpfad und die Bytegleichheit von `index.html` und `dist/index.html`. Keine Nutzerdaten, Supabase-Daten, Migrationen, Deployments oder kostenpflichtigen Ressourcen wurden verändert.


## Validierter Offline-Fallback – Planbezug – 07.11.2026

- [PR #116](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/116) neutralisiert den letzten statischen Plan-Fallback: Gerichtstitel und Zutaten bleiben als Offline-Hilfe erhalten, aber Markt, Kosten, Score und Angebotsanker werden ohne verifizierte Daten nicht behauptet.
- Regressionstests prüfen die Sanitization und die Bytegleichheit von `index.html` und `dist/index.html`. Keine Nutzerdaten, Supabase-Daten, Migrationen, Deployments oder kostenpflichtigen Ressourcen wurden verändert.


## Validierte Markttransparenz – 07.11.2026

- [PR #118](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/118) bezeichnet den aktuellen Markt-Mix korrekt als Auswahl mit Stopplimit. Die Oberfläche behauptet keine Routenoptimierung oder Fahrtkostenberechnung, solange dafür keine bestätigte Kostenbasis und Nutzerentscheidung vorliegen.
- Bestehende Markt- und Stoppeinstellungen bleiben unverändert; die Änderung betrifft ausschließlich die fachlich klare Beschriftung und Regressionstests.

## Validierter Kostenfluss – optionales Abendessen – 07.11.2026

- [PR #120](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/120) verhindert, dass ein unbekannter Preis im optionalen Abendessen als `0,00 €` erscheint.
- Bekannte Angebots-Packungssummen bleiben als Näherungswert sichtbar; unbekannte Abendessenpreise werden ausdrücklich als `Preis unbekannt` markiert. Es werden keine regulären Preise, Kassenbeträge oder Fahrtkosten ergänzt.
- Root und `dist` bleiben synchron; die CI war nach Ergänzung der isolierten Dinner-Test-Hilfen grün. Keine Nutzerdaten, Supabase-Migration, Datenbankänderung, Angebotsdatenänderung, Deployment- oder kostenpflichtige Ressourcenänderung.

## Validierter Kostenfluss – Rezeptdetails und Vorschläge – 07.11.2026

- [PR #122](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/122) entfernt statische Rezeptkosten als Ersatz für fehlende Angebotsnachweise aus Vorschlagskarten, Rezeptdetails und der Match-Kostenschätzung.
- Ohne mindestens ein verifiziertes, plausibles Angebot erscheint `Preis unbekannt`; bekannte Angebots-Packungssummen bleiben davon getrennt. Es werden keine regulären Preise oder Kassenbeträge erfunden.
- Regressionstest und Root-/`dist`-Synchronität sind durch die grüne CI abgesichert. Keine Nutzerdaten, Supabase-Migration, Datenbankänderung, Angebotsdatenänderung, Deployment- oder kostenpflichtige Ressourcenänderung.

## Validierter Kostenfluss – Initialzustand der Einkaufsliste – 07.11.2026

- [PR #124](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/124) ersetzt den statischen Initialwert `0,00 €` durch `–` und `Noch keine verifizierte Preisbasis`, bevor die Einkaufsliste gerendert wurde.
- Nach dem Rendern gelten weiterhin nur bekannte Angebots-Packungssummen; unbekannte Preise, fehlende Artikel, Vorräte und Kassenbeträge werden nicht geschätzt.
- Regressionstest, Root-/`dist`-Synchronität und CI sind grün. Keine Nutzerdaten, Supabase-Migration, Datenbankänderung, Angebotsdatenänderung, Deployment- oder kostenpflichtige Ressourcenänderung.

## Validierter Angebotsimport – Gültigkeitsdatum – 07.11.2026

- [PR #126](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/126) weist manuelle Angebotszeilen ohne ausdrücklich übergebenes Gültigkeitsdatum zurück; ein pauschales Angebotsende wird nicht mehr erzeugt.
- Das bestehende sechsteilige Legacy-Format mit Datum bleibt gültig. Bereits gespeicherte manuelle Angebote werden nicht verändert.
- Regressionstest und Root-/`dist`-Synchronität sind durch grüne CI abgesichert. Keine Nutzerdaten, Supabase-Migration, Datenbankänderung, Deployment- oder kostenpflichtige Ressourcenänderung.

## Validierter Angebotsbestand – gespeicherte Datumsunsicherheit – 07.11.2026

- [PR #128](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/128) trennt Demo-Fallback-Daten von gespeicherten manuellen Nutzerimporten.
- Nur Demo-Angebote erhalten den Offline-Default; gespeicherte Importe ohne `validUntil` behalten ein leeres/unsicheres Datum und werden nicht als aktuell gültige Angebote verwendet. Explizite gespeicherte Datumsangaben bleiben erhalten.
- Regressionstest, Root-/`dist`-Synchronität und grüne CI sichern den Vertrag. Keine Nutzerdatenlöschung, Supabase-Migration, Datenbankänderung, Deployment- oder kostenpflichtige Ressourcenänderung.

## Validierter Angebotsabruf – Worker-Gültigkeit – 07.11.2026

- [PR #130](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/130) entfernt pauschale `heute + 7 Tage`-Gültigkeiten aus den Worker-Adaptern für Kaufland, EDEKA, Aldi, Netto und Lidl.
- Ein Live-Abruf ohne eindeutig belegtes Angebotsende wird mit `422` abgewiesen; Quellen mit explizitem Datum bleiben nutzbar. Die vorhandene Worker-Validierung enthält dafür Erfolgs- und Negativfälle.
- Worker-Quelle und generiertes `dist/server/index.js` sind synchronisiert; CI war grün und der Deployment-Job blieb übersprungen. Keine Supabase-, Datenbank-, Nutzerdaten- oder kostenpflichtige Ressourcenänderung.

## Validierter Angebotsabruf – Worker-Preisfelder – 07.11.2026

- [PR #132](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/132) akzeptiert im Lidl-Worker nur Preisfelder mit einem expliziten Eurobetrag.
- Lebensmittelangebote ohne belastbaren Preis werden verworfen; bekannte Preise bleiben unverändert, und es werden keine Beträge aus unklaren Rohtexten erzeugt.
- Worker-Quelle, generiertes Artefakt und Validierungsfixture sind synchronisiert; CI war grün, ohne Deployment oder kostenpflichtige Ressourcenänderung.

## Validierter Angebotsabruf – Worker-Preis-Sicherheit – 07.11.2026

- [PR #133](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/133) dokumentiert die verschärfte Preisprüfung für Worker-Angebotssnapshots.
- Unklare Rohtexte und fehlende explizite Eurobeträge werden nicht als belastbare Angebotspreise veröffentlicht; CI war grün. Keine Supabase-, Datenbank-, Nutzerdaten-, Deployment- oder kostenpflichtige Ressourcenänderung.

## Sichtbarer Planumfang – Mittagessen und optionales Abendessen – 07.11.2026

- [PR #134](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/134) bezeichnet den bestehenden Hauptgericht-Slot im Wochenplan und in der Rezeptdetailansicht eindeutig als „Mittagessen“.
- Frühstück, Snack und Getränk bleiben außerhalb der automatischen Planung; der optionale Abendessen-Slot bleibt unverändert. Root- und `dist`-Artefakt wurden synchron aktualisiert; CI war grün.
- Keine Umklassifizierung bestehender Rezepte, keine Nutzerdatenänderung, keine Supabase-Migration, Datenbankänderung, Deployment- oder kostenpflichtige Ressourcenänderung.

## Transparenter Kostenstatus beim Teilen – 07.11.2026

- [PR #136](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/136) ergänzt in der geteilten offenen Einkaufsliste den bekannten Angebotsbetrag, die Anzahl unbekannter Preise und den Hinweis „Kassenbetrag offen“.
- Fehlende Artikel und Vorräte werden im Share-Text ausdrücklich als nicht enthalten abgegrenzt; die bestehende centgenaue Berechnung und die lokalen Einkaufsdaten bleiben unverändert.
- Root-/`dist`-Synchronität und Regressionstest sind durch grüne CI abgesichert. Keine Supabase-, Datenbank-, Angebotsdaten-, Deployment- oder kostenpflichtige Ressourcenänderung.

## Mengensteuerung für manuelle Einkaufsartikel – 07.11.2026

- [PR #138](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/138) ergänzt für manuelle Zusatzartikel eine optionale Packungszahl von 1 bis 99.
- Alte lokale Einträge, ältere Backups und nicht vor-normalisierte Cloud-Payloads bleiben gültig und erhalten deterministisch die Standardmenge 1; die Menge wird in Einkaufsliste, Kosten-Zwischensumme und Teilen berücksichtigt.
- Regressionstests und Root-/`dist`-Synchronität sind durch grüne CI (148/148 Tests) abgesichert. Keine Preis-Erfindung, Supabase-, Datenbank-, Migrations-, Nutzer- oder Deploymentänderung.

## Vorbereiteter IST-Budget-Kern – 07.11.2026

- [PR #142](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/142) ergänzt einen rein lokalen und deterministischen Validator/Summarizer für das bereits dokumentierte Format `purchaseRecords`.
- Der Kern prüft Datum/Monat, Centbeträge, manuelle Quelle und eindeutige IDs und summiert nur übergebene Datensätze des angeforderten Monats gegen das dokumentierte Ziel von 40.000 Cent.
- Es gibt weiterhin keine Speicherung, UI-Integration, Beleg-/OCR-Verarbeitung, Haushaltshistorie, Supabase-/Datenbankänderung oder echten Einkaufsdatensatz. Die produktive IST-Erfassung bleibt Freigabepunkt 9.

## Koordinierter Arbeitsstand – 07.11.2026, transparenter Vorratsabgleich

- PR [#158](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/158) ergänzt in der Einkaufsliste neben der Trefferanzahl bis zu vier konkret berücksichtigte Vorratszutaten und weist weitere Treffer nur als Anzahl aus.
- Die Anzeige nutzt ausschließlich den bestehenden lokalen Plan-/Vorratsabgleich. Vorratsmengen, Haltbarkeiten, Verbrauchsannahmen, Preise, Angebots-Zwischensummen, Backup-, Sync- und Supabase-Daten bleiben unverändert.
- Regressionstest, Root-/`dist`-Synchronität und CI waren grün; der Merge nach `main@9c8b0934a3964341a19c7f8eb4088271c13b4b35` wurde anschließend erfolgreich auf GitHub Pages veröffentlicht. Keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, barrierefreier Vorratsstatus

- PR [#160](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/160) markiert die dynamische Vorratsdetailzeile als zugänglichen Status mit `aria-live="polite"` und `aria-atomic="true"`.
- Root und `dist` sind bytegleich; die Regressionstest- und PR-CI-Prüfung war grün. Der Merge nach `main@8ab3281de64262f7ee680abee9327633619f2f5b` wurde erfolgreich auf GitHub Pages veröffentlicht.
- Keine Produkt-, Mengen-, Preis-, Nutzer-, Sync-, Supabase- oder Datenbankänderung; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, eindeutiger Vorratsabgleich

- PR [#162](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/162) korrigiert die doppelte Zählung derselben Vorratszutat in mehreren Gerichten und in zulässigen Singular-/Pluralvarianten.
- Der zuerst sichtbare Name bleibt erhalten; eine Identität gilt als vorhanden, sobald eine ihrer Varianten im Bestand erkannt wird. Es werden keine Mengen, Haltbarkeiten, Preise oder Verbrauchsannahmen ergänzt.
- Root und `dist` sind bytegleich. Der initiale CI-Lauf wurde wegen doppelt escapeter Regex-Backslashes nicht gemergt; nach Korrektur war CI vollständig grün und GitHub Pages erfolgreich.
- Keine Nutzer-, Backup-, Sync-, Supabase-, Datenbank- oder Angebotsdatenänderung; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, gemeinsame Zutaten-Normalisierung

- PR [#164](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/164) bündelt den Identitätsvertrag für Zutaten in `ingredient-normalization.js` und verwendet ihn in App sowie Vorrats-/Kostenmodell.
- Der Fix verhindert, dass Normalisierungsregeln an zwei Stellen auseinanderlaufen. Ein isolierter Fallback bleibt für alte oder unvollständig geladene Clients bestehen.
- PR-CI, Root-Synchronisierung und GitHub-Pages-Deployment waren erfolgreich. Keine Nutzer-, Plan-, Mengen-, Preis-, Angebots-, Supabase- oder Datenbankänderung; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Offline-Erststart

- PR [#166](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/166) precacht `ingredient-normalization.js`, `shopping-costs.js` und `meal-planning.js` gemeinsam mit der App-Shell.
- Der Cache-Marker wurde von v28 auf v29 erhöht; Root und `dist` sind synchron. Der erste CI-Lauf erkannte korrekt den noch alten Worker-Versionsassert, der vor dem Merge auf v29 aktualisiert wurde.
- CI, Root-Synchronisierung und GitHub-Pages-Deployment waren anschließend erfolgreich. Keine Nutzer-, Supabase-, Angebots- oder Datenbankänderung; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, konsistente Vorratseingabe

- PR-Vorbereitung: Die Vorratseingabe verwendet den gemeinsamen Zutaten-Identitätsvertrag; `Tomate` und `Tomaten` werden beim erneuten Hinzufügen als bereits vorhanden erkannt.
- Der zuerst gespeicherte Anzeigename und alle bestehenden Vorratsdaten bleiben erhalten; nur neue Eingaben werden konservativ geprüft. Leere Identitäten werden verworfen.
- Die Änderung betrifft keine Mengen-, Haltbarkeits-, Preis-, Plan-, Backup-, Sync-, Supabase- oder Angebotsdaten und benötigt keine zusätzliche Freigabe.

## Koordinierter Arbeitsstand – 07.11.2026, zugängliche Eingaberückmeldungen

- PR-Vorbereitung: `pantryStatus` und `shoppingItemStatus` werden als `status` mit höflicher Live-Region ausgezeichnet.
- Die Regressionstests prüfen Root-/`dist`-Synchronität und beide Statusfelder. Keine Nutzer-, Mengen-, Preis-, Plan-, Backup-, Sync-, Supabase- oder Angebotsdatenänderung; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, Offline-Shell-Vertrag

- PR-Vorbereitung: Der Service-Worker-Test erkennt lokale `index.html`-Scriptquellen automatisch und verlangt ihre Aufnahme in `APP_SHELL`.
- Die Absicherung ändert keine Laufzeit- oder Nutzerdaten, sondern verhindert Regressionen bei künftigen Offline-Erweiterungen; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, stabile manuelle Einkaufsartikel

- PR-Vorbereitung: Die Normalisierung manueller Einkaufsartikel repariert doppelte explizite IDs deterministisch und erhält alle Einträge.
- Dadurch bleiben `shoppingChecks` und Entfernen-Aktionen pro Artikel eindeutig. Mengen, Preise, Plan-, Backup-, Sync-, Supabase- und Angebotsdaten werden nicht verändert; keine zusätzliche Freigabe erforderlich.


## Koordinierter Arbeitsstand – 07.11.2026, Service-Worker-Versionskopplung

- [PR #172](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/172) gleicht die Registrierungskennung `sw.js?v=29` an den aktiven App-Shell-Cache `angebotskueche-shell-v29` an.
- Der Regressionstest prüft diese Kopplung künftig automatisch; Root und `dist` sind bytegleich.
- Keine Nutzerdaten, Plan-, Preis-, Angebots-, Backup-, Sync-, Supabase- oder Datenbankänderung; keine zusätzliche Freigabe erforderlich.


## Koordinierter Arbeitsstand – 07.11.2026, Lidl-Gültigkeit über Jahreswechsel

- [PR #173](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/173) korrigiert die Ableitung des Angebotsendes bei ausdrücklich angegebenen Spannen wie „28.12. bis 03.01.“; das fehlende Endjahr wird als Folgejahr behandelt.
- Der Fix betrifft ausschließlich Parserlogik und Regressionstests. Keine Live-Angebotsdaten, Nutzerdaten, Supabase-, Datenbank- oder Deploymentänderung; keine zusätzliche Freigabe erforderlich.

## Koordinierter Arbeitsstand – 07.11.2026, KaufDA-Gültigkeit über Jahreswechsel

- Der KaufDA-Importer berücksichtigt bei einem quellenbelegten Enddatum ohne Jahr im Dezember das Folgejahr; ein sicherer synthetischer Regressionstest schützt den Fall.
- Keine Live-Angebotsdaten, Nutzerdaten, Supabase-, Datenbank- oder Deploymentänderung; keine zusätzliche Freigabe erforderlich.


## Koordinierter Arbeitsstand – 07.11.2026, Angebotsauswahl-Parität

- Der Plan-Matcher und die Einkaufsliste verwenden denselben deterministischen Angebotskandidaten; dadurch können Marktpräferenz und Planpreis nicht mehr für dieselbe Zutat auseinanderlaufen.
- Regressionstests decken den kombinierten Mittagessen-/optionalen-Abendessen-Fluss und die Kostenparität ab. Keine IST-/Beleg-/OCR-, Supabase-, Datenbank- oder Angebotsdatenänderung; keine zusätzliche Freigabe erforderlich.


## Koordinierter Arbeitsstand – 07.11.2026, Packungskosten-Parität

- Neuer separater Befund: Die alte Plan-Gesamtsumme skalierte bekannte Rezeptpreise mit \`Personen / 2\`, während die Einkaufsliste Verkaufspackungen aufrundet. Das ist bei drei Personen nicht dieselbe Kaufsumme.
- Vorgesehener Fix: Plan-Gesamtsumme aus der nicht-manuellen Einkaufsliste und dem bestehenden Kostenmodell ableiten; Regressionstest für Mittagessen plus optionales Abendessen. Keine zusätzliche Freigabe für den risikoarmen, deterministischen Fix erforderlich; Merge erst nach grüner CI.

## Koordinierter Arbeitsstand – 07.11.2026, Mahlzeiten-Slot-Schutz

- Der Wochenplan weist manuelle Zuordnungen für Frühstück, Snack und Getränk nun zurück und ignoriert entsprechende alte Zuordnungen beim Wiederaufbau; Mittagessen und optionales Abendessen bleiben unverändert.
- Regressionstests sichern die UI-Zuordnung und die lunch-only-Wiederherstellung. Keine Nutzerdaten, Supabase-, Datenbank- oder Deploymentänderung; PR #177 wurde nach grüner CI gemerged.

## Fortschritt 07.11.2026 – sichere Budget-Centwerte

- Der vorbereitete `purchaseRecords`-Validator akzeptiert nur nichtnegative sichere Ganzzahlen als Centbeträge. Dadurch bleiben Summen oberhalb der JavaScript-Präzisionsgrenze nicht stillschweigend ungenau.
- Gültige Budgetwerte, die noch nicht produktiv gespeichert oder angezeigt werden, bleiben unverändert. Es wurden keine IST-, Nutzer-, Supabase- oder Datenbankdaten geändert.

## Fortschritt 07.11.2026 – sofort angewendetes Marktlimit

- Beim Ändern des Marktlimits werden die Einstellungen vor der Planneuberechnung gespeichert. Dadurch verwendet der aktuelle Plan sofort dieselbe Stopplimit-Einstellung wie die Marktansicht.
- Dies ist keine Routen-, Fahrtkosten- oder Ersparnisoptimierung; automatische Mehrstopp-Empfehlungen bleiben bis zur fachlichen Freigabe deaktiviert. Keine Nutz-, Angebots-, Supabase- oder Datenbankdaten wurden geändert.


## Koordinierter Arbeitsstand – 07.11.2026, Snapshot- und Marktlimit-Stabilität

- [PR #182](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/182) begrenzt Einzelangebots-Gültigkeiten auf das Ende des Gesamtsnapshots und schützt den Randfall synthetisch. Nach grüner CI gemerged; keine Angebotsdaten, Supabase- oder Datenbankänderung.
- [PR #183](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/183) speichert das neue Marktlimit vor der Planneuberechnung, damit Marktansicht und Plan dieselbe Stopplimit-Einstellung verwenden. Nach grüner CI gemerged; Fahrtkosten- und Ersparnisoptimierung bleiben ausdrücklich offen.
- Die dokumentierten Freigabepunkte für tatsächliche Einkäufe, Fahrtkosten, Routing und Supabase-Migrationen bleiben unverändert und wurden nicht freigegeben.

## Fortschritt 07.11.2026 – sichere Budget-Monatssumme

- Der vorbereitete `purchaseRecords`-Summarizer bricht jetzt ab, wenn die Summe gültiger Centwerte nicht mehr sicher als JavaScript-Ganzzahl darstellbar ist. Einzelwerte waren bereits auf sichere Centzahlen begrenzt; die Aggregatsumme ist nun ebenfalls deterministisch geschützt.
- Die produktive IST-Erfassung bleibt weiterhin nicht integriert. Keine Nutzer-, Angebots-, Supabase- oder Datenbankdaten wurden geändert.


## Koordinierter Arbeitsstand – 07.11.2026, Budgetaggregation und Quellstatus

- [PR #185](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/185) schützt die Monatsaggregation gültiger Centwerte vor unsicherer JavaScript-Ganzzahldarstellung. Die produktive IST-Erfassung bleibt ausdrücklich offen; nach grüner CI gemerged.
- [PR #186](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/186) bewahrt bei fehlgeschlagenem Angebotsrefresh den letzten Datenstand samt Quellzeitpunkt, Gültigkeit und vorhandenen Ladezielmetadaten sichtbar. Unbekannte Sollzahlen bleiben unbekannt; nach grüner CI gemerged.
- Keine Nutzer-, Angebots-, Supabase- oder Datenbankdaten wurden geändert.

## Koordinierter Arbeitsstand – 07.11.2026, Snapshot-Quellenlink

- [PR #188](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/188) verlinkt bei validierten Snapshot-Metadaten die tatsächlich geladene sichere HTTPS-`sourceUrl`; alte Statusstände ohne diese Angabe nutzen weiterhin den statischen Fallback.
- Regressionstest, Root-/`dist`-Synchronität und CI waren grün; PR #188 ist gemerged. Keine neuen Angebotsdaten, keine Supabase- oder Datenbankänderung.

## Koordinierter Arbeitsstand – 07.11.2026, atomarer lokaler Import

- [PR #190](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/190) schützt Backup-/Cloud-Importe vor Teilüberschreibung bei einem späteren lokalen Schreibfehler durch gemeinsamen Schreibvorgang und best-effort Rollback.
- Regressionstest und CI waren grün; keine Migration, keine Supabase-/Datenbankänderung und keine neuen Kosten.

## Koordinierter Arbeitsstand – 07.11.2026, Offline-Angebotsfallback

- [PR #192](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/192) markiert einen aus dem Service-Worker-Cache gelieferten Angebots-Snapshot ausdrücklich als Offline-Fallback. Die App behandelt ihn nicht als frischen Abruf, behält den bisherigen Angebotsstand und zeigt den Offline-/Fehlerpfad.
- Regressionstest, Root-/dist-Synchronität und PR-CI waren grün; PR #192 ist gemerged. Keine neuen Angebotsdaten, keine Supabase-/Datenbankänderung und keine neuen Kosten.


## Koordinierter Arbeitsstand – 07.11.2026, PWA-Shell und Abendessen-Restelogik

- [PR #195](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/195) verhindert, dass ein APP_BUILD-Wechsel den aktiven Offline-Shell-Cache vor erfolgreicher Service-Worker-Aktivierung löscht. CI war grün; keine Nutzer-, Supabase- oder Angebotsdatenänderung.
- [PR #196](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/196) wertet optionale Abendessen gemeinsam mit Mittagessen in der bestehenden Restelogik aus. Der vollständige Validate-Lauf war nach Anpassung der bestehenden Regressionstests grün; Root/dist bleiben synchron. Kein Frühstücks-Slot, keine neue Mengenarchitektur, keine Migration und keine Supabase-/Nutzerdatenänderung.


## Fortschritt 07.11.2026 – ISO-Gültigkeitsdaten

- [PR #198](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/198) gleicht den App-Parser mit dem Snapshot-Vertrag ab: `TT.MM.JJJJ` und `JJJJ-MM-TT` werden strikt kalendergültig ausgewertet; unmögliche oder unbekannte Daten bleiben ungültig bzw. unbekannt. Validate war grün. Keine neuen Angebotsdaten, keine Supabase-/Datenbankänderung und keine Migration.


## Fortschritt 07.11.2026 – Erhalt persönlicher Settings

- [PR #200](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/200) bewahrt unbekannte bzw. persönliche Legacy-Settings beim Speichern, während bekannte Einstellungen wie bisher aktualisiert werden. Der fokussierte Regressionstest, Build, Validator und die Vollsuite (194/194) waren grün.
- Der ergänzte Zeilenenden-Ausgleich betrifft ausschließlich den bestehenden Test-Harness; keine Migration, keine Supabase-/Nutzerdatenänderung und keine neuen Kosten.

## Fortschritt 08.11.2026 – Erhalt unbekannter Settings im Backup- und Cloud-Load

- [PR #202](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/202) stellt sicher, dass unbekannte bzw. persönliche Settings im Backup-Export und beim bestätigten Cloud-/Supabase-Load mit `mergeSettings: true` erhalten bleiben; bekannte Einstellungen werden weiterhin aktualisiert.
- Der PR änderte ausschließlich die Testdatei. Der fokussierte Teststand (11/11), Build, Validator, die Vollsuite (195/195) und CI-Validate waren grün.
- Kein Supabase-Schema-, Daten- oder Migrationsschritt.

## Fortschritt 08.11.2026 – Auth-Session-Fehlerpfad

- [PR #204](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/204) führt einen tri-state Supabase-Sessionstatus (`true`/`false`/`null`) ein. Spätere `getSession()`-Fehler öffnen keinen Login-/Settings-Dialog und nutzen keinen D1-Fallback.
- Regressionstests für SDK-/UI-Pfade und die CI-Validierung waren grün. Es gab keinen Supabase-Projekt-, Schema-, Daten-, Auth-Konfigurations-, Redirect- oder Deployment-Schritt.
- Der echte Auth-/E-Mail-Bestätigungs-E2E-Test bleibt offen und benötigt weiterhin ein vom Nutzer angelegtes Testkonto.

## Fortschritt 08.11.2026 – additive Rezeptmengen ohne neue Freigabe

- [PR #212](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/212) setzt den risikoarmen Mengenblock ohne neue Nutzerentscheidung um: Eindeutige g/kg, ml/l, Stück und klare Multipacks werden deterministisch auf kompatible Angebots-Packungen abgebildet.
- Unklare, inkompatible oder textliche Angaben bleiben im bestehenden Legacy-Fallback. Manuelle Einkaufsartikel, bestehende Nutzdatenformate, Backups und Synchronisationsdaten werden nicht umgeschrieben.
- Offen und ausdrücklich nicht Bestandteil dieses Blocks bleiben echte Kassenhistorie, Supabase-Schema oder Supabase-Datenänderungen sowie kostenpflichtige Dienste. Es wurden keine solchen Ressourcen erstellt oder verändert.

## Fortschritt 08.11.2026 – additive lokale Vorratsmengen

- Der neue lokale Zusatzschlüssel `angebotskueche.pantryQuantities` ergänzt die unveränderte Legacy-Stringliste `angebotskueche.pantry` um positive, normalisierte Mengen in g/kg, ml/l oder Stück. Fehlende oder unklare Mengen bleiben ausdrücklich unbekannt.
- Der Zusatzschlüssel wird in diesem Block nicht in Backup-/Cloud-Payloads aufgenommen und nicht nach Supabase synchronisiert. Alte Backups, Cloud-Stände und persönliche Einstellungen bleiben deshalb auf ihrer bisherigen Datenform und weiterhin ladbar.
- Einkaufsliste, Packungs- und Kostenberechnung verbrauchen diese Vorratsmengen noch nicht. Ohne explizite Rezeptmengen-/Verbrauchsentscheidung würde eine Teilabziehung falsche Einkaufs- oder Preiswerte erzeugen.
- Keine Supabase-Migration, keine Cloud-/Nutzdatenänderung, kein Deployment und keine kostenpflichtige Ressource.

### Bündelbare Nutzerentscheidungen für den nächsten Vorratsblock

- Sollen lokale Vorratsmengen künftig in Backups und im gemeinsamen Supabase-Haushalt synchronisiert werden?
- Wie sollen Verbrauch, Teilbestände, Nullbestand und Konflikte zwischen Geräten fachlich behandelt werden?
- Welche Einheiten und Umrechnungen sind für Einkauf, Packungszahl und Kosten verbindlich freigegeben?

## Fortschritt 08.11.2026 – kanonischer Kostenvertrag ohne neue Freigabe

- Der bekannte Angebots-Teilbetrag wird im Plan jetzt aus derselben vollständigen Einkaufsliste wie in der Einkaufsliste und beim Teilen gebildet. Unbekannte Angebotspreise und fehlende Artikel bleiben separat; manuelle Artikel ohne Angebotsanker sind ausdrücklich sichtbar.
- Dies ist eine lokale, deterministische und rückwärtskompatible Darstellungskorrektur. Es wurden keine tatsächlichen Einkäufe, `purchaseRecords`, Vorratsmengenverbräuche, Supabase-/Cloud-Daten, Schemaänderungen, Angebotsdaten oder kostenpflichtigen Ressourcen verändert.
- Für diesen Block ist keine neue Nutzerfreigabe erforderlich. Weiterhin gebündelt offen bleiben die fachliche Freigabe für echte IST-Kassenhistorie, Vorratsmengenverbrauch/-synchronisierung, Fahrtkosten/Routing sowie weitere Supabase-Migrationen oder neue Cloud-Felder.

## Fortschritt 08.11.2026 – Budgettransparenz ohne neue Freigabe

- Die lokale Planansicht ergänzt eine klar getrennte 400-€-Monatszielanzeige, den bekannten Plan-/Angebotswert und „Tatsächliche IST-Ausgaben · Noch nicht erfasst“.
- Keine neue fachliche Freigabe ist für diese Anzeige erforderlich. Der bekannte Plan-/Angebotswert darf nicht als Kassenbetrag, bestätigte Ausgabe oder Restbudget interpretiert werden.
- Weiterhin gebündelt offen bleiben echte IST-Kassenhistorie und Belege/OCR, Vorratsmengenverbrauch/-synchronisierung, Fahrtkosten/Routing sowie weitere Supabase-Migrationen oder neue Cloud-Felder.
- Dieser Block änderte keine `purchaseRecords`, keine Supabase-/Cloud-/Schema-Daten, keine Angebotsdaten und keine kostenpflichtigen Ressourcen. Die CI/Vollsuite und Worker-Validierung waren lokal grün; der PR wird zur Prüfung erstellt und nicht automatisch gemergt.

## Fortschritt 08.11.2026 – Regressionstest für taggenaue Abendessenmengen

- Der Testblock prüft den bestehenden lokalen Pfad von Wochenplanung über Mengen-/Packungsberechnung bis zur Angebotssumme mit einem optionalen Abendessen an einem späteren Tag und einer abweichenden Tagespersonenzahl.
- Es handelt sich um eine additive Test- und Dokumentationsänderung. Keine neue Freigabe ist erforderlich; es wurden keine Preise oder Angebotsdaten erfunden und keine Vorrats-, Supabase-, Cloud-, Schema- oder Deploymentänderung vorgenommen.

## Fortschritt 08.11.2026 – isolierte Service-Worker-Cache-Bereinigung

- Der Service Worker löscht bei der Aktivierung nur noch veraltete `angebotskueche-shell-*`-Caches. Ein Regressionstest stellt sicher, dass fremde Origin-Caches erhalten bleiben.
- Dies ist eine lokale, deterministische PWA-Korrektur mit synchronisiertem Root-/`dist`-/Worker-Artefakt. Keine Nutz-, Angebots-, Supabase-, Cloud-, Schema- oder Deploymentänderung; keine neue Nutzerfreigabe erforderlich. Der PR wird zur Prüfung erstellt und nicht automatisch gemergt.

## Fortschritt 08.11.2026 – dokumentierter PWA-Merge und korrigierte PR-Übergabe

- Der Cache-Scope-Fix ist mit [PR #220](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/220) in `main` gemergt; die CI-Validierung war grün. Für diesen deterministischen, datenschonenden Fix ist keine weitere fachliche Freigabe offen.
- PR #218 wurde als verworfener, fehlerhafter API-Dateiupload geschlossen und durch PR #220 ersetzt. Der Ersatz-PR wurde mit exakt drei erwarteten PWA-Dateien, bytegenauem Remote-Abgleich und erfolgreicher CI erstellt und anschließend gemergt.
- Keine Nutz-, Angebots-, Supabase-, Cloud-, Schema- oder Deploymentänderung. Weiterhin separat freigabepflichtig bleiben fachliche Vorrats-/IST-/Routing-/Supabase-Schritte.

## Fortschritt 08.11.2026 – Regressionstest für den generierten Worker

- `scripts/validate-worker.mjs` prüft zusätzlich den Cache-Namensraum im eingebetteten `dist/server/index.js`; ein künftiger Build kann den PWA-Scope-Fix dadurch nicht unbemerkt verlieren.
- Es handelt sich ausschließlich um eine additive Validatorprüfung. Keine neue Nutzerfreigabe erforderlich; keine Nutz-, Angebots-, Supabase-, Cloud-, Schema- oder Deploymentänderung.

## Fortschritt 08.11.2026 – vollständige Pages-Icon-Synchronisierung

- Der Root-Synchronisierungsworkflow entfernt vor dem Kopieren nur den ausdrücklich generierten Root-Ordner `icons` und spiegelt danach `dist/icons`. Ein Regressionstest schützt diesen Synchronitätsvertrag.
- Dies ist eine deterministische CI-/PWA-Stabilitätskorrektur ohne neue Nutzerfreigabe. Keine Nutz-, Angebots-, Supabase-, Cloud-, Schema- oder Deploymentänderung.

## Audit 08.11.2026 – Offline-/Auth-Fehlerpfade ohne Freigabebedarf

- Supabase-Initialisierungsfehler und fehlgeschlagene Session-Abfragen stoppen den Cloudpfad nachvollziehbar, öffnen auf GitHub Pages keinen Login-Dialog und verändern keine lokalen Einstellungen, Vorräte, Wochenplan-, Einkaufscheck- oder manuellen Artikel-Daten.
- Der Audit fand keinen reproduzierbaren Laufzeitfehler. Fokustests (28/28), Vollsuite (227/227), Worker-Validator und Diff-Check waren grün. Es wurde keine neue Freigabe benötigt; echte Auth-/E-Mail-E2E-Prüfung mit einem Nutzerkonto bleibt der bekannte separate Prüfpunkt.

## Audit 08.11.2026 – Wochenplan bis bekannte Angebotssumme ohne neue Freigabe

- Der lokale Konsistenzpfad von Wochenplan über optionale Abendessen, Tagespersonenzahl, Mengen-/Packungsberechnung und Vorratsabgleich bis zur bekannten Angebotssumme wurde geprüft. Die Testfälle decken Mittagessen plus optionales Abendessen an einem späteren Tag, abweichende Tagespersonenzahlen, gemeinsame Zutaten, Pantry-Coverage und unbekannte Preise ab.
- Es werden keine unbekannten Preise oder Mengen als `0` bzw. als erfundene Werte verwendet. Bekannte Angebotspositionen, unbekannte Angebotspreise und fehlende Angebotsanker bleiben im Kostenvertrag getrennt. Der bekannte Teilbetrag basiert auf der vollständigen Einkaufsliste; der echte Kassenbetrag bleibt offen.
- Fokustests (39/39), einschließlich Plan-/Einkaufskostenparität, Angebotsauswahl, taggenauer Mengen, Abendessen-, Restelogik-, Vorrats- und Kostenprüfungen, waren grün. Root und `dist` sind bytegleich; die anschließende Vollsuite, der Worker-Validator und der Diff-Check sind für den Doku-PR auszuführen.
- Es wurde kein reproduzierbarer Defekt gefunden; daher keine Laufzeitänderung und keine neue Nutzerfreigabe. Nicht Bestandteil dieses Audits sind Markt-/Routing-Architektur, echte Angebotsdaten, Vorratsverbrauch/-synchronisierung, Supabase-Schema/-Daten, IST-Kassenhistorie und kostenpflichtige Ressourcen.

## Fortschritt 08.11.2026 – packungsbewusste Angebotsdeduplizierung ohne neue Freigabe

- Der Quellen-/Snapshot-Audit belegte einen deterministischen Defekt: Gleichnamige Angebote mit gleichem Preis, aber unterschiedlicher Packungsgröße konnten in den Importpfaden und beim lokalen App-Import als Duplikat verworfen werden. Das widersprach dem bestehenden Snapshot-Vertrag, der unterschiedliche Packungsgrößen ausdrücklich getrennt hält.
- Der minimale Fix nutzt in den Angebotsimportern, der Preis-Historie und im Frontend einen normalisierten Schlüssel aus Name, Preis, Packungsgröße, Gültigkeitsdatum und Markt. Ein synthetischer Regressionstest stellt sicher, dass 200-g- und 250-g-Varianten erhalten bleiben und echte Duplikate weiterhin zusammenfallen.
- Fokustests (51/51), Vollsuite (230/230), Worker-Validator und Diff-Check waren grün; Root und `dist` sind bytegleich. Es wurden keine echten Angebotsdaten aktualisiert, keine Nutzerdaten verändert und keine Supabase-/Schema-/Cloud-/Deploymentänderung vorgenommen. Für diesen rückwärtsverträglichen Korrekturblock ist keine neue Nutzerfreigabe erforderlich.

## Fortschritt 08.11.2026 – Lidl-Prospekt-Workflow: konservativer Parserfix ohne Live-Daten

- Der nächtliche Lidl-Lauf `42474845673` auf `main@4174139…` scheiterte ausschließlich im Ausleseschritt mit `Keine Lebensmittelangebote im Lidl-Prospekt erkannt`; Validierung und Commit wurden übersprungen. Die vorhandene Snapshot-Datei blieb dadurch unverändert.
- Der reproduzierbare Parserbefund war eine zu enge Lebensmittelklassifikation: 39 von 211 bereits vorhandenen Lidl-Angebotsnamen wurden synthetisch nicht erkannt. Die Hint-Liste wurde um beobachtete Lebensmittelbegriffe ergänzt; Metadaten, Grundpreise und bekannte Nichtlebensmittel bleiben weiterhin ausgeschlossen.
- Lidl-Fokustests (einschließlich synthetischer Regressionen), Vollsuite, Worker-Validator und Diff-Check sind vor dem PR-Merge auszuführen. Keine echte Angebotsaktualisierung, keine Nutzer-/Supabase-/Schema-/Cloudänderung und keine neue kostenpflichtige Ressource. Für den rein deterministischen, rückwärtsverträglichen Parserfix ist keine zusätzliche fachliche Freigabe erforderlich.

## Freigabepunkt 08.11.2026 – Schutz gegen ungültige Angebots-Payloads

Für diese kleine Stabilitätskorrektur ist keine zusätzliche fachliche Freigabe erforderlich. Der Import verwirft ungültige oder abgelaufene Quellenantworten und behält den letzten gültigen Marktstand. Es wurden ausschließlich automatisierte Tests und statische Prüfungen ausgeführt; kein Live-Angebotslauf, keine Supabase-/Nutzerdatenänderung und kein kostenpflichtiger Dienst wurde gestartet.
## Read-only-Audit 08.11.2026 – tatsächlicher Kauf-/IST-Pfad und Freigabepunkt 9

- `automation/purchase-records.mjs` ist bereits als rein lokale, deterministische Vorbereitung vorhanden. Der Kern prüft Kaufdatum und abgeleiteten Monat, eindeutige IDs, nichtnegative sichere Centbeträge, optionalen Markt und `source: 'manual'`; der Summarizer bildet eine Monatszwischensumme gegen 40.000 Cent. `automation/purchase-records.test.mjs` deckt Normalisierung, ungültige Daten, Duplikate, Monatsfilter, Überziehung und sichere Summen ab.
- Dieser Kern ist nicht in die Laufzeit eingebunden: Es gibt keinen `purchaseRecords`-LocalStorage-Schlüssel, keinen UI-Eingabepfad, keine Backup-/Restore-Aufnahme, keinen Supabase-/D1-Sync und keine Beleg-/OCR-Verarbeitung. Die App zeigt bei `Tatsächliche IST-Ausgaben` weiterhin `–` und `Noch nicht erfasst`.
- `budget-transparency.js` verarbeitet ausschließlich Monatsziel und bekannten Angebots-Teilbetrag; `actualSpendCents` bleibt absichtlich `null` und der Status `not-recorded`. Die Budget-Regression verhindert ausdrücklich eine Kauf- oder Cloud-Schreiblogik in diesem Anzeigepfad.
- Der bestehende v1-Sync-Vertrag führt `purchaseRecords` weder in den Client-/Worker-Arrays noch in die Supabase-Payload ein. Damit werden keine echten Käufe, Kassenpreise, Belegbilder oder Ausgabenhistorien gespeichert oder synchronisiert.
- Reproduzierbarer sicherer Vorbereitungsblock: Validator/Summarizer plus synthetische Tests sind nutzbar; ein produktiver IST-Pfad ist nicht vorhanden und wurde nicht gestartet. Die fokussierte Prüfung lief mit 49/49 Tests grün. Keine Nutzer-, Angebots-, Supabase-, Schema-, Cloud- oder kostenpflichtige Ressourcenänderung.
- Freigabepunkt 9 bleibt vollständig offen. Vor jeder Umsetzung müssen Erfassungsgranularität, Quelle, Kaufdatum/Monats- und Zeitzonenregeln, Korrekturen, Historie/Rechte/Aufbewahrung/Löschung, Umfang von Märkten/Haushaltswaren/Fahrtkosten sowie Null- und Budgetregeln entschieden werden. Diese Dokumentation ist keine Freigabe.
## Read-only-Audit 08.11.2026 – Supabase-Payload-Vertrag für recipeHistory und manualDinnerPlan

- Client (`index.html`/`supabase-sync.js`) und Worker behandeln `recipeHistory` als Array und `manualDinnerPlan` als Objekt. Der Sync-Vertrag begrenzt Arrays auf 5.000 Einträge und die gesamte Payload auf 600.000 Bytes; die Laufzeit normalisiert die Rezept-Historie zusätzlich auf Stringwerte und höchstens 20 Einträge.
- Die SQL-Funktion `app_private.save_household_state_impl` führt `recipeHistory` derzeit nicht in ihrem Array-Prüfarray und `manualDinnerPlan` nicht in ihrem Objekt-Prüfarray. Für `recipeHistory` existiert separat nur ein Tabellen-Check auf Array-Typ und höchstens 5.000 Einträge; Elementtypen werden dort nicht geprüft. Für `manualDinnerPlan` fehlt ein entsprechender feldbezogener SQL-Check.
- Konsequenz: Ein direkter RPC-Aufruf kann für `manualDinnerPlan` einen von Client und Worker abgelehnten Wert (z. B. `null`, Array oder Skalar) im Haushalts-Payload speichern. Bei der nächsten App-Ladung kann dieser Zustand verworfen werden und die Synchronisationsfähigkeit beeinträchtigen. `recipeHistory` ist strukturell durch den Tabellen-Check geschützt, der serverseitige Vertrag ist aber trotzdem nicht deckungsgleich mit der Laufzeitnormalisierung.
- Eine vollständige sichere Angleichung ist ohne Supabase-Migration nicht möglich. Client-/Worker-Prüfungen zu lockern oder die beiden Felder aus dem Payload zu entfernen wäre keine sichere Reparatur. Eine spätere freizugebende Migration muss mindestens beide Feldnamen in die SQL-Prüfarrays aufnehmen und die fachlich gewünschten Element-/Schlüsselregeln durch Constraints, Funktionsprüfungen und Regressionstests festlegen.
- Dieser Audit ist read-only: keine SQL-, Schema-, Daten-, Nutzer-, Cloud- oder Deploymentänderung und keine Live-Supabase-Schreib-/Leseprüfung. Die vorhandenen Client-/Worker-Regressionsprüfungen werden fokussiert und anschließend vollständig ausgeführt. Der Migrations-/Vertragsabgleich bleibt als gebündelter Freigabepunkt offen.
## Read-only-Audit 08.11.2026 – Offline-Queue, Konfliktbehandlung und Haushaltssynchronisierung

- Die lokale App persistiert Plan, Vorräte, Einkaufschecks, Einstellungen und weitere v1-Felder unmittelbar in `localStorage` (`index.html`, u. a. um die Persistenzfunktionen ab Zeile 637 und die Plan-/Vorrats-Schreibpfade ab Zeile 1741 bzw. 2507). Eine lokale Outbox, Pending-Operation, Änderungs-ID oder Wiederholungswarteschlange für Cloud-Schreibvorgänge existiert nicht.
- Der Supabase-Client bietet ausschließlich explizites `load()` und `save()` (`supabase-sync.js:249-320`). Ein Fehler lässt den lokalen Stand unverändert; es gibt keine automatische Wiederholung, keinen Backoff, keine Online-Reaktivierung und keinen persistenten Hinweis „noch nicht synchronisiert“. `guardedSync()` reicht den Fehler nur an Status/Toast weiter (`supabase-sync.js:460-467`).
- Konflikte werden deterministisch durch Compare-and-Swap verhindert: Der Client vergleicht lokale Haushalts-ID und gespeicherte Revision mit dem Cloud-Stand (`supabase-sync.js:284-299`); die SQL-Funktion aktualisiert nur bei identischer Revision und wirft sonst `40001` (`supabase/migrations/20261106150037_household_sync_foundation.sql:221-236`). Es gibt keinen Drei-Wege-Merge und keine feld- oder zeitbasierte Konfliktauflösung.
- Ein bestätigtes Cloud-Laden validiert den gesamten Payload vor `applyPayload()` und schreibt erst danach Revision und Haushaltsbindung (`supabase-sync.js:260-273`). Das schützt gegen Teilübernahme; eine Nutzerbestätigung kann den lokalen Stand jedoch bewusst durch den Cloud-Stand ersetzen. Eine lokale Änderungs-Historie oder Wiederherstellung des verworfenen Stands ist im Sync-Pfad nicht vorhanden.
- Der Worker-/D1-Pfad ist davon getrennt: `worker/index.js:48-69` liest bzw. ersetzt den Stand pro `oai-authenticated-user-id` mit einem einfachen Upsert. Er prüft Payloadform und Größenlimit, kennt aber keine Haushaltsmitgliedschaften, Revisionen, Konflikte, Offline-Queue oder Wiederanlaufmarke. Die App nutzt diesen Pfad für die aktuelle Supabase-Haushaltssynchronisierung nicht automatisch als Fallback.
- Rechte sind serverseitig grundsätzlich begrenzt: `get_household_state_impl` erlaubt Mitgliedern das Lesen, `save_household_state_impl` nur `owner`/`editor`; öffentliche RPCs sind auf authentifizierte Nutzer beschränkt (`supabase/migrations/20261106150037_household_sync_foundation.sql:116-143, 172-180, 242-310`). Eine fachliche Einladungs-/Mitgliederverwaltung ist weiterhin nicht eingerichtet.
- Abgleich mit dem Produktziel: Die Dokumentation beschreibt die revisionsgeschützte, optionale Synchronisierung als vorhanden (`docs/PRODUKTZIEL.md:58-60`) und hält automatische Offline-Konfliktzusammenführung ausdrücklich als Freigabepunkt offen (`docs/FREIGABEN.md:19-22`). Der Ist-Stand erfüllt daher den sicheren „nicht still überschreiben“-Teil, aber nicht Offline-Queue, automatische Wiederaufnahme oder Merge.
- Freigabefreier nächster Schritt: ein rein lokaler, read-only Regressionstest-/Dokumentationsblock kann den aktuellen Vertrag weiter absichern (Fehler lässt lokale Daten unverändert, stale revision schreibt nicht, bestätigtes Laden ist atomar). Eine echte Outbox, automatische Wiederholung, Konflikt-Merge, neue Cloud-Felder oder D1-/Supabase-Abgleich bleiben fachlich und datenschutzrechtlich freigabepflichtig. Dieser Audit änderte weder Code noch SQL, Schema, Daten, Deployment oder Kostenressourcen.

## Read-only-Audit 08.11.2026 – Supabase Auth, Session und Redirect-Grenzen

- `supabase-sync.js:167-183` erstellt den offiziellen Supabase-Client mit `persistSession: true`, `autoRefreshToken: true` und `detectSessionInUrl: true`. Der Auth-State-Listener aktualisiert Session/UI; `getSession()` wird beim Initialisieren zusätzlich geprüft. Der Code verwendet nur Projekt-URL und Publishable Key, keinen Service-Role-/Secret-Key.
- Anmeldung und Registrierung sind getrennt nachvollziehbar (`supabase-sync.js:323-356`): Die Anmeldung verlangt E-Mail/Passwort und eine tatsächlich vorhandene nicht-anonyme Session; bei ausstehender E-Mail-Bestätigung wird kein Haushaltszugriff freigeschaltet. Nach erfolgreicher Registrierung wird das Passwortfeld geleert; ohne Session wird ausdrücklich auf die Bestätigung und eine spätere Anmeldung verwiesen.
- Sessionende und Benutzerwechsel löschen nur den lokalen Supabase-Haushaltskontext (`angebotskueche.supabase.household`, lokale Haushaltsbindung und Revisionsschlüssel), nicht die fachlichen App-Daten in `localStorage` (`supabase-sync.js:39-60`). Dieser Datenhoheitsvertrag ist synthetisch durch `automation/supabase-session-context.test.mjs` abgesichert. Ein Logout-Fehler lässt die bisherige Session bewusst bestehen und meldet den Fehler, statt fälschlich einen erfolgreichen Logout zu behaupten.
- Die Cloud-Aktionen unterscheiden angemeldet, abgemeldet und nicht erreichbare Sessionprüfung. Auf GitHub Pages öffnet ein Offline-/Sessionfehler keinen Login-Dialog und fällt nicht auf den D1-Pfad zurück (`index.html:2673-2730`, `automation/supabase-sync.test.mjs`). Lokale Daten bleiben dabei unverändert.
- Redirect-/Dashboard-Grenze: Die Produktions-URL `https://bndkxbqf2g-stack.github.io/Einkaufen/` und die Redirect-Allowlist wurden laut Nutzer im Supabase-Dashboard gesetzt; im Repository ist nur `detectSessionInUrl` sichtbar. Der tatsächliche Redirect-Austausch, E-Mail-Link, abgelaufene/ungültige Bestätigungslink, Session-Erneuerung nach Browser-Neustart und ein echter Logout konnten ohne ein vom Nutzer angelegtes Testkonto nicht end-to-end verifiziert werden. Dashboardwerte wurden nicht unabhängig ausgelesen.
- Kein reproduzierbarer statischer Auth-Defekt gefunden. Fokussierte Auth-/Session-/Payload-Tests und die Vollsuite bleiben grün; dieser Audit änderte weder Code noch SQL, Schema, Daten, Auth-Konfiguration, Redirect-Allowlist, Deployment oder Kostenressourcen. Der echte Auth-/E-Mail-E2E-Test bleibt als gebündelter Nutzer-Testpunkt offen; Zugangsdaten oder Tokens gehören nicht in den Chat.

## Read-only-Audit 08.11.2026 – CI/CD- und Workflow-Sicherheitsgrenzen

- Pull-Request-Validierung ist schreibgeschützt: `.github/workflows/github-pages.yml:40-42` setzt `contents: read`; der Deploy-Job läuft nicht für Pull Requests (`:69`) und erhält `pages: write`/`id-token: write` erst für den produktiven Pages-Lauf nach erfolgreicher Validierung (`:70-101`). Der aktuelle Build-/Worker-/Vollsuite-Check lief ohne reproduzierbaren Fehler; Root und `dist` sind bytegleich.
- Angebots- und Root-Sync-Workflows schreiben gezielt nach `main` (`retailer-offers.yml:25-75`, `kaufda-offers.yml:36-79`, `lidl-offers.yml:7-34`, `sync-pages-root.yml:15-58`). Das ist funktional der aktuelle Veröffentlichungsmechanismus, vergrößert aber die Auswirkung eines kompromittierten oder fehlerhaft zusammengeführten Workflow-/Parser-Commits. Die Jobs laufen nicht auf `pull_request`; ein akuter ungeschützter PR-Schreibpfad wurde nicht gefunden.
- Die Abrufjobs verwenden externe, nicht im Repository gesperrte Laufzeitabhängigkeiten (`npm install --no-save playwright`, `pdf-parse`, `npx playwright install`) und Actions nur über veränderliche Major-Tags wie `actions/checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `deploy-pages@v4`. Das ist ein Lieferketten-/Reproduzierbarkeitsrisiko, aber kein im Audit reproduzierter Datenfehler. Eine spätere Härtung sollte Versionen/Checksums, Least-Privilege-Schreibrechte und einen geprüften Veröffentlichungsweg festlegen; sie ist nicht Bestandteil dieses Audits.
- Das KaufDA-Workflow-Geheimnis `KAUFDA_STORAGE_STATE_B64` wird nur als Job-Umgebungsvariable verwendet (`kaufda-offers.yml:58-60`) und im Runner in eine temporäre Datei geschrieben (`automation/kaufda-offers.mjs:350-376`), die im `finally`-Pfad entfernt wird. Es wird nicht geloggt; ein echter Secret-/Browser-End-to-End-Test wurde nicht durchgeführt.
- Angebotsdaten werden vor dem Commit über `automation/offer-snapshot.mjs` validiert und atomar über temporäre Datei plus `rename` veröffentlicht (`:144-157`). Händlerfehler, fehlende Angebotsenden oder leere Ergebnisse brechen den jeweiligen Lauf ab; der letzte gültige Dateistand bleibt dadurch erhalten. Der KaufDA-Job verwirft bei einem Teilfehler den gesamten Commitlauf, während der Händlerjob einzelne Fehlschläge protokolliert und vorhandene Stände erneut validiert.
- Worker-/D1- und Supabase-Grenzen bleiben getrennt: Der Worker akzeptiert nur den expliziten authentifizierten Sync-Header und validierte Payloads (`worker/index.js:39-69`); Rezept- und Angebotsabrufe beschränken HTTPS-Hosts und Antwortgrößen. Supabase verwendet im Frontend nur URL/Publishable Key; es wurden keine Secrets, Datenbankänderungen, Live-Angebotsabrufe oder Deployments ausgeführt.
- Der Audit änderte keinen Code, keine Workflow-Konfiguration, keine Angebots-/Nutzerdaten, kein Supabase-Projekt und keine kostenpflichtige Ressource. Lokal blieben Vollsuite (233/233) und Worker-Validator grün. Die Lieferkettenhärtung und eine mögliche Reduzierung von `contents: write` bleiben gebündelte technische Freigabepunkte; diese Dokumentation ist keine Umsetzungserlaubnis.

## Fortschritt 08.11.2026 – statischer CI/CD-Sicherheitsregressionstest

- `automation/workflow-security.test.mjs` prüft textuell die Sicherheitsgrenzen der Workflows: Pages-Validierung mit `contents: read`, produktiver Pages-Deploy nur außerhalb von `pull_request` mit explizitem `pages: write`/`id-token: write`, sowie keine Pull-Request-Trigger für Angebots- und Root-Sync-Workflows.
- Der Test prüft außerdem, dass die erwarteten `contents: write`-Rechte der mutierenden Angebots-/Root-Sync-Jobs explizit im jeweiligen Workflow stehen. Er verändert keine Workflowdatei und installiert keine Abhängigkeit.
- Fokustest, Vollsuite und Worker-Validator liefen nach der Ergänzung grün (1/1, 234/234 und erfolgreich). Keine Produktionslogik, kein Root-/`dist`-Artefakt, keine Angebots-/Nutzerdaten-, Supabase-, Secret- oder Deploymentänderung. Der Testbefund ist keine Freigabe für eine spätere Härtung der Lieferkette oder Schreibrechte.

## Fortschritt 08.11.2026 – additive Kosten-/Kassenmodell-Grundlage

- Das reine Budgetmodul akzeptiert optional vollständige geplante Ausgaben, bestätigte Kassenbeträge und getrennte Fahrtkosten und berechnet daraus Cent-genau Planrest, Budgetrest sowie die bestätigte Summe inklusive Fahrtkosten. Der bekannte Angebotsbetrag bleibt davon getrennt und bleibt bei offenen Positionen ein Teilbetrag.
- Die bestehende Packungslogik weist angenäherte Packungszahlen für bekannte Preise, unbekannte Preise, alle Angebotspositionen und fehlende Artikel aus. Unbekannte Preise, ungültige Centwerte und fehlende Kassenwerte bleiben `null`.
- 40.000 Cent bleiben das Standardziel; 44.000 Cent erfordern eine explizite alternative Zielbestätigung. Die UI erhält keine automatische Kassenbuchung, keinen neuen LocalStorage-Schlüssel und keinen Supabase-/D1-Payload-Pfad.
- Fokustests für Budget- und Kostenmodell, Vollsuite und Worker-Validator liefen grün. Der sichere Modul-/Testblock ist keine Freigabe für echte IST-Erfassung, Beleg/OCR, Fahrtkostenbasis, Backup-/Sync-Aufnahme oder Haushalts-Historie; dafür bleibt Freigabepunkt 9 maßgeblich.

## Freigabepunkt 08.11.2026 – Integration mengenbewusster Vorratsdeckung

Der reine, lokale Mengenabgleich ist umgesetzt und benötigt keine neue fachliche Freigabe: Er verändert keine Nutzerdatenverträge und zieht bei unbekannten oder inkompatiblen Mengen nichts ab. Eine tatsächliche Einbindung in Einkaufsliste, Packungsanzahl und Kostenmodell bleibt als eigener Freigabepunkt offen. Dafür müssen Restbedarf, Packungsrundung, manuelle Artikel, Vorratsverbrauch sowie die Auswirkungen auf Anzeige, Backup und Haushaltssync gemeinsam festgelegt und regressionsgetestet werden. Bis dahin bleibt die bestehende String-Vorratsliste rückwärtskompatibel und die neue Menge nur im lokalen Zusatzschlüssel.

## Freigabepunkt 08.11.2026 – benannte Tages-Teilnehmer und Kinderanzahl

Die sichere lokale Modellgrundlage ist umgesetzt: `martin`, `steffi` und die generische Gruppe `children` werden stabil normalisiert; unbekannte oder doppelte IDs werden verworfen. Die Personenzahl wird nur mit einer expliziten Kinderanzahl abgeleitet, sonst greift der bisherige numerische Tageswert.

Offen und nicht Bestandteil dieses PRs bleiben eine produktive UI-Auswahl pro Tag, die Quelle und Pflege der Kinderanzahl sowie deren Aufnahme in lokale Settings, Backup, Worker-/Supabase-Payload und Haushaltssync. Bis zu einer ausdrücklichen fachlichen Entscheidung bleibt die vorhandene Auswahl `2/3/4` Personen je Tag maßgeblich. Es wurden keine neuen Cloud-Felder, Mitgliedschaften, Auth-Regeln oder Daten geändert.

## Freigabepunkt 08.11.2026 – tatsächliche Mehrstopp-/Fahrtkostenbasis

Der reine Marktstopp-Rechenkern ist umgesetzt: Er empfiehlt nur bei explizit belegter Nettoersparnis oberhalb einer gelieferten Schwelle und verändert keine Markt- oder Nutzerdaten. Eine produktive Integration benötigt weiterhin eine ausdrückliche Entscheidung über Fahrtkostenquelle (z. B. Verkehrsmittel, Strecke, Parken), Marktzuordnung, Schwellenwert und UI-/Sync-Verhalten. Bis dahin werden keine Entfernungen, Fahrtkosten, Angebote oder zusätzlichen Stopps automatisch berechnet oder empfohlen.

## Freigabepunkt 08.11.2026 – Abwechslungsanzeige im Wochenplan

Die reine Abwechslungsbewertung ist umgesetzt und prüfbar. Sie liefert getrennte Werte für Gerichte, Hauptzutaten, Zubereitungsarten, fehlende Merkmale und bewusste Restewiederholungen. Eine Änderung der bestehenden UI-Bewertung oder eine automatische Planänderung ist nicht Bestandteil dieses PRs.

Vor einer UI-Integration müssen Anzeige-/Score-Regeln, die Behandlung fehlender Metadaten und die sichtbare Kennzeichnung von Restetagen fachlich bestätigt werden. Bis dahin bleiben bestehende Plan-, Nutzer-, Backup-, Cloud- und Supabase-Daten unverändert.

## Gebündelte Freigabe-Arbeitsliste – Stand 08.11.2026

Die sicheren Grundlagen für Kosten-/Budgettransparenz, lokale Vorratsmengen, Teilnehmernormalisierung, Marktstopp-Rechnung und Abwechslungsbewertung sind inzwischen als getrennte, deterministische Modelle und Regressionstests vorhanden. Die produktiven UI-, Speicher- und Cloud-Integrationen dieser Modelle sind damit nicht automatisch freigegeben.

### 1. Mengenbewusste Vorratsdeckung

- **Entscheidung:** Sollen Rezeptbedarf und Vorrat in g/kg, ml/l und Stück verrechnet werden; wie werden Teilmengen, Verbrauch, Nullbestand, Rundung und mehrere Gerichte behandelt?
- **Sicherer Standard:** Nur gleiche Mengenfamilien umrechnen; fehlende, unklare oder inkompatible Mengen nicht abziehen. Ohne Entscheidung keine Schätzung.
- **Betroffene Verträge:** `pantryQuantities`, Rezept-/Einkaufsbedarf, Packungsrundung, Kostenmodell, Backup und Supabase-/Worker-Payload.
- **Danach möglich:** lokale Abdeckung im Einkaufslistenmodell mit Regressionstests; anschließend getrennte Entscheidung über Verbrauch und Synchronisierung.
- **Risiko:** Falsche Einheit oder stiller Verbrauch erzeugt zu kleine Einkaufslisten, falsche Kosten und geräteübergreifende Konflikte.

### 2. Tages-Teilnehmer-UI und Kinderanzahl

- **Entscheidung:** Wie viele Kinder werden planmäßig berücksichtigt, wer darf die Auswahl je Tag ändern, und soll die Auswahl nur lokal oder haushaltsweit gelten?
- **Sicherer Standard:** Bestehender numerischer Tageswert 2/3/4 bleibt Fallback; keine Kinderzahl und keine Teilnehmer werden erfunden.
- **Betroffene Verträge:** Wochenplan, Mengen-/Kostenpfad, lokale Settings, Backup, Haushaltssync und Mitgliedschaftsmodell.
- **Danach möglich:** Auswahl von Martin, Steffi und Kindern pro Tag; Ableitung der Tagesportionen bei expliziter Kinderzahl.
- **Risiko:** Eine falsche Kinderzahl verändert Mengen, Packungen, Kosten und Budgetaussagen für den ganzen Plan.

### 3. Abwechslungsanzeige und Score

- **Entscheidung:** Wie sollen eindeutige Gerichte, Hauptzutaten und Zubereitungsarten gewichtet werden; wie sollen fehlende Merkmale und geplante Restetage angezeigt werden?
- **Sicherer Standard:** Reine Merkmalswerte sichtbar machen, aber bestehenden Score und Plan nicht automatisch verändern, bis die Anzeige abgenommen ist.
- **Betroffene Verträge:** Wochenplan-Renderer, Rezeptmetadaten, gemeinsame Identitätsnormalisierung und Restelogik.
- **Danach möglich:** UI-Anzeige mit nachvollziehbarem Status und bewusst gekennzeichneten Wiederholungen.
- **Risiko:** Eine ungeprüfte Gewichtung bevorzugt bloße Umbenennungen oder bestraft geplante Resteverwertung.

### 4. Tatsächliche IST-/Kassen-Erfassung

- **Entscheidung:** Gesamtbetrag je Einkauf oder Positionen, Quelle (manuell/Beleg/OCR), Kaufdatum und Monatszeitzone, Korrekturen, Fahrtkosten, Historie, Aufbewahrung, Löschung und Haushaltsrechte.
- **Sicherer Standard:** Bis zur Entscheidung nur vorbereiteten lokalen Validator nutzen; keine produktiven Käufe speichern und keine unbekannten Werte als 0 behandeln.
- **Betroffene Verträge:** `purchaseRecords`, Budgetanzeige, lokale Speicherung, Backup, Supabase-/Worker-Payload, RLS und Datenschutz.
- **Danach möglich:** zunächst lokales manuelles Erfassungsmodell; später ausdrücklich freigegebene Synchronisierung oder Belegverarbeitung.
- **Risiko:** Unklare Monats-/Korrekturregeln verfälschen Budgetreste und Historie; zu breite Synchronisierung legt sensible Ausgaben offen.

### 5. Mehrstopp-/Fahrtkostenbasis

- **Entscheidung:** Verkehrsmittel, Strecke, Parken, Fahrtkostenquelle, Marktzuordnung und Nettoersparnisschwelle.
- **Sicherer Standard:** Keine zusätzlichen Stopps empfehlen, solange Kosten und Schwelle nicht ausdrücklich geliefert und validiert sind.
- **Betroffene Verträge:** Marktlimit, Warenkorbvergleich, Angebots-/Regulärpreise, Kostenmodell und spätere Routinglogik.
- **Danach möglich:** geprüfte Mehrstopp-Empfehlung aus Basiswarenkorb minus Alternativwarenkorb minus Fahrtkosten.
- **Risiko:** Geschätzte Fahrtkosten oder unvollständige Angebote führen zu scheinbaren statt echten Ersparnissen.

### 6. Offline-Warteschlange und Konfliktstrategie

- **Entscheidung:** Welche lokalen Operationen werden gepuffert, wie werden Reihenfolge, Wiederholung, Löschung und konkurrierende Änderungen behandelt?
- **Sicherer Standard:** Aktueller Compare-and-Swap-Schutz stoppt veraltete Schreibvorgänge; kein automatischer Merge und kein stilles Überschreiben.
- **Betroffene Verträge:** localStorage, Outbox, Supabase-Revisionen, Worker-/D1-Pfad, RLS und UI-Status.
- **Danach möglich:** begrenzte Outbox mit Backoff, Wiederaufnahme und expliziter Konfliktanzeige.
- **Risiko:** Eine falsche Merge-Regel kann Vorräte, Pläne oder Ausgaben unwiederbringlich überschreiben.

### 7. Supabase-Payload-/SQL-Vertragslücke

- **Entscheidung:** Welche Feldtypen und Elementregeln gelten serverseitig verbindlich für `recipeHistory` und `manualDinnerPlan`, und welche Payload-Felder sind künftig zugelassen?
- **Sicherer Standard:** Client-/Worker-Prüfungen nicht lockern und keine direkten RPC-Schreibungen für neue oder ungeprüfte Felder zulassen.
- **Betroffene Verträge:** `supabase-sync.js`, Worker-Validator, `save_household_state_impl`, Migrationen, RLS und Regressionstests.
- **Danach möglich:** eine freigegebene SQL-Migration mit deckungsgleichen Prüfungen und Rollback-/Testplan.
- **Risiko:** Uneinheitliche Validierung kann per direktem RPC ungültige Haushaltszustände speichern und spätere Synchronisierung brechen.

### 8. Auth-Redirect-/E-Mail-E2E-Test

- **Entscheidung:** Wer legt ein zeitlich begrenztes Testkonto an und wann darf der Redirect-/Bestätigungs-/Logout-Test durchgeführt werden?
- **Sicherer Standard:** Keine Passwörter, Tokens oder Testzugänge dokumentieren; ohne Testkonto bleibt der E2E-Befund unbekannt.
- **Betroffene Verträge:** Supabase Auth, Site-/Redirect-Allowlist, Session-Handling und GitHub-Pages-Deployment.
- **Danach möglich:** einmaliger Test von Registrierung, Bestätigungslink, Redirect, Session-Erneuerung und Logout ohne Änderung an Nutzdaten.
- **Risiko:** Ein ungeprüfter Redirect kann Bestätigungslinks unbrauchbar machen oder Sessions auf unerwartete Ziele leiten.

### 9. Optionale KI-/Provider-/Kostenfreigabe und Vue/TypeScript

- **Entscheidung:** Ob ein KI-Anbieter benötigt wird, welche Daten übertragen werden dürfen, welches Kostenlimit gilt und ob ein Frameworkwechsel tatsächlich Nutzen bringt.
- **Sicherer Standard:** Keine KI/API und keine kostenpflichtige Ressource; statische App und bestehende JavaScript-Module bleiben maßgeblich.
- **Betroffene Verträge:** Datenminimierung, Validierung, Kostenkontrolle, Deployment und gesamte Frontend-Architektur.
- **Danach möglich:** zunächst providerunabhängiger Adapter mit Budget-/Ausfallgrenzen; Vue 3/TypeScript nur nach messbarem Vergleich und ausdrücklicher Freigabe.
- **Risiko:** Ein voreiliger Provider- oder Frameworkwechsel erhöht Kosten, Datenabfluss, Komplexität und Migrationsrisiken ohne belegten Produktnutzen.

### Empfohlene Reihenfolge und nächster Schritt

Nach einer gebündelten Entscheidung ist die lokale Vorratsdeckung der sinnvollste nächste Implementierungsschritt, weil sie den Einkaufsprozess direkt verbessert und auf dem vorhandenen Mengenmodell aufbauen kann. Dafür müssen zuerst Einheiten, Teilmengen und Verbrauch verbindlich festgelegt werden. Diese Arbeitsliste selbst ändert keine Verträge und ist keine Freigabe.

## Fortschritt 08.11.2026 – vorbereitender Adapter für mengenbewusste Vorratsdeckung

- Der neue reine Adapter gruppiert explizite Bedarfspositionen über die bestehende Zutatenidentität und nutzt `pantry-quantity.js` für vollständige, teilweise, unbekannte und inkompatible Abdeckung. Mehrere Einträge derselben Identität werden vor der Abdeckung addiert.
- Manuelle Artikel und Positionen ohne explizite Mengenbasis bleiben im Legacy-Status; Vorratsdaten werden weder verbraucht noch mutiert. Es wurden keine neuen LocalStorage-, Backup-, Worker-, Supabase-, SQL-, Auth- oder Sync-Felder eingeführt.
- Fokustests (5/5), Vollsuite (256/256) und Worker-Validator liefen grün. Die produktive Einbindung in `getShoppingItems`, Packungsbedarf und Kosten bleibt ausdrücklich Freigabepunkt 1.

## Fortschritt 08.11.2026 – vorbereitendes Offline-Outbox-Modell

- Das reine Modell `offline-queue.js` validiert stabile Operationen, schützt FIFO-Queues vor doppelten IDs und klassifiziert Sync-Versuche gegen eine explizite Remote-Revision als `ready`, `conflict`, `unknown` oder `invalid`.
- Payloads werden nicht fachlich verändert; es gibt keinen automatischen Merge, keine erfundene Revision und keine produktive Queue-/localStorage-/UI-/Supabase-/Worker-Integration.
- Fokustests (6/6), Vollsuite (262/262) und Worker-Validator liefen grün. Die produktive Offline-Queue und Konflikt-UX bleiben ausdrücklich Freigabepunkt 6.

## Fortschritt 08.11.2026 – Frontend-/Worker-Datumsparität

- PR [#246](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/246) wurde nach grüner PR-CI in Merge-Commit `806f07ab67bce6bc85ff7696f0a7dcce4bd3cd52` übernommen. Der Frontend-Validator verwirft nun Snapshot- und Einzelangebotsenden vor dem protokollierten `fetchedAt`, entsprechend dem bestehenden Worker-Vertrag.
- Der synthetische Regressionstest sowie Root-/`dist`-Synchronität und Worker-Validierung wurden geprüft. Keine neue fachliche Freigabe, da ausschließlich eine deterministische Validierungslücke geschlossen wurde; keine Live-Angebote, Preise, Nutzdaten, Supabase-, SQL-, Auth- oder Cloud-Änderung.


## Fortschritt 08.11.2026 – Budgettransparenz in der Einkaufsliste

- Die Einkaufsliste verwendet für Monatsziel, bekannten Angebots-Teilbetrag und „IST noch nicht erfasst“ denselben bestehenden Kosten-/Budgetkern wie die Planansicht. Die Anzeige bleibt rein lokal und lesend.
- Unbekannte Preise, fehlende Artikel, Vorräte und Fahrtkosten bleiben ausdrücklich außerhalb. Es gibt keine echte Kassenbuchung, keinen neuen Speicher-/Sync-Vertrag und keine Änderung an Backup, Supabase, SQL, Auth oder Cloud.
- Fokustests, Vollsuite und Worker-Validator liefen nach der Integration grün. Für diesen deterministischen UI-Transparenzblock ist keine neue fachliche Freigabe erforderlich; die produktive IST-Erfassung bleibt Freigabepunkt 9.
## Fortschritt 08.11.2026 – Worker-Deduplizierung nach Packungsgröße

- Der Worker verwendet für Live-Angebote nun den bereits etablierten packungsbewussten Deduplizierungsschlüssel. Die Änderung ist deterministisch, rückwärtskompatibel und rein lesend.
- Regressionen decken 200 g/250 g bei gleichem Namen und Preis sowie echte Duplikate mit abweichenden Leerzeichen ab. Worker-Build und Validator bleiben erfolgreich.
- Keine neue fachliche Freigabe erforderlich; es wurden keine Quellen-, Preis-, Datenbank-, Supabase-, Auth-, Sync- oder Cloud-Verträge geändert.
## Fortschritt 08.11.2026 – Marktfortschritt in der Einkaufsliste

- Marktgruppen zeigen nun `erledigt/gesamt` und können gesammelt abgehakt oder wieder geöffnet werden. Die bestehende lokale Checklistenpersistenz bleibt der einzige Zustand.
- Regression, Vollsuite, Worker-Build und Validator liefen grün. Es gibt keine neue fachliche Freigabe; Marktvergleich, Fahrtkosten, Belegerfassung und Vorratsmengen bleiben unverändert freigabepflichtig.
## Fortschritt 09.11.2026 – Evidenzstatus am Einkaufsartikel

- Quelle und Gültigkeit werden am Einkaufsartikel konservativ ausgewiesen. `saving` bleibt ein Quellenhinweis; reguläre Vergleichssummen werden nur aus explizit belegten Quellen berechnet, bleiben vom Kassenbetrag getrennt und sind keine bestätigte Ersparnis.
- Regressionen für bekannte/unbekannte Quelle, fehlenden/vorhandenen Hinweis, manuellen Import, abgelaufene Angebote und Cache-Fallback sind grün. Keine neue Freigabe erforderlich; IST-/Belegerfassung und Quellen-/Routenlogik bleiben Freigabepunkte.
## Fortschritt 09.11.2026 – Evidenzstatus beim Teilen der Einkaufsliste

- Der bestehende Evidenzstatus wird beim Teilen wiederverwendet; es gibt keine neue Berechnung und keinen neuen Datenvertrag.
- Regression, Vollsuite, Worker-Build und Validator sind grün. Keine neue fachliche Freigabe erforderlich; echte Vergleichspreise und IST-/Belegerfassung bleiben freigabepflichtig.

## Fortschritt 09.11.2026 – Zugänglichkeit der Einkaufslisten-Fortschritte

- PR #254 wurde gemergt und gibt den bereits vorhandenen dynamischen Marktgruppen der Einkaufsliste zugängliche Namen.
- PR #255 wurde gemergt und macht den bereits vorhandenen Gesamtfortschritt sowie den bereits vorhandenen Fortschritt je Marktgruppe als höfliche, atomare Statusbereiche für Screenreader ankündigbar.
- Beide PRs enthalten ausschließlich Accessibility-/Regressionstest- und synchronisierte Artefaktänderungen. Keine neue Fachlogik, keine Daten-, Sync-, Supabase-, Auth- oder Cloudänderung und keine Preis-/Angebotsänderung.
- Dafür ist keine neue fachliche Freigabe erforderlich. Die bisher gebündelten Freigabepunkte bleiben unverändert, insbesondere Vorrats-/Mengenverbrauch, echte IST-/Belegerfassung, Vergleichspreise/Ersparnis, Fahrtkosten/Mehrstopp-Routing, Offline-Konfliktstrategie und weitergehende Supabase-/Auth-Verträge.

## Audit 09.11.2026 – tatsächlicher Einkauf und Vorratsverbrauch

Der read-only Audit gegen `main@f13c3ea9c93fef5844ec63e4b96980365ddad9f2` bestätigt den aktuellen sicheren Umfang:

- `shoppingChecks` sind ausschließlich Listenfortschritt beziehungsweise Markt-/Artikel-Haken. Sie sind keine Kauf-, Kassen- oder Belegbuchung; `purchaseRecords` existieren derzeit nur als deterministischer Automations-/Testkern, nicht in UI, LocalStorage, Backup, Haushaltssync oder Supabase.
- Die Planung liest Vorräte ausschließlich. Die mengenbasierte Coverage verändert weder Vorrat noch `pantryQuantities`; vollständig, teilweise, unbekannt und inkompatibel werden nur für die abgeleitete Einkaufsliste ausgewertet. Frühstück bleibt außerhalb; der bestätigte Umfang ist Mittagessen plus optionales Abendessen.
- Direkte Vorratsbearbeitung (Hinzufügen, Menge speichern, Entfernen) ist eine unmittelbare lokale Nutzeraktion ohne zusätzlichen Confirm-Dialog. Ein lokaler Backup-Import wendet den validierten Stand nach Dateiauswahl direkt an; Cloud-Laden verlangt bereits eine Bestätigung. Diese bestehenden Bestätigungsrisiken werden hier nur dokumentiert und nicht verändert.
- Es gibt aktuell keine automatische Verbrauchsbuchung, keine Beleg-/OCR-Erfassung und keine automatische Übernahme von Angebots- oder Planwerten als tatsächliche Ausgabe. Unklare oder inkompatible Mengen in g/kg, ml/l und Stück werden nicht automatisch verrechnet.

### Gebündelte spätere Freigabe

Vor einer Runtime-, LocalStorage-, Backup- oder Sync-Erweiterung ist als Konkretisierung von Freigabepunkt 9 zu entscheiden beziehungsweise freizugeben:

- ein lokaler, expliziter Dialog „Einkauf abschließen“ mit manueller IST-Summe, Kaufdatum und optionalem Markt;
- zunächst ausschließlich lokale Speicherung, ohne Pantry-Verbrauch, Cloud-/Backup-Erweiterung, OCR oder automatische Preisübernahme;
- danach separat ein bestätigtes Verbrauchsmodell, das nur positive, kompatible Mengen in g/kg, ml/l oder Stück verrechnet und unbekannte oder inkompatible Mengen unverändert lässt.

Dieser Audit- und Dokumentationsstand ändert keine Runtime, UI, Speicherstruktur, Supabase-/Schema-/Auth-Verträge, Nutzerdaten oder Deployments.

## Release-Gates aus dem Supabase-/CI-Sicherheitsaudit – 09.11.2026

Die folgenden Punkte sind belegte Verifikations- oder Freigabegrenzen. Dieser Abschnitt dokumentiert sie nur; er ändert keine Runtime, SQL-Migration, Supabase-Konfiguration, Secrets, Daten oder Deployments.

1. **Separater D1-Worker:** Der D1-Pfad vertraut auf den Header `oai-authenticated-user-id`. Eine kryptografische Authentizitätsprüfung dieses Headers beziehungsweise die verbindliche Durchsetzung durch ein Hosting-Gateway ist außerhalb des Repositorys nicht beweisbar. Vor produktiver D1-Nutzung muss der vorgelagerte Auth-/Hosting-Pfad unabhängig verifiziert werden; andernfalls bleibt der D1-Pfad deaktiviert.
2. **`manualDinnerPlan` und SQL-Vertrag:** Client und Worker validieren `manualDinnerPlan` als Objekt, während die SQL-RPC-Keyliste dieses Feld derzeit nicht abdeckt. Eine Angleichung darf erst nach einer ausdrücklich freigegebenen SQL-Migration, einem Client-/Worker-/SQL-Paritätstest und erneuter Vertragsprüfung erfolgen.
3. **Remote Auth und Live-RLS:** Auth-Site-/Redirect-Allowlist, E-Mail-Bestätigung, JWT-/Refresh-Verhalten, Rate-Limits sowie die tatsächliche RLS-/E2E-Wirkung im laufenden Supabase-Projekt sind aus dem Repository nicht unabhängig verifiziert. Vor einer produktiven Auth-/Haushaltssync-Freigabe ist ein separater Live-Test mit Testkonto und sicheren Projektprüfungen erforderlich; Zugangsdaten oder Tokens gehören nicht in den Chat.
4. **jsDelivr-Supply-Chain-Härtung:** Die aktuelle CDN-Einbindung verwendet kein SRI. Self-Hosting oder eine geprüfte Integritätsbindung bleibt optionales Supply-Chain-Hardening und wird ohne gesonderte Abwägung nicht automatisch eingeführt.

Bis diese Punkte separat verifiziert beziehungsweise freigegeben sind, werden weder der D1-Identitätsweg, der SQL-Vertrag, die Remote-Auth/RLS-Annahmen noch die CDN-Härtung eigenmächtig erweitert.

## Prüfstand (Auditbasis main@74f3bf70362904a3bd212a8552ba6c26dcdc23ef) – 09.11.2026

Dieser Abschnitt ist der maßgebliche aktuelle Koordinationsstand. Frühere Abschnitte mit historischen Chat-/Worktree-Aktivitäten bleiben als Verlauf erhalten und sind nicht als laufende Aufgaben zu verstehen.

- Die geprüften Änderungen aus den letzten Audit-/PR-Strängen sind im aktuellen Dokumentationsstand berücksichtigt: defensive Remote-Revisionsgrenze, sichere Kosten-/Centaggregation, CI-Artefakt-Parität, Sicherheits-/Release-Gates, Legacy-Backup-Erhaltung und der gemeinsame Mittagessen-/Abendessen-Regressionstest.
- Die aktuellen Grenzen bleiben unverändert: keine automatische Offline-Queue, keine produktive IST-/Belegerfassung, kein Vorratsverbrauch, keine automatische Mehrstopp-/Routingempfehlung, keine SQL-/Supabase-Migration für `manualDinnerPlan` und keine produktive D1-Nutzung ohne unabhängige Gateway-/Header-Verifikation.
- Der nächste fachliche Schritt ist keine weitere autonome Daten- oder Cloudänderung. Vor produktiver Erweiterung sind die jeweils gebündelten Freigaben und externen Verifikationen aus diesem Dokument maßgeblich.

Der Prüfstand ändert keine Runtime, Nutzerdaten, Supabase-/SQL-/Auth-Konfiguration, Secrets oder Deployments.

## Fortschritt 09.11.2026 – Parser-Härtung für deutsche Preisbeträge

- PR #278 wurde in Merge-Commit `bcaa0a3f26afd3082af0080a9011684dba413f40` integriert. Negative und mehrdeutige Preis-Tokens werden verworfen; deutsche Tausender- und Dezimalbeträge bleiben erhalten; Grundpreise werden nicht als Angebotspreise übernommen.
- CI #42599370232 bestätigte 309 erfolgreiche Tests sowie grüne Worker-, Artefakt- und Endpoint-Prüfungen. Der Deploy-Schritt wurde übersprungen.
- Die Änderung ist rein parser- und testbezogen. Es gab keine Runtime-, Supabase-, SQL-, Auth-, Daten- oder Deploymentänderung.

## Security-Audit 09.11.2026 – veröffentlichbare Dateien

- Gegen `main@9f81650645046022207e69b28640d1dd6b620d2e` wurden 42 veröffentlichbare Root-/`dist`-/Worker-/Workflow-Dateien statisch geprüft.
- Es wurden keine privaten Schlüssel, `service_role`/`sb_secret`, Tokens, langen Secret-Literale oder privaten/lokalen Endpunkte gefunden. Der erwartete Workflow-Verweis `KAUFDA_STORAGE_STATE_B64` bleibt eine GitHub-Secret-Eingabe und wird nicht veröffentlicht.
- Der Audit war rein dokumentarisch; Runtime, Supabase, Daten, Auth und Deployment blieben unverändert. Es wurde kein Code-PR erstellt.

## Dependency-/Workflow-Audit 09.11.2026

- Gegen `main@b62fd7ac8a142cdadbc703bed3d1c400f4b659c3` wurden die Paket-/Lockfile-Lage und alle fünf GitHub-Workflows statisch geprüft. Es gibt kein Paket- oder Lockfile; die veröffentlichte Runtime enthält keine unerwartete neue Paketabhängigkeit.
- Die Automationsläufe installieren `playwright` und einmal `pdf-parse` mit `npm install --no-save` ohne feste Version/Lockfile. Die offiziellen Actions werden nur über mutable Major-Tags wie `@v4`/`@v5` referenziert. Das sind reproduzierbare Supply-Chain-/Reproduzierbarkeits-Hardeningpunkte, aber kein im Audit reproduzierter Schadensfall.
- Es wurden keine neuen kostenpflichtigen Dienste gefunden. Es erfolgte kein Upgrade, keine externe Änderung und kein Code-PR; die Befunde bleiben für eine spätere gebündelte Hardening-Entscheidung dokumentiert.

## Fortschritt 09.11.2026 – zukünftige Angebotszeitpunkte

- PR #283 wurde nach grüner CI in Merge-Commit `9d3ad2b7af038f7ec0b41d56b3da1173dd1c5e9d` integriert. Ein `fetchedAt`-Zeitpunkt in der Zukunft wird nun sowohl durch den Snapshot- als auch den Frontend-Validator verworfen.
- Die synthetischen Datumsgrenztests und CI #42604666498 waren grün; Worker-Build, Artefakt- und Endpoint-Prüfungen liefen erfolgreich, der Deploy wurde übersprungen.
- Keine Supabase-, Daten-, Auth- oder Deploymentänderung.


## Fortschritt 09.11.2026 – Mengenparser für deutsche Gruppierung

- PR #285 wurde nach grüner CI in Merge-Commit `81a1a3034d79f21f36758745bf56725591e48688` integriert. Der Audit reproduzierte, dass `1.000 g Mehl` im Mengenparser als `1 g` interpretiert wurde; Rezeptmengen und Angebots-Packungsgrößen verarbeiten deutsche Tausender- sowie gemischte Dezimalangaben nun korrekt.
- Regressionstests, Worker-Build, generiertes Artefakt-Gate und Endpoint-Validierung waren in CI #42605779628 erfolgreich; der Deploy wurde übersprungen.
- Keine Supabase-, SQL-, Auth-, Nutzer-/Angebotsdaten-, Preis- oder Deploymentänderung.


## Fortschritt 09.11.2026 – Packungsrundung an Grenzwerten

- PR #287 wurde nach grüner CI in Merge-Commit `fde374a05bc4b6a653c221c3aeabd976251d9f26` integriert. Der Anschlussaudit reproduzierte, dass die feste `1e-9`-Toleranz echten Überbedarf unterschlug: `1000.0000001 g` bei einer 500-g-Packung ergab 2 statt 3 Packungen.
- Die Rundung nutzt nun ein skaliertes `Number.EPSILON`-Fenster, das nur IEEE-754-Rauschen absorbiert. Regressionstests decken exakte Grenze, knappen Überbedarf, Dezimalverhältnisse, Stück und inkompatible Einheiten ab; CI #42606542412 war vollständig grün.
- Keine Supabase-, SQL-, Auth-, Nutzer-/Angebotsdaten-, Preis- oder Deploymentänderung.


## Fortschritt 09.11.2026 – inkompatible Rezeptmengen im Einkaufsfluss

- PR #289 wurde nach grüner CI in Merge-Commit `d4762d21d0417feca9b96691653616814b85b02c` integriert. Der End-to-End-Audit reproduzierte, dass `500 g Öl` aus dem Mittagessen und `1 l Öl` aus dem Abendessen zuvor still in einer Einkaufsposition zusammengelegt wurden.
- Inkompatible explizite Einheitenfamilien bleiben nun getrennt; kompatible `g/kg`- und `ml/l`-Mengen aggregieren weiterhin. Die Regressionstests und CI #42608250639 waren vollständig grün; der Deploy wurde übersprungen.
- Keine Supabase-, SQL-, Auth-, Nutzer-/Angebotsdaten-, Preis- oder Deploymentänderung.


## Fortschritt 09.11.2026 – konservative Angebotszuordnung

- PR #291 wurde nach grüner CI in Merge-Commit `996c1c6a8929104bab99c5622766b0832222e55d` integriert. Der Audit reproduzierte, dass ein explizites `500 g Hackfleisch` bisher ein gleichnamiges `1 l`-Angebot sowie eine unbekannte `1 Packung`-Größe matchen durfte.
- Explizite Rezeptmengen matchen nun nur Angebote derselben Mengenfamilie; unbekannte oder fehlende Packungsgrößen werden konservativ ausgeschlossen. Textuelle Zutaten ohne explizite Einheit behalten das Namensmatching. Regressionstests und CI #42609169843 waren vollständig grün; der Deploy wurde übersprungen.
- Keine Supabase-, SQL-, Auth-, Nutzer-/Angebotsdaten-, Preis- oder Deploymentänderung.


## Audit 09.11.2026 – Einkaufsstatus und Vorratsbestand

- Der End-to-End-Audit gegen `main@ce5786f5ac36f9499c44038112b0bfd500b6ef37` fand keinen unzulässigen Bestandsabzug. Abhaken, „Alles abhaken“, Zurücksetzen und Aktualisieren ändern ausschließlich `shoppingChecks`; `applyPantryCoverageToShoppingItems` und der Mengenabgleich mutieren keine Vorratsdaten.
- Teilbestände bleiben erhalten und werden nur als Deckung bzw. Restbedarf ausgewiesen. Unbekannte, ungültige oder inkompatible Mengen bleiben konservativ offen und werden nicht still reduziert. Die bestehenden Coverage- und Supabase-Sync-Tests bestätigen Vorrats-/Lokaldatenerhalt sowie Bestätigung vor Cloud-Übernahme.
- Eine explizite Kaufbestätigung mit Verbrauchsbuchung existiert derzeit nicht. Der Vorratsverbrauch bleibt damit bewusst offen und darf nicht aus einem Listen-Haken, Planen, Laden oder Offline-Sync abgeleitet werden. Kein Code-PR, keine Supabase-, Daten-, Preis-, Angebots- oder Deploymentänderung.


## Audit 09.11.2026 – Packungsgrößen im Angebotsvergleich

- PR #295 wurde in Merge-Commit `b984d7122546b2d4f51715b1fef8fd15f77e13aa` integriert. Der Angebotsvergleich interpretierte deutsche Gruppenschreibweisen wie `1.000 g` zuvor als `1 g`; dadurch konnten unterschiedlich große Packungen im Tie-Break gleichgesetzt werden.
- `parseKnownPackageSize` normalisiert nun deutsche Tausender- und gemischte Dezimal-Packungsgrößen deterministisch. Regressionen für `1.000 g`, `1.234,56 g` und `2 x 1.000 ml` sichern den Pfad; CI #42611276092 war vollständig grün (321 Tests, Worker-Artefakt und Endpoint-Validierung).
- Keine Preis- oder Angebotsdaten, Nutzerdaten, Supabase-/Datenbankverträge oder Deployments wurden fachlich geändert.


## Audit 09.11.2026 – Evidenzgrenze für bekannte Angebotskosten

- PR #297 wurde in Merge-Commit `7ad6add32c94c7b3dd3f5e8bbf243e0bf95e02f2` integriert. Manuelle, abgelaufene, unsichere und Cache-Fallback-Angebote konnten zuvor trotz Nichtverifizierung in bekannte Angebots-Teilbeträge eingehen.
- Der deterministische Kostenpfad zählt nun nur aktuelle, HTTPS-quellenbelegte, gültige und hoch-konfidente Live-Angebote als bekannt; alle anderen Angebote bleiben `unknown` und werden separat sichtbar gehalten. CI #42612829175 bestätigte 321 Tests sowie Worker- und Endpoint-Prüfungen.
- Keine Preis- oder Angebotsdaten, Nutzdaten, Supabase-/Datenbankverträge oder Deployments wurden geändert.

## Read-only-Audit 09.11.2026 – Marktvergleich und Routenpfad

- **Ist-Befund:** Die App nutzt pro Markt statische Anzeigeentfernungen aus `marketDetails`, sortiert damit die ausgewählten Märkte und begrenzt die aktive Auswahl über `marketsSelect`. Das ist eine Darstellungs-/Auswahlhilfe, keine Routenberechnung.
- **Nicht vorhanden:** Keine echte Mehrstopp-Routenoptimierung, keine Fahrtkostenberechnung, kein regulärer Warenkorbvergleich über Märkte und keine automatische zusätzliche-Stopp-Empfehlung in der UI. Der vorhandene `market-stops.js`-Kern bleibt ein isolierter, deterministischer Rechenkern und wird nicht mit Strecken- oder Kartendaten versorgt.
- **Konservativer Datenumgang:** Fehlende, nichtnumerische oder nicht belegte Entfernungs-/Kostenwerte dürfen nicht als null oder als Ersparnis behandelt werden. Angebotsauswahl und Kostenmodell bleiben auf validierte, aktuelle Daten beschränkt; unbekannte Werte bleiben offen.
- **Freigabe erforderlich:** Vor einer produktiven Erweiterung sind Verkehrsmittel, Strecke, Parken, Fahrtkostenquelle, Marktzuordnung, Nettoersparnisschwelle sowie UI-, Offline- und Sync-Verhalten festzulegen. Karten-, Geocoding-, Routing- oder sonstige externe Cloud-Dienste werden ohne gesonderte Freigabe nicht eingeführt.

Dieser Audit änderte keine Angebote, Nutzer-/Haushaltsdaten, Supabase-/Schema-Daten, Deployments oder kostenpflichtigen Ressourcen.


## Fortschritt 09.11.2026 – deterministische Marktsortierung

- PR #301 ist in Merge-Commit `611dcadb49963e5587d91e415cea072763706b4b` enthalten. Bekannte numerische Anzeigeentfernungen werden aufsteigend sortiert; unbekannte oder nichtnumerische Werte bleiben konservativ am Ende, Gleichstände bewahren die konfigurierte Reihenfolge.
- CI #42615733985 bestätigte 325/325 Tests sowie den generierten Worker-Artefaktvergleich und die Endpoint-Validierung. Der Deploy-Schritt blieb übersprungen.
- Keine Angebote, Nutzer-/Haushaltsdaten, Supabase-/Schema-Daten, Deployments oder kostenpflichtigen Ressourcen wurden verändert.
- Der nächste Runtime-Schritt bleibt der gebündelt freizugebende lokale Dialog „Einkauf abschließen“ mit manueller IST-Summe, Datum und optionalem Markt; zunächst ohne Pantry-Verbrauch, Cloud-/Backup-/OCR-Erweiterung oder automatische Preisübernahme.
## Kleine UX-Klarstellung 09.11.2026 – statische Marktdistanzen

- Marktlisten kennzeichnen numerische Entfernungen jetzt ausdrücklich als „statische Anzeigeentfernung“.
- Nichtnumerische Werte wie `Cloud-Browser` werden als „keine Routendaten“ angezeigt und nicht als Entfernung, Nullwert oder Fahrtkostenbasis dargestellt.
- Regressionstests prüfen Root-/Dist-Parität und beide Anzeigevarianten. Keine Routen-, Karten-, Angebots-, Nutzer-, Supabase- oder Deploymentänderung.

## CI-Sicherheitsgrenze 09.11.2026 – Kaufbuchung bis Freigabe

- Ein zusätzlicher Regressionstest prüft, dass weder die App-Runtime noch der Sync-Adapter vor der gebündelten Produktfreigabe einen `purchaseRecords`-Schreibpfad enthält.
- Die Prüfung verändert keine Runtime und führt keine Datenfelder ein; sie schützt nur die bestehende Grenze zwischen Listenstatus und tatsächlicher Kauf-/Verbrauchsbuchung.

## Fortschritt 09.11.2026 – gruppierte Angebots-Packungsgrößen

- Der zentrale Mengenparser behandelt `2 x 500 g`, `2 × 1.000 ml` und gruppierte Stückpackungen jetzt als Gesamtpackungsmenge. Zuvor konnte die Packungsgröße auf die erste Zahl verkürzt werden und dadurch den Packungsbedarf verfälschen.
- Root-/`dist`-Mengenmodul und Regressionstests bleiben synchron. Keine Angebotsdaten, Nutzerdaten, Supabase-, Verbrauchs- oder Deploymentänderung.


## Fortschritt 09.11.2026 – Volumenparser synchronisiert

Der Audit fand eine echte Drift: `parseKnownPackageSize` kann `cl`/`dl` bereits auf `ml` normalisieren, während der zentrale Angebotsparser diese Einheiten beim Matching ablehnte. Der gemeinsame Parser unterstützt beide Schreibweisen nun ebenfalls einschließlich gruppierter Packungen; CI soll die Root-/`dist`-Parität und die deterministische Normalisierung absichern. Keine Angebots-, Nutzer-, Supabase-, SQL-, Verbrauchs- oder Deploymentänderung.


## Fortschritt 09.11.2026 – Regression für atomaren Cloud-Load

Der read-only Sync-Härtungsblock ergänzt einen Test für den bislang nur indirekt abgesicherten Fehlerpfad beim Anwenden eines bestätigten Cloud-Stands. Erst nach erfolgreichem `applyPayload()` dürfen Haushaltsbindung und Revision geschrieben werden; bei einem lokalen Fehler bleibt der lokale Zustand unverändert. Es wurden keine Runtime-, Supabase-, SQL-, Daten- oder Deploymentverträge geändert.


## Fortschritt 09.11.2026 – bekannte Packungspreise bleiben eindeutig

Der Preisparser-Audit bestätigte die bestehende Regel: Nur ein eindeutiger positiver Euro-Packungspreis darf in bekannte Angebotsbeträge eingehen; Grundpreise, negative oder mehrdeutige Tokens bleiben unbekannt. Die Regressionen sichern diesen Vertrag für Root und `dist`; keine Runtime- oder Datenänderung.


## Fortschritt 09.11.2026 – Transparenz bei Teilbeständen

Der bestehende lokale Vorratsabgleich wird im Einkaufsartikel sichtbar: Bei teilweiser Deckung werden gedeckter Anteil und verbleibender Bedarf angezeigt. Vollständig gedeckte, unbekannte oder inkompatible Positionen behalten ihre bisherigen konservativen Regeln. Es wurden keine Vorrats-, Nutzer-, Supabase-, SQL-, Backup-, Sync- oder Deploymentverträge geändert.


## Dokumentationsabgleich 09.11.2026 – Status präzisiert

Die früheren Ausgangslisten werden durch den aktuellen Fortschritt ergänzt: Lokale Budgettransparenz, Mengen-/Packungsberechnung und lesender Vorratsabgleich sind umgesetzt. Die gebündelte Freigabe für Kaufabschluss, tatsächliche IST-Ausgaben und Verbrauchsbuchung bleibt unverändert erforderlich; diese Dokumentationskorrektur erteilt keine Produkt-, Daten- oder Cloudfreigabe.


## Fortschritt 09.11.2026 – Mengen auch ohne Angebotsanker sichtbar

Der Einkaufslisten-UI zeigt eine explizite, bereits berechnete Rezeptmenge auch dann, wenn kein verifiziertes Angebot vorhanden ist. Damit bleibt der Einkaufsbedarf handlungsfähig, ohne Preise, Packungsgrößen oder Mengen zu erfinden; bei Teildeckung bleibt die Restbedarfsanzeige maßgeblich. Keine neue Freigabe erforderlich.


## Audit 10.11.2026 – Personen je Planungstag abgesichert

Die bestehende Mittag-/Abendessen-Aggregation wurde gegen eine Tagesindex-Regression abgesichert: Leere frühere Abendessenplätze verschieben die Personenzahl eines späteren Abendessens nicht. Der Testblock benötigt keine neue Freigabe.

## Neue gebündelte Notiz 10.11.2026

- Ungültige lokale Refresh-Zeitstempel werden sicher verworfen; der bestehende Ablauf für belegte Angebotsgültigkeit und Cache-Fallback bleibt maßgeblich.
- Keine Supabase-, Datenbank-, Produktions- oder kostenpflichtige Änderung erforderlich.

## Gebündelte Notiz 10.11.2026 – Cache-Zeitstempel

- Die Refresh-Entscheidung verwirft jetzt sowohl ungültige `nextCheckAt`- als auch `fetchedAt`-Werte sicher.
- Keine neue Freigabe erforderlich; keine Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Gebündelte Notiz 10.11.2026 – verifizierter Angebotsanteil

- Die Kennzahl ist rein lesend und deterministisch; tatsächliche Ausgaben, Kaufbestätigungen und Vorratsverbrauch bleiben unverändert gesperrt.
- Keine neue Freigabe erforderlich; keine Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Statusabgleich 10.11.2026 – Kostenmodell

- PR #316 ist gemergt; der verifizierte Angebotsanteil ist rein lesend und benötigt keine zusätzliche Freigabe.
- Der Kaufabschluss-Gate aus Punkt 9 bleibt unverändert offen. Keine automatische IST-Erfassung, Vorratsbuchung, Supabase-Änderung oder Produktionsfreigabe.

## Gebündelte Notiz 10.11.2026 – Marktgruppen

- Die Marktgruppensummen sind rein lesend und deterministisch; keine neue Freigabe erforderlich.
- Keine Angebotsdaten, Nutzerdaten, Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Gebündelte Notiz 10.11.2026 – Vorratsanzeige

- Die Änderung betrifft nur die lokale Anzeigezählung und benötigt keine neue Freigabe.
- Keine Vorratsmutation, Verbrauchsbuchung, Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Gebündelte Notiz 10.11.2026 – Zutatenidentität

- Die kanonische Deduplizierung benötigt keine neue Freigabe.
- Keine Vorrats-, Verbrauchs-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Gebündelte Notiz 10.11.2026 – Zeitstempelanzeige

- Die Änderung ist rein lesend und benötigt keine neue Freigabe.
- Keine Angebots-, Nutzer-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Gebündelte Notiz 10.11.2026 – Quell-Snapshot

- Die Evidenzprüfung ist rein lesend und benötigt keine neue Freigabe.
- Keine Angebots-, Nutzer-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Gebündelte Notiz 10.11.2026 – Plan-/Rezeptkosten

- Die Änderung ist rein berechnend und benötigt keine neue Freigabe.
- Keine Angebots-, Nutzer-, Kauf-, Vorrats-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.

## Prüfstand 10.11.2026 – historische Planvorlagenkosten

- Die alten Demo-/Vorlagenobjekte enthalten weiterhin statische `cost`-Felder, damit bestehende Planvorlagen und Datenstruktur erhalten bleiben.
- Für echte Vorschläge überschreibt `suggestionAsMeal()` diese Werte ausschließlich mit dem zentral berechneten Angebotsanteil und seiner Herkunft.
- Fallback-Gerichte neutralisieren die Vorlage mit `cost: ''` und `costSource: 'unknown'`; die Plananzeige akzeptiert Kosten nur bei `offer-subtotal` und parsebarem Betrag.
- Ein Regressionstest schützt diesen Vertrag. Es wurden keine Angebots-, Nutzer-/Haushalts-, Supabase-/Schema-Daten oder Produktionsressourcen verändert.
- Nächster sicherer Schritt: weitere deterministische Warenkorb-/Marktvergleichslücken prüfen. Der verbindliche Kaufabschluss mit IST-Beträgen bleibt ein späterer Freigabepunkt.

## Audit 10.11.2026 – Angebotsnachlass bleibt transparent

- Das Feld `saving` wird nicht als regulärer Vergleichspreis oder berechnete Ersparnis verwendet.
- Ohne aktuelle, quellenbelegte und nichtmanuelle Evidenz zeigt die App `Vergleichspreis nicht belegt`.
- Bei belastbarer Herkunft wird der Wert ausschließlich als unveränderte Quellenangabe mit dem Hinweis `nicht berechnet` angezeigt.
- Ein Regressionstest schützt diese Grenze. Keine Angebots-, Nutzer-, Supabase-, Produktions- oder Kostenänderung.

## Fortschritt 10.11.2026 – explizite reguläre Vergleichspreise

- Angebotsparser übernehmen einen regulären Vergleichspreis nur bei einer ausdrücklichen Quellenformulierung wie „statt“, „vorher“, „Normalpreis“ oder „UVP“ mit eigenem Eurobetrag.
- Der aktuelle Angebotspreis muss ebenfalls explizit vorhanden sein; ein Vergleichspreis wird verworfen, wenn er nicht höher ist oder nur aus einer Prozentangabe abgeleitet werden müsste.
- Snapshot-Validierung und Parser-Regressionen verhindern, dass der alte Vergleichspreis als aktueller Angebotspreis eingeht.
- Die App zeigt den regulären Quellenpreis nur bei aktueller, nichtmanueller und belegter Angebots-Evidenz; Kassen- und reguläre Vergleichspreise bleiben getrennt.
- Keine vorhandenen Angebots-, Nutzer-, Supabase- oder Produktionsdaten wurden verändert. Die tatsächliche Mehrmarktoptimierung und Fahrtkostenschwelle bleiben freigabepflichtig.

## Fortschritt 10.11.2026 – getrennte reguläre Vergleichssummen

- Der Kostenkern berechnet für ausdrücklich belegte Vergleichspreise zusätzlich den regulären Packungsanteil und die rechnerische Differenz in Cent.
- Angebotsbetrag, regulärer Vergleichsanteil und Kassenbetrag bleiben getrennt; unbekannte Vergleichspreise werden nicht als 0 € behandelt.
- Einkaufsliste, Teilen und Marktgruppen zeigen die Vergleichssumme nur für verifizierte, passende Angebotspreise; die Differenz ist kein bestätigter Kassenrabatt.
- Die aktuelle Umsetzung benötigt keine Nutzer-, Supabase-, Schema- oder Produktionsänderung. Eine vollständige reguläre Vergleichsbasis bleibt abhängig von den tatsächlich gelieferten Quellpreisen.

## Audit 10.11.2026 – zusätzlicher Markt benötigt einen Ausgangsmarkt

- Der deterministische Marktstopp-Kern gibt bei leerer Auswahl bestehender Märkte nun konservativ "unknown" zurück.
- Ohne Ausgangsmarkt werden weder Ersparnis, Fahrtkostenbasis noch ein zusätzlicher Stopp angenommen.
- Die Korrektur ändert keine Markt-, Nutzer-, Supabase- oder Produktionsdaten; die Nettoersparnisschwelle bleibt weiterhin ausdrücklich freigabepflichtig.

## Fortschritt 10.11.2026 – Vergleichspreis-Vertrag je Händlerquelle

Die Händlerparser verwenden denselben konservativen Vertrag für reguläre
Vergleichspreise. Das Feld regularPrice wird nur übernommen, wenn die Quelle
einen Vergleichspreis ausdrücklich mit statt, vorher, regulär, Normalpreis
oder UVP und einem Eurobetrag nennt. Prozentangaben werden nicht
zurückgerechnet. Regressionstests decken Aldi, Kaufland, EDEKA und Netto ab;
Angebotsdateien, Nutzerdaten, Supabase und Produktivbetrieb bleiben unverändert.

## Fortschritt 10.11.2026 – Händlervergleichspreise vollständig geprüft

PR #329 deckt den optionalen Vergleichspreis-Vertrag für Aldi, Kaufland,
EDEKA und Netto ab. CI bestätigte 356/356 Tests, Worker-Build und
Endpunktprüfung; der Deploy-Job blieb übersprungen. Es wurden keine
Angebotsdateien, Nutzerdaten, Supabase-Daten oder Produktionsressourcen
verändert.

## Fortschritt 10.11.2026 – Preisverlauf bewahrt Vergleichspreise

Der KaufDA-Preisverlauf speichert ausdrücklich belegte reguläre
Vergleichspreise nun optional mit der historischen Beobachtung. Die Änderung
ist rückwärtskompatibel für ältere Einträge ohne dieses Feld und bleibt ohne
Supabase-, Nutzer-, Angebotsdaten- oder Produktionsänderung.

## Fortschritt 10.11.2026 – konservative Marktangebotsauswahl

PR #334 sichert die Laufzeitregel für konkurrierende Angebote ab:
Relevanz bleibt vorrangig; ein Preisvergleich erfolgt nur bei gleicher,
sicherer Packungsgröße und explizit parsebaren Preisen. Unklare Größen oder
Preise erzeugen keine künstliche Rangfolge. Die zusätzliche
Mehrstopp-/Fahrtkostenoptimierung bleibt ausdrücklich freigabepflichtig.
Keine Angebots-, Nutzer-, Supabase- oder Produktionsdaten wurden verändert.

## Fortschritt 10.11.2026 – synthetischer Einkaufsfluss

Der freigegebene lokale Kern ist jetzt zusätzlich als End-to-End-Test
abgesichert: Mittagessen und optionales Abendessen, Teilvorrat,
Packungsrundung sowie Angebots- und reguläre Vergleichssumme werden in einem
synthetischen Szenario gemeinsam geprüft. Keine Nutzer-, Kauf-, Supabase- oder
Produktionsdaten werden verwendet.

## Fortschritt 10.11.2026 – unbekannte Vergleichs-Centwerte

Die getrennte Vergleichssumme verwendet bei fehlenden oder ungültigen
Vergleichspreisen jetzt `null` in allen Summenfeldern, einschließlich der
Centfelder. Damit bleibt „unbekannt“ von `0 €` unterscheidbar. Keine Nutzer-,
Angebots-, Supabase- oder Produktionsdatenänderung.

## Dokumentationsabgleich 10.11.2026 – regulärer Vergleich nicht mehr als Gate

Veraltete Auditformulierungen wurden entfernt oder präzisiert. Der reguläre
Vergleich bleibt eine getrennte, quellenbelegte Berechnung; offen bleiben der
vollständige Kassen-/IST-Fluss sowie Fahrtkosten- und Routingentscheidungen.


## Sicherheitskorrektur 10.11.2026 – unbekannte Zielgruppe im generischen Import

- Der generische Schema.org-Rezeptimport setzt fehlende Familienangaben nicht mehr automatisch auf `true`.
- Favoriten mit gleichem Namen wie ein eingebautes Rezept erben bei fehlender eigener Angabe keinen Familienstatus mehr.
- Regression, Root-/`dist`-Parität und Worker-Artefakt werden mitgeprüft.
- Kein Freigabepunkt ausgelöst: keine Nutzer-, Angebots-, Vorrats-, Supabase-, Datenbank- oder Produktionsänderung.


## Sicherheitskorrektur 10.11.2026 – vollständige Rezeptdauer

- Der generische Rezeptimport verarbeitet `PT1H30M`, `1 Std. 30 Min.` und vergleichbare Angaben vollständig; die bisherige Verkürzung auf die erste Zahl ist entfernt.
- Regression, Root-/`dist`-Parität und Worker-Bundle werden geprüft.
- Kein Freigabepunkt ausgelöst: keine Nutzer-, Angebots-, Vorrats-, Kassen-, Supabase-, Datenbank- oder Produktionsänderung.


## Sicherheitskorrektur 10.11.2026 – Worker-Parität beim Rezeptimport

- Der serverseitige Rezeptimport hatte noch den alten Erstzahl-Dauerparser und setzte fehlende Familienangaben pauschal auf `true`; beides ist korrigiert.
- Der Endpoint-Test prüft jetzt `PT1H30M = 90` Minuten und das Fehlen eines erfundenen Familienstatus.
- Kein Freigabepunkt ausgelöst: keine Nutzer-, Angebots-, Vorrats-, Kassen-, Supabase-, Datenbank- oder Produktionsänderung.


## Sicherheitskorrektur 10.11.2026 – unbekannte Favoritenmetadaten

- Der Seed-Abgleich ergänzt fehlende persönliche Rezeptdauer und Schwierigkeit nicht mehr automatisch.
- Eine Regression schützt den unbekannten Zustand und die Root-/`dist`-Parität.
- Kein Freigabepunkt ausgelöst: keine Nutzer-, Angebots-, Vorrats-, Kassen-, Supabase-, Datenbank- oder Produktionsänderung.


## Sicherheitskorrektur 10.11.2026 – Vegetarisch-Metadaten

- Fehlende Vegetarisch-Angaben aus generischen Rezeptimporten werden nicht mehr implizit als `false` gespeichert.
- Der Endpoint-Test prüft unbekannte und ausdrücklich vegetarische Quellenangaben; Root-/`dist`-Parität bleibt geschützt.
- Kein Freigabepunkt ausgelöst: keine Nutzer-, Angebots-, Vorrats-, Kassen-, Supabase-, Datenbank- oder Produktionsänderung.


## Qualitätsaudit 10.11.2026: Packungsgrößen

- Kein Freigabepunkt ausgelöst: Die Änderung macht unbekannte Packungsgrößen sichtbar, ohne Nutzer-, Angebots-, Supabase- oder Produktionsdaten zu verändern.
- Weiterhin offen bleiben Kaufabschluss, Cloud-Datenübernahme, Konfliktzusammenführung, Haushaltsrollen, KI-/Kostenanbieter und zusätzliche Marktstopps.


## Qualitätsaudit 10.11.2026: Angebots-Match-Evidenz

- Kein Freigabepunkt ausgelöst: Die Änderung entfernt unbelegte Prozentbehauptungen aus der Anzeige und lässt die interne Rangfolge unverändert.
- Keine Supabase-, Nutzer-, Angebots-, Preis- oder Produktionsdaten wurden geändert.


## Qualitätsaudit 10.11.2026 – Mengen-/Packungs-Evidenz

- Kein neuer Freigabepunkt: Die Änderung betrifft ausschließlich eine lokale, deterministische Kostenvalidierung und hält unklare Beträge unbekannt.
- Kaufabschluss, IST-Ausgaben, Verbrauchsbuchung, Supabase-Schema/Rollen/Sync-Konflikte, KI-/Kostenanbieter und zusätzliche Marktstopps bleiben weiterhin gesammelt freigabepflichtig.
- Keine Nutzer-, Angebots-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Qualitätsaudit 10.11.2026 – Vergleichspreis an Mengen-Evidenz gebunden

- Kein neuer Freigabepunkt: Die Änderung ist eine lokale, deterministische Anzeigevalidierung im bestehenden Kostenpfad.
- Bei expliziten Rezeptmengen wird ein regulärer Vergleichspreis nicht angezeigt, wenn das Angebots-Packmaß die benötigte Mengenfamilie nicht belegt.
- Keine Nutzer-, Angebots-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Dokumentationsabgleich 10.11.2026 – lokaler Vorratsabgleich ist read-only integriert

- Die lokale Vorratsdeckung ist bereits in getShoppingItems() eingebunden und verändert weder Vorrat noch pantryQuantities; die frühere Formulierung „produktive Einkaufslistenintegration bleibt Freigabepunkt 1“ wird insoweit als historischer Vorbereitungsstand präzisiert.
- Freigabepflichtig bleiben die tatsächliche Verbrauchsbuchung, Reservierung, neue Daten-/Backup-/Cloud-/Supabase-Verträge sowie automatische Entscheidungen mit Nutzerdatenwirkung.
- Keine Code-, Nutzer-, Angebots-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – Kaufmonat validiert

- Kein neuer Freigabepunkt: Der lokale Vorbereitungsvalidator akzeptiert keine Kalenderangabe mit Jahr 0000.
- Keine Nutzer-, Kauf-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – Abendessen-Kostenparität

- Kein neuer Freigabepunkt: Die Änderung gleicht nur die bestehende Anzeigeprüfung für Mittagessen und optionales Abendessen an.
- Keine Nutzer-, Kauf-, Vorrats-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – zentraler Plan-Kostenrenderer

- Kein neuer Freigabepunkt: Die Änderung vereinheitlicht nur die lokale Anzeigeprüfung für Mittagessen und Abendessen.
- Keine Nutzer-, Kauf-, Vorrats-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – sichere Geldgrenzen

- Der gemeinsame UI-Geldparser verwirft positive Beträge mit nicht sicher
  darstellbarem Centwert.
- Der Euro-Formatter zeigt negative oder nicht sicher darstellbare Werte nicht
  als Preis an und rundet bekannte Werte deterministisch auf Cent.
- Regression, Root-/dist-Parität und Worker-Artefakt werden durch CI geprüft.
- Kein neuer Freigabepunkt: keine Nutzer-, Angebots-, Kauf-, Vorrats-,
  Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – manuelle Grundpreise

- Der manuelle Angebotsimport verwirft Grundpreisangaben, wenn kein belastbarer
  Packungspreis vorliegt.
- Explizite Euro-Packungspreise bleiben unverändert nutzbar.
- Kein neuer Freigabepunkt: keine Nutzer-, Angebots-, Kauf-, Vorrats-,
  Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – KaufDA-Grundpreise

- Grundpreis-Ausdrücke werden vor der KaufDA-OCR-/Kartenpreiswahl entfernt.
- Der echte, explizite Angebotspreis bleibt als Preisquelle erhalten.
- Kein neuer Freigabepunkt: keine Nutzer-, Angebots-, Kauf-, Vorrats-,
  Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – KaufDA-Preisparser

- Grundpreisangaben mit Gleichheitszeichen oder Einheiten nach dem Eurobetrag
  werden vor der KaufDA-Preiswahl entfernt.
- Ein echter nachfolgender Angebotspreis bleibt verwendbar; alleinige
  Grundpreise bleiben unbekannt.
- Kein neuer Freigabepunkt: keine Nutzer-, Angebots-, Kauf-, Vorrats-,
  Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – Grundpreisbehandlung aller Angebotsparser

- Händler- und Lidl-Parser entfernen Grundpreise sowohl vor als auch nach dem
  Eurobetrag vor der Angebotspreiswahl.
- Echte nachfolgende Angebotspreise bleiben erhalten; Grundpreise allein werden
  nicht veröffentlicht.
- Kein neuer Freigabepunkt: keine Nutzer-, Angebots-, Kauf-, Vorrats-,
  Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Testhärtung 10.11.2026 – Grundpreis-Schreibweisen

- Die Parser-Regressionen prüfen /, pro, je und per sowie alleinstehende Grundpreisangaben.
- Kein neuer Freigabepunkt: Es wurden nur Tests und Dokumentation ergänzt.
- Kaufabschluss/IST-Betrag, Verbrauchsbuchung, Mehrstopp-Fahrtkosten, Supabase-Datenänderungen und Produktionsänderungen bleiben unverändert freigabepflichtig.


## Read-only-Audit 10.11.2026 – aktuelle Marktangebotsanzahl

- Die Marktansicht und die Marktauswahl zählen jetzt dieselben aktuellen, gültigen Nicht-Demo-Angebote.
- Kein neuer Freigabepunkt: Es wurden keine Preise, Nutzer-, Kauf-, Vorrats-, Supabase-, Routing- oder Produktionsdaten geändert.
- Fahrtkosten, Routenoptimierung und automatische Mehrstoppentscheidungen bleiben weiterhin freigabepflichtig.


## Fortschritt 10.11.2026 – Vergleichssumme beim Teilen

- Die geteilte Einkaufsliste zeigt den belegten regulären Vergleichsanteil und die rechnerische Differenz getrennt vom Angebotsbetrag.
- Unbekannte Vergleichspreise bleiben sichtbar; der Kassenbetrag bleibt ausdrücklich offen.
- Kein neuer Freigabepunkt: rein lesende Darstellung, keine Nutzer-, Kauf-, Vorrats-, Supabase-, Routing- oder Produktionsänderung.


## Dokumentationsabgleich 10.11.2026 – read-only Marktvergleich abgeschlossen

- Marktangebotsanzahl, konservative Angebotsauswahl, Vergleichssummen und
  unbekannte Werte sind read-only geprüft und getestet.
- Der nächste größere Schritt ist der verbindliche Kaufabschluss mit IST-/Belegbetrag
  und Verbrauchs-/Reservierungsvertrag; dafür ist weiterhin eine gebündelte Freigabe nötig.
- Fahrtkosten/Routing, Mehrstoppentscheidung, automatische Cloud-Konflikte und
  weitere Supabase-Datenverträge bleiben unverändert freigabepflichtig.


## Sicherheitskorrektur 10.11.2026 – sichere Mengenobergrenze

- Rezept- und Angebots-Packmengen oberhalb von 1.000.000.000 Basiseinheiten werden vor Packungs- und Kostenberechnung als unbekannt behandelt; bestehende Daten werden nicht umgeschrieben.
- Kein neuer Freigabepunkt: Es wurden nur deterministische Validierung, Regressionstest und Dokumentation ergänzt. Keine Nutzer-, Vorrats-, Kauf-, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – sichere Vorratsbedarfsaggregation

- Summierte Mengenbedarfe oberhalb von 1.000.000.000 Basiseinheiten bleiben im read-only Vorratsabgleich unbekannt; einzelne gültige Positionen werden nicht zu einer unsicheren Großsumme verrechnet.
- Kein neuer Freigabepunkt: Es wurden nur Validierung, Regressionstest und Dokumentation ergänzt. Keine Vorratsbuchung, Verbrauchsreservierung, Kauf-/IST-Erfassung, Supabase-, Datenbank-, Produktions- oder Kostenänderung.


## Testhärtung 10.11.2026 – Rezepttitel im Zuordnungsdialog

- Ein Regressionstest sichert das bestehende Escaping persönlicher Rezepttitel im Zuordnungsdialog.
- Kein neuer Freigabepunkt: keine Laufzeit-, Daten-, Supabase-, Produktions- oder Kostenänderung.


## Sicherheitskorrektur 10.11.2026 – sichere Rezept- und Bildquellen

- Rezept- und Angebotsbild-URLs werden vor der Darstellung auf sichere HTTPS-Adressen ohne Zugangsdaten begrenzt.
- Kein neuer Freigabepunkt: Unsichere Links werden nur nicht angezeigt; es gibt keine Nutzer-, Daten-, Supabase-, Produktions- oder Kostenänderung.

## Sicherheitskorrektur – Favoritenquellen (10.11.2026)

- Der Favoriten-Link nutzt nun dieselbe zentrale HTTPS-/Zugangsdatenprüfung wie Rezeptdetail, Wochenplan und Angebotsbilder.
- Keine zusätzliche Freigabe erforderlich: keine Supabase-, Auth-, Nutzerdaten-, Angebotsdaten-, Migrations-, Deployment- oder Kostenänderung.
