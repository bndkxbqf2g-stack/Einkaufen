# Produktziel: Einkaufen / Angebotsküche

Stand der Bestandsanalyse: 06.11.2026
Stand Supabase-Anbindung (in main und auf GitHub Pages veröffentlicht): 06.11.2026

## Projektidentität und Abgrenzung

Dieses Dokument gehört zum Repository `site-source-4`. Der Beleg für das richtige Projekt ist:

- `README.md` trägt den Titel „Einkaufen / Angebotsküche“.
- Das Manifest nennt die App „Angebotsküche · Rezeptplaner aus lokalen Angeboten“.
- README und UI verweisen auf `https://bndkxbqf2g-stack.github.io/Einkaufen/`.
- Die letzten Commits behandeln Angebotsparser, Wochenplan, Favoriten, Rezeptimport und Rezept-Reader.
- Im Repository gibt es keinen Treffer für „SparzamApp“.

Die Bestandsanalyse bezieht sich ausschließlich auf dieses Projekt. Historische Ordner im übergeordneten Sammelverzeichnis und das separate, nicht versionierte `kaufda-parser`-Verzeichnis werden nicht als Bestandteil dieses Repositories gewertet.

## Produktziel

Die App soll die Alltagsentscheidung „Was kaufen und kochen wir in der kommenden Woche?“ erleichtern. Sie soll einen günstigen, abwechslungsreichen und persönlichen Wochenplan erstellen und daraus einen zusammenhängenden Einkauf ableiten. Angebote, Vorräte, Packungsgrößen und Resteverwertung werden gemeinsam berücksichtigt.

## Bestätigte Nutzervorgaben

1. Geplant wird der gesamte Wocheneinkauf: Hauptgerichte, Frühstück, Brotzeit, Snacks und Getränke. Haushaltswaren gehören vorerst nicht zum bestätigten Budgetumfang.
2. Geplant wird für Martin und Steffi sowie an ausgewählten Tagen für die Kinder. Vor jeder Wochenplanung werden Personen und benötigte Mahlzeiten kurz ausgewählt. Eine automatische Kalenderanbindung ist nicht erforderlich.
3. Das gemeinsame Lebensmittel- und Getränkebudget beträgt 400 € pro Kalendermonat einschließlich der Kindertage. Bis zu 440 € sind nur als ausdrücklich begründete Alternative zulässig; 440 € ist kein normales Planungsziel.
4. Die bereits hinterlegten Märkte und Filialen werden genutzt. Mehrere Stopps sind erlaubt, wenn nach zusätzlichen Fahrtkosten eine deutliche Ersparnis bleibt. Die Schwelle für einen zusätzlichen Stopp muss einstellbar sein.
5. Es gibt keine feste Begrenzung der Kochzeit. Aufwand und Dauer werden trotzdem sichtbar gemacht.
6. Vorhandene Lieblingsgerichte und Vorlieben werden genutzt und müssen einfach ergänzt, geändert und entfernt werden können. Allergien und feste Ausschlüsse sind aktuell nicht bekannt; spätere Erfassung muss möglich sein.
7. Neue Rezepte richten sich nach passenden Angeboten und persönlichen Vorlieben. Es gibt keine feste Wochenquote für neue Gerichte.
8. Reste dürfen erneut gegessen oder in anderen Gerichten verwendet werden.
9. Vorräte werden einfach und mit ungefähren Mengen erfasst. Keine aufwendige Pflichtinventur; bei entscheidenden Mengen gezielt nachfragen, statt Genauigkeit vorzutäuschen.

## Fachliche Entscheidungsregeln

