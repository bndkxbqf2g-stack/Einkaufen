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
- Der Monatsbudget-/IST-Audit bestätigt, dass noch kein Budget-/Kaufmodell vorhanden ist. Die kleinste sichere spätere Etappe ist ein manueller Einkaufsgesamtbetrag in Cent mit Datum/Monat und optionalem Markt; `shoppingChecks` bleiben reine Checklisten. Vorher sind Gesamtbetrag je Einkauf oder Positionen mit echten Mengen/Preisen, Beleg/OCR, Geräte- oder Haushaltshistorie, Zeitraumdefinition und Fahrtkostenabgrenzung zu entscheiden.
- Beide Audits waren read-only: keine Produkt- oder Supabase-Änderung, keine Datenänderung und keine Umsetzung eines neuen Freigabepunkts.


## Koordinierter Arbeitsstand – 07.11.2026, Konzeptprüfungen Markt und IST-Budget

- Die Konzeptprüfung für eine spätere pure lokale Funktion `optimizeMarketSelection(input)` hält fest: Eingaben werden nur mit sicheren Centbeträgen, normalisierten Packungsgrößen und gültigen Angebotszeiträumen verarbeitet; fehlende, mehrdeutige oder abgelaufene Daten werden nicht zu 0 € oder einer Ersparnis gemacht. Einkaufsbetrag und Fahrtkosten bleiben getrennte Werte. Fehlen notwendige Daten, liefert die Funktion den Status `insufficient_data` mit nachvollziehbaren Gründen.
- Eine Mehrstopp-Variante darf nur bei überschrittener Nettoersparnisschwelle und innerhalb von `maxStops` empfohlen werden. Gleichstände werden deterministisch entschieden, z. B. Nettoersparnis absteigend, Fahrtkosten aufsteigend, weniger Stopps zuerst und anschließend stabile kanonische Markt-Reihenfolge. Die Umsetzung bleibt bis zur Entscheidung über Schwelle, Fahrtkostenbasis, Ausgangspunkt/Datenschutz, `maxStops`, reguläre Vergleichspreise und Routingdienst zurückgestellt.
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
- Kleinster nächster Entscheidungsschritt ist Freigabepunkt 8: Soll je Planungstag ein globaler optionaler Frühstücks-Slot ergänzt werden? Dieser Eintrag ist keine Freigabe. Keine Produkt-, Daten- oder Supabase-Änderung.

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
