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
- Das Ergebnis ist weiterhin nur ein Angebots-Zwischenwert, kein vollständiger Kassenbetrag. Reguläre Vergleichspreise, belastbare Vorratsmengen, bestätigte IST-Ausgaben und Fahrtkosten fehlen bewusst.
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
- PR #218 bleibt als verworfener, fehlerhafter API-Dateiupload offen und darf nicht gemergt werden. Der Ersatz-PR wurde mit exakt drei erwarteten PWA-Dateien, bytegenauem Remote-Abgleich und erfolgreicher CI erstellt und anschließend gemergt.
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