- Der gesamte Warenkorb und die Verwendung über mehrere Tage werden optimiert. Ein Angebot zählt nur, wenn es den Gesamtplan verbessert; günstige reguläre Produkte bleiben Vergleichsoptionen.
- Kassenbetrag, anteilige Verbrauchskosten der Gerichte, verbleibende Vorräte und zusätzliche Fahrtkosten werden getrennt geführt.
- Das Monatsbudget von 400 € gilt für Lebensmittel und Getränke. Fahrtkosten werden separat ausgewiesen und bei zusätzlichen Stopps berücksichtigt.
- Mit verbleibendem Monatsbudget, bestätigten Ausgaben und noch zu versorgenden Tagen rechnen. Nicht pauschal 100 € pro Woche annehmen; geplante Einkäufe sind noch keine tatsächlichen Ausgaben.
- Ganze Verkaufspackungen berücksichtigen. Gemeinsam verwendete Zutaten im Einkauf nur einmal zählen. Vorräte konsistent reservieren und Mehrfachverwendung verhindern.
- Vorratskäufe über die aktuelle Woche hinaus nur empfehlen, wenn Budget, Lagerung und realistische spätere Verwendung passen. Unbekannte Ausstattung oder Lagerkapazität nicht voraussetzen.
- Abwechslung anhand verschiedener Gerichte, Hauptzutaten und Zubereitungsarten bewerten. Bloße Umbenennungen gelten nicht als Abwechslung; bewusst geplante Restetage sind zulässig.
- Einzelne Gerichte müssen fixiert und ausgetauscht werden können. Danach Einkaufsliste, Mengen, Kosten und Reste gemeinsam aktualisieren.

## Daten und KI

- Preise, Mengen und verbindliche Grenzen werden mit überprüfbarer Rechenlogik verarbeitet.
- KI darf Rezeptideen, Alternativen und Erklärungen liefern, muss aber fachlich geprüft werden.
- Keine erfundenen Preise, Verfügbarkeiten, Ersparnisse oder zukünftigen Angebote. Datenquelle, Gültigkeit und Unsicherheit kennzeichnen; fehlende Preise sind nicht null.
- Bestätigte Vorlieben von Vermutungen trennen. Eine einmalige Ablehnung ist kein dauerhafter Ausschluss.
- Im aktuellen Repository wurde keine OpenAI-, ChatGPT-, LLM- oder sonstige KI-Anbindung gefunden. Ein KI-Budget ist nicht festgelegt; mögliche Betriebs- und API-Kosten sind vor einer Anbindung zu dokumentieren.
- Rezeptseiten können strukturierte Zutaten und, sofern vorhanden, Schema.org-Bewertungen liefern. Eine automatische Suche nach beliebigen neuen Rezepten ist im statischen GitHub-Pages-Frontend derzeit nicht nachgewiesen.

## Bestandsanalyse

### Bereits zuverlässig umgesetzt

- Das Repository ist eine statische GitHub-Pages-App mit optionalem Worker-Backend und lokalem Browser-Speicher.
- Wochenplan, Tagesauswahl, Personenanzahl, Plantage, Marktlimit, Restelogik, Einkaufsliste, Favoriten, Vorräte, lokale Bewertungen, Backup/Import und optionaler Cloud-Sync sind im Code vorhanden.
- Supabase-E-Mail-Anmeldung, Haushaltsauswahl und revisionsgeschützter Sync sind lokal angebunden. Die Auth-URLs wurden laut Nutzer auf die Produktionsadresse gesetzt; ein echter Login-E2E-Test steht noch aus.
- Favoriten und kreative Vorschläge werden als gemeinsame Kandidaten bewertet; der Zutaten-Angebotsabgleich nutzt normalisierte Wörter, häufige Flexionen und eng begrenzte, durch reale Marktsnapshots belegte Produktfamilien. Regressionstests sichern sowohl gültige Komposita als auch typische Fehlzuordnungen ab.
- Ganze Packungen und Mehrfachverwendung werden in der Einkaufsliste zumindest als Packungsanzahl beziehungsweise „für mehrere Gerichte“ berücksichtigt.
- KaufDA- und Händler-Workflows sowie ein Bring-Playwright/OCR-Workflow sind im Repository dokumentiert und als GitHub Actions angelegt.
- Die eingecheckten Snapshots enthalten für Aldi, EDEKA, Kaufland, Lidl, Netto und Penny Angebote mit Quelle, Abrufzeit, Gültigkeit und Parserkennung. Der Stand der untersuchten Dateien umfasst 87 Aldi-, 68 EDEKA-, 73 Kaufland-, 211 Lidl-, 178 Netto- und 77 Penny-Angebote; diese Zählung ist eine Momentaufnahme, keine Vollständigkeitsgarantie.
- Die Angebots-Pipelines validieren Snapshots jetzt zentral vor Veröffentlichung, verlangen sichere HTTPS-Quelladressen, prüfen Gültigkeitsangaben als echte Kalenderdaten und weisen bereits beim Abruf abgelaufene Snapshots oder Einzelangebote zurück. Dateien werden atomar geschrieben; fehlerhafte Läufe können den letzten gültigen Dateistand dadurch nicht ersetzen.
- Die gemeinsame Marktdatenansicht zeigt nach einem Quellenabruf erkannte Treffer, den von der Quelle gemeldeten Datenstand und die Gültigkeit. Ein fehlender Quellzeitpunkt wird ausdrücklich als unbekannt angezeigt statt durch die Geräteabrufzeit ersetzt.
- Beim App-Refresh werden nur die erfolgreich aktualisierten Märkte ersetzt. Angebote fehlgeschlagener oder nicht abgefragter Märkte sowie manuelle Importe bleiben erhalten.

### Teilweise umgesetzt oder fehleranfällig

- Die Einkaufsliste weist zusätzlich je Markt die bekannte Angebotssumme der ausdrücklich bepreisten Positionen und die Anzahl unbekannter Preise aus. Explizite Grundpreise wie „2,49 €/kg“ werden nicht als Packungspreis gerechnet. Das bleibt ein Angebots-Zwischenwert auf Basis angenäherter Packungsbedarfe – kein vollständiger Kassenbetrag; fehlende Artikel, Vorräte und Fahrtkosten sind nicht enthalten.

- Der UI-Plan ist weiterhin auf warme Hauptgerichte plus optionalen Abendblock ausgerichtet. Frühstück, Brotzeit, Snacks und Getränke sind noch kein gleichwertiger Teil des Wochenbudgets.
- Die Planung verwendet aktive, ausgewählte Märkte und das eingestellte Marktlimit; sie führt nicht nachweisbar alle bekannten Märkte in einer Gesamtoptimierung zusammen.
- Die Einkaufsliste führt Angebotsartikel und fehlende Artikel zusammen, berechnet aber nicht den vollständigen Kassenbetrag des gesamten Einkaufs.
- Die sichtbaren Plankosten stammen aus Rezept-/Planwerten, während der Einkauf nur gematchte Angebots-Packungen summiert. Die App kennzeichnet diesen Zwischenwert nun als Schätzung und weist darauf hin, dass fehlende Artikel und Vorräte nicht enthalten sind; ein vollständiger Kassenbetrag fehlt weiterhin.
- Angebotsparser übernehmen eine Packungsgröße, wenn sie im Produkttitel oder vor dem Angebotspreis ausdrücklich steht; ein Grundpreis-Nenner nach dem Preis wird nicht als Packungsgröße verwendet. Ohne eindeutige Quellangabe bleibt die neutrale Angabe „1 Packung“ bestehen, daher ist der tatsächliche Mengenbedarf weiterhin nur angenähert.
- Monatsbudget, bestätigte Ausgaben, verbleibendes Budget, Resttage und Fahrtkosten sind nicht als durchgängiges Rechenmodell verbunden.
- Vorräte werden als Artikelliste ohne belastbare Mengen geführt. Packungsbedarf wird aus Zutatenvorkommen und Personenzahl angenähert; eine konsistente Vorratsreservierung ist nicht belegt.
- Persönliche Bewertungen werden lokal gespeichert. Externe Bewertungen werden nur übernommen, wenn eine importierte Rezeptseite sie strukturiert liefert; eine Qualitätsbewertung aller Vorschläge ist nicht garantiert.
- Rezeptimport ist für strukturierte Rezeptseiten und begrenzte Backend-Hosts vorgesehen. Die automatische Online-Suche nach neuen, gut bewerteten Rezepten ist nicht vorhanden.
- KaufDA meldet bei Lidl `targetOfferCount=1000`, `loadedOfferCardCount=1004` und 211 erkannte Lebensmittelangebote. `targetReached` belegt nur das Nachladen der Karten und nicht, dass alle Angebote vollständig oder korrekt klassifiziert wurden. Die App zeigt dieses Ladeziel inzwischen ausdrücklich als Ladeziel und markiert den Gesamtumfang weiterhin als unbelegt.
- Ein zentraler Contract verhindert leere Snapshots, Seitenmetadaten als Produkte und Preise ohne expliziten Eurobetrag. Angebotsenden dürfen weder für Händler- noch für KaufDA-/Lidl-Abrufe pauschal auf „heute + 7 Tage“ geschätzt werden. Die Vollständigkeit gegen belastbare Soll-Zahlen je Markt oder Prospekt ist noch offen.

### Noch nicht vorhanden

- Gemeinsames Monatsbudgetmodell mit 400-€-Ziel, optional begründetem 440-€-Szenario, tatsächlichen Ausgaben und verbleibendem Budget.
- Vergleich von Angebots- und regulären Preisen inklusive Gesamtwarenkorb.
- Einstellbare Schwelle, ab der ein weiterer Markt trotz Fahrtkosten lohnt.
- Personenauswahl pro Tag einschließlich Kindertagen und Auswahl der benötigten Mahlzeittypen.
- Gleichwertige Planung von Frühstück, Brotzeit, Snacks und Getränken.
- Mengenfähige, schnelle Vorratserfassung mit gezielten Rückfragen bei entscheidenden Beständen.
- Allergien, Ausschlüsse und weitere individuelle Einschränkungen.
- Vollständige automatische Rezeptsuche über mehrere Plattformen mit verifizierter Bewertung, Quellen- und Qualitätsprüfung.
- Automatischer Belegabgleich für tatsächliche Kassenbeträge.

### Wegen fehlender Daten nicht beurteilbar

- Ob die aktuellen Angebotsdateien tatsächlich alle im jeweiligen Prospekt sichtbaren Lebensmittel enthalten; insbesondere fehlen für mehrere Händler belastbare Soll-Kartenzahlen.
- Tatsächliche Verfügbarkeit und Preise in den konkreten Filialen zum Einkaufszeitpunkt.
- Reale Fahrtkosten, Verkehrsmittel und die wirtschaftliche Ersparnis zusätzlicher Stopps.
- Haushaltliche Lagerkapazität und Haltbarkeit für Vorratskäufe.
- Vollständigkeit und Qualität externer Rezeptbewertungen außerhalb strukturierter JSON-LD-Daten.
- Tatsächliche monatliche Ausgaben, weil im Repository keine bestätigte Kassenbon-Buchführung als Budgetquelle erkennbar ist.

## Drei wichtigste belegte Verbesserungen

1. **Datenvollständigkeit je Markt herstellen:** Leere/ungültige Snapshot-Veröffentlichungen und das Löschen nicht aktualisierter Marktangebote sind abgesichert. Der neue Report trennt Ladefortschritt und Gesamtvollständigkeit; belastbare Quell-Sollzahlen je Markt/Prospekt fehlen weiterhin.
2. **Kostenmodell vereinheitlichen:** Unbekannte Angebotspreise werden nicht mehr als 0 € gerechnet. Kassenbetrag, Verbrauchskosten, Vorratsrest, reguläre Vergleichspreise und Fahrtkosten müssen noch getrennt berechnet und anschließend für das 400-€-Monatsziel zusammengeführt.
3. **Wochenumfang erweitern:** Die Planung muss neben warmen Hauptgerichten auch Frühstück, Brotzeit, Snacks und Getränke für Martin, Steffi und ausgewählte Kindertage berücksichtigen, ohne die bestehende persönliche Auswahl zu verlieren.

## Laufender Entwicklungsstand und nächster Schritt

Der erste kleine Schritt der Datenbasis ist umgesetzt: Snapshot-Validierung, sichere HTTPS-Quelladressen, Plausibilitätsprüfung der Kalenderdaten, Ablehnung bereits abgelaufener Angebote, atomare Veröffentlichung und Regressionstests schützen den letzten gültigen Stand. Automatische Abrufe am 06.11.2026 zeigten, dass Händler-Metadaten als Produktangebote fehlklassifiziert und Gültigkeitsdaten pauschal geschätzt werden konnten. Solche Metadaten werden nun abgewiesen; KaufDA-, Lidl- und Händler-Snapshots benötigen ein in der Quelle belegtes Angebotsende. Die Marktdatenansicht nutzt den Quellzeitpunkt statt des Geräteabrufs und weist Gültigkeit sowie fehlende Zeitangaben aus. Die Marktübersicht trennt inzwischen Ladeziele von Prospekt-Gesamtvollständigkeit; ohne ausdrücklich belegte Quell-Sollzahl bleibt Letztere unbekannt. Das Kostenmodell weist bekannte Angebotspreise getrennt von unbekannten aus und verwirft explizite Grundpreise als Packungspreise. Die Auswahl konkurrierender Angebotskandidaten behält die Relevanzsortierung bei und vergleicht nur bei gleicher Relevanz, gleicher ausdrücklich bekannter Packungsmenge und validem Packungspreis die günstigere Packung. Unklare Größen und Grundpreise bleiben ohne Preisrangfolge. Als Nächstes folgt die Erweiterung des Wochenumfangs auf Frühstück, Brotzeit, Snacks und Getränke. Weitere Rezeptquellen oder KI bauen erst auf validierten Angebotsdaten auf.

Der Markt-Zwischensummen-Hinweis wird ausschließlich aus ausdrücklichen Angebotspreisen und den bisherigen angenäherten Packungszahlen berechnet. Unbekannte Preise – auch Grundpreise pro kg, Liter oder Verkaufseinheit ohne Packungspreis – werden separat gezählt, nicht zu 0 € addiert; fehlende Artikel bleiben ohne erfundenen Preis. Der Vergleich konkurrierender Angebotskandidaten bleibt dabei konservativ: Relevanz schlägt Preis; ein Preisvergleich ist nur bei gleicher, sicher normalisierter Packungsmenge zulässig. Eine Mehrstopp-Empfehlung wartet auf den noch offenen Startwert der Nettoersparnis-Schwelle und eine Fahrtkostenbasis.

Überprüfbare Erfolgskriterien:

- Jeder veröffentlichte Snapshot hat `offers.length > 0`, Quelle, Abrufzeitpunkt und quellenbelegte Gültigkeit; Seitenmetadaten und Preise ohne Eurobetrag werden abgewiesen. Ein fehlerhafter Lauf ersetzt keine gültige Datei.
- Die App zeigt pro Markt erkannte Angebote, Datenalter und Gültigkeit aus derselben normalisierten Quelle, die für Plan und Einkaufsliste verwendet wird.
- Für einen Testplan sind Plankosten, vollständiger Kassenbetrag, Angebotsanteil, fehlende Artikel, Vorratsverbrauch und Fahrtkosten getrennt ausweisbar; fehlende Preise werden als unbekannt behandelt.
- Relevante Parser-, Datenvalidierungs- und Konsistenztests laufen in CI und ihr Ergebnis wird dokumentiert.

Bis diese Kriterien erfüllt sind, sollten Rezeptautomatisierung und KI-Vorschläge nur auf validierten Angebotsdaten aufbauen.

## Dokumentationsstatus

Angelegt bzw. ergänzt am 05.11.2026:

- `AGENTS.md` – dauerhafte Arbeitsregeln für dieses Repository.
- `docs/PRODUKTZIEL.md` – Produktziel, bestätigte Nutzervorgaben, Entscheidungsregeln, Bestandsanalyse und nächster Schritt.
- `docs/SUPABASE.md` – separates Supabase-Projekt, sichere Haushaltssync-Grundlage, lokale App-Anbindung und offene Release-Schritte.
- `docs/FREIGABEN.md` – gebündelte Entscheidungen, die vor größeren Architektur-, Daten- oder Kostenänderungen benötigt werden.

### Fortschritt 06.11.2026 – parallele Umsetzung

- PR #13 (evidenzbasierter Markt-/Prospektvollständigkeitsbericht) wurde nach 10 gezielten und 44 Automationstests sowie grüner CI per Squash gemergt. Ladeziele gelten nicht als Prospekt-Gesamtzahlen; Standort-Queryparameter werden aus Report-URLs entfernt. GitHub-Pages-Lauf erfolgreich.
- PR #14 (unbekannte Angebotspreise nicht als 0 € werten) wurde nach 36 relevanten Tests, grünem Worker-Build/-Check und grüner CI per Squash gemergt. GitHub-Pages-Lauf erfolgreich.
- PR #16 ergänzt ausschließlich Service-Worker-Regressionstests: 5 fokussierte und 51 Automationstests grün; `sw.js` blieb unverändert. PR gemergt, GitHub-Pages-Lauf erfolgreich.
- PR #17 ergänzt einen centgenauen Helfer für bekannte Angebotsbeträge (`1,20 € × 3 = 3,60 €`) und Tests für unbekannte Preise. 47 Tests, Worker-Build/-Check und CI grün; PR gemergt, GitHub-Pages-Lauf erfolgreich.
- PR #19 ergänzt optionale Rezept-Mahlzeitenzwecke (Hauptgericht, Frühstück, Brotzeit, Snack, Getränk, Flexibel), ohne vorhandene Rezepte umzuschreiben. 55 Tests, Worker-Build/-Validierung und CI grün; am 06.11.2026 per Squash gemergt. Der automatische GitHub-Pages-Lauf #42284984325 war erfolgreich.
- PR #20 verwendet beim Teilen der Einkaufsliste dieselbe centgenaue Preislogik; unbekannte Preise bleiben als solche sichtbar. Lokal und in CI 57/57 Tests sowie Worker-Prüfungen grün; am 06.11.2026 per Squash gemergt. Der automatische Pages-Deploy #42286814419 war erfolgreich.
- PR #21 ergänzt bekannte Angebotssummen je Markt und zählt unbekannte Preise separat. 58/58 Automationstests, Worker-Build/-Validierung und PR-CI grün; am 06.11.2026 per Squash gemergt. Der automatische GitHub-Pages-Lauf #42288762437 war erfolgreich.
- PR #22 schließt explizite Grundpreise wie „€/kg“ aus den Packungspreissummen aus; 59/59 Automationstests, Worker-Build/-Validierung und PR-CI grün. PR #22 wurde am 06.11.2026 in Merge-Commit `7ce7d8e1abffad7f65103255c52a47cf1f13c4d4` gemergt; keine Supabase-, Auth-, Nutzerdaten- oder Kostenänderung.
- PR #23 ergänzt den konservativen Vergleich konkurrierender Angebotskandidaten und gezielte Regressionstests; am 06.11.2026 per Squash gemergt. Eine günstigere Packung darf nur bei gleicher Relevanz, gleicher sicherer Packungsgröße und bekanntem Packungspreis gewinnen; unklare Größen und Grundpreise bleiben neutral.
- PR #24 erhält lokale v1-Haushaltsdaten, wenn ein älterer Cloud-Stand Felder auslässt, und weist ungültige Sync-Payloads vor Änderungen vollständig zurück. 69/69 Automationstests, Worker-Build/-Validierung und CI waren grün; am 06.11.2026 gemergt. GitHub-Pages-Workflow und Build waren danach erfolgreich.
- PR #25 ergänzt Regressionstests für alle Backup-Felder, die ältere Cloud-Snapshots auslassen können; nur der Pantry-Bestand darf in diesem Szenario überschrieben werden. 69/69 Tests, Worker-Build/-Validierung und CI grün; am 06.11.2026 gemergt. Keine Produktionslogik geändert.
- PR #26 dokumentiert Freigabepunkt 9 zur Erfassung tatsächlicher Einkäufe und ihrer Datenschutz-/Sync-Reichweite. Keine Produktdaten oder Laufzeitlogik geändert; lokal 69/69 Tests grün; am 06.11.2026 gemergt.
- PR #27 ersetzt beliebige Teilstring-Treffer durch normalisierte Wörter, Flexionen und eng begrenzte Snapshot-gestützte Produktfamilien. Im Datenabgleich wurden 54 Rezeptzutaten und 590 Snapshot-Produktnamen geprüft; belegte Formen wie Spitzpaprika, Speisekartoffeln, Schlagsahne und Hähnchenprodukte bleiben erhalten, während Butter → Buttermilch, Tomatensauce, Süßkartoffeln und Fertigpizza als direkte Zutaten abgewiesen werden. Die abschließende PR-CI (Run #42309440579) bestätigte 74/74 Tests, Worker-Build und Worker-Validierung; Deploy-Job im PR übersprungen. Am 07.11.2026 per Squash in Merge-Commit `55c0d8d28da9191b5f4b6409b281f88078be1bfa` gemergt; Pages-Deploy #42309573224 und Root-Sync #42309573166 erfolgreich.
- PR #29 verhindert, dass signierte negative Eurobeträge als positive Angebotspreise in Zwischensummen eingehen; solche Beträge bleiben unbekannt. Lokal und im abschließenden PR-CI-Lauf #42311622542 (#158) 75/75 Automationstests sowie Worker-Build und -Validierung grün; Deploy-Job im PR übersprungen. Am 07.11.2026 per Squash in Merge-Commit `8c8d6963bb15a9fd7ea62fb8011c91c98ec7c80f` gemergt; Pages-Deploy #42311719384 (#159), Root-Sync #42311719441 (#92) und Pages-Build/Deployment #42311719255 (#376) erfolgreich.
- PR #31 verwirft signierte negative und mehrdeutig gruppierte Eurobeträge als bekannte Preise, statt negative Werte positiv zu zählen oder aus `1.234 €` einen Teilbetrag `234 €` zu lesen. Lokal und im abschließenden PR-CI-Lauf #42312768996 (#160) 76/76 Automationstests sowie Worker-Build und -Validierung grün. Am 07.11.2026 per Squash in Merge-Commit `480e4a9fb5ef7887df79ec3052ffab067bc90a8c` gemergt; Pages-Deploy #42312834634 (#161), Root-Sync #42312834610 (#93) und Pages-Build/Deployment #42312833924 (#378) erfolgreich.
- PR #33 ergänzt einen Regressionstest, dass die veröffentlichte Service-Worker- und Manifest-Datei bytegenau ihren Root-Quellen entsprechen. Lokal 77/77 Automationstests grün; keine Laufzeitlogik geändert.
- Chat A pausiert die Deploy-Pfadsteuerung auf Wunsch im verwalteten Worktree; Änderungen sind gespeichert, nicht committet und nicht als PR eingereicht. Workflow #127 validierte und übersprang den Deploy-Job.
- Nächster Produktschritt nach diesem Kandidatenvergleich: den Wochenumfang auf Frühstück, Brotzeit, Snacks und Getränke erweitern. Der vollständige Kassenbetrag bleibt offen, bis reguläre Preise, belastbare Mengen/Vorräte und bestätigte Ausgaben getrennt vorliegen; Mehrstopp-Empfehlungen warten auf einen Startwert für die Nettoersparnis-Schwelle und eine bestätigte Fahrtkostenbasis.
