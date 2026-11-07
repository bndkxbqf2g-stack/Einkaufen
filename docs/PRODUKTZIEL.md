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

1. Geplant wird der Wocheneinkauf mit Mittagessen und optionalem Abendessen. Frühstücks-Slots gehören ausdrücklich nicht zum Produktumfang; Snacks und Getränke werden nicht als eigene Planungsslots behandelt. Haushaltswaren gehören vorerst nicht zum bestätigten Budgetumfang.
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
- Die eingecheckten Snapshots enthalten für Aldi, EDEKA, Kaufland, Lidl, Netto und Penny Angebote mit Quelle, Abrufzeit, Gültigkeit und Parserkennung. Der beim Audit am 07.11.2026 festgestellte Stand umfasst 87 Aldi-, 68 EDEKA-, 49 Kaufland-, 211 Lidl-, 178 Netto- und 77 Penny-Angebote; diese Zählung ist eine Momentaufnahme, keine Vollständigkeitsgarantie. Für Kaufland fehlen belastbare Quell-Sollzahlen und Ladezielmetadaten; der Vollständigkeitsreport weist den Angebotsumfang deshalb als unbekannt aus.
- Die Angebots-Pipelines validieren Snapshots jetzt zentral vor Veröffentlichung, verlangen sichere HTTPS-Quelladressen, prüfen Gültigkeitsangaben als echte Kalenderdaten und weisen bereits beim Abruf abgelaufene Snapshots oder Einzelangebote zurück. Dateien werden atomar geschrieben; fehlerhafte Läufe können den letzten gültigen Dateistand dadurch nicht ersetzen.
- Die gemeinsame Marktdatenansicht zeigt nach einem Quellenabruf erkannte Treffer, den von der Quelle gemeldeten Datenstand und die Gültigkeit. Ein fehlender Quellzeitpunkt wird ausdrücklich als unbekannt angezeigt statt durch die Geräteabrufzeit ersetzt.
- Beim App-Refresh werden nur die erfolgreich aktualisierten Märkte ersetzt. Angebote fehlgeschlagener oder nicht abgefragter Märkte sowie manuelle Importe bleiben erhalten.

### Teilweise umgesetzt oder fehleranfällig

- Die Einkaufsliste weist zusätzlich je Markt die bekannte Angebotssumme der ausdrücklich bepreisten Positionen und die Anzahl unbekannter Preise aus. Explizite Grundpreise wie „2,49 €/kg“ werden nicht als Packungspreis gerechnet. Das bleibt ein Angebots-Zwischenwert auf Basis angenäherter Packungsbedarfe – kein vollständiger Kassenbetrag; fehlende Artikel, Vorräte und Fahrtkosten sind nicht enthalten.

- Der UI-Plan bildet den Mittagessen-Slot und optional je Tag ein Abendessen ab. Frühstücks-Slots sind ausgeschlossen; Snacks und Getränke sind weiterhin kein eigener Planungsslot.
- Die Planung verwendet aktive, ausgewählte Märkte und das eingestellte Marktlimit; sie führt nicht nachweisbar alle bekannten Märkte in einer Gesamtoptimierung zusammen.
- Die Einkaufsliste führt Angebotsartikel und fehlende Artikel zusammen, berechnet aber nicht den vollständigen Kassenbetrag des gesamten Einkaufs.
- Die Planansicht verwendet keine statischen Rezeptkosten mehr als Preisersatz. Sie zeigt nur bekannte Angebots-Packungssummen, markiert unvollständige Preisbasen als unbekannt und lässt den vollständigen Kassenbetrag ausdrücklich offen; fehlende Artikel, Vorräte und Fahrtkosten sind nicht enthalten.
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
- Eigene Planungsslots für Frühstück, Snacks und Getränke sind nicht Bestandteil des bestätigten Produktumfangs.
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
3. **Plan- und Einkaufsfluss vervollständigen:** Die Planung für Mittagessen und optionales Abendessen muss Mengen, Vorräte, aktuelle Angebote und den tatsächlichen Einkauf konsistent verbinden, ohne die bestehende persönliche Auswahl zu verlieren.

## Laufender Entwicklungsstand und nächster Schritt

Der erste kleine Schritt der Datenbasis ist umgesetzt: Snapshot-Validierung, sichere HTTPS-Quelladressen, Plausibilitätsprüfung der Kalenderdaten, Ablehnung bereits abgelaufener Angebote, atomare Veröffentlichung und Regressionstests schützen den letzten gültigen Stand. Automatische Abrufe am 06.11.2026 zeigten, dass Händler-Metadaten als Produktangebote fehlklassifiziert und Gültigkeitsdaten pauschal geschätzt werden konnten. Solche Metadaten werden nun abgewiesen; KaufDA-, Lidl- und Händler-Snapshots benötigen ein in der Quelle belegtes Angebotsende. Die Marktdatenansicht nutzt den Quellzeitpunkt statt des Geräteabrufs und weist Gültigkeit sowie fehlende Zeitangaben aus. Die Marktübersicht trennt inzwischen Ladeziele von Prospekt-Gesamtvollständigkeit; ohne ausdrücklich belegte Quell-Sollzahl bleibt Letztere unbekannt. Das Kostenmodell weist bekannte Angebotspreise getrennt von unbekannten aus und verwirft explizite Grundpreise als Packungspreise. Die Planansicht übernimmt statische Rezeptkosten nicht mehr als Fallback; bekannte Angebots-Packungssummen und unbekannte Preisbasen werden getrennt angezeigt. Die Auswahl konkurrierender Angebotskandidaten behält die Relevanzsortierung bei und vergleicht nur bei gleicher Relevanz, gleicher ausdrücklich bekannter Packungsmenge und validem Packungspreis die günstigere Packung. Unklare Größen und Grundpreise bleiben ohne Preisrangfolge. Als Nächstes folgt die Vervollständigung des Kosten- und Kassenmodells; der Wochenumfang bleibt auf Mittagessen plus optionales Abendessen begrenzt. Weitere Rezeptquellen oder KI bauen erst auf validierten Angebotsdaten auf.

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
- PR #31 verhindert signierte Minuswerte und Teiltreffer aus mehrdeutigen Preisen. PR #35 richtet den App-Parser am Snapshot-Vertrag aus: `1.234 €` ergibt 1234 Euro, `1.234,56 €` ergibt 1234,56 Euro; `1,234 €` bleibt unbekannt. PR-CI #42329694133 (#164) bestätigte 78/78 Tests, Worker-Build und -Validierung; der Deploy-Job im PR wurde übersprungen. Am 07.11.2026 per Squash in Merge-Commit `7ab9a8509edfea82ce36dbd60f0ba84062c54dce` gemergt; Pages-Deploy #42329770530 (#165), Pages-Build/Deployment #42329770330 (#382) und Root-Sync #42329770547 (#94) erfolgreich.
- PR #33 ergänzt einen Regressionstest, dass die veröffentlichte Service-Worker- und Manifest-Datei bytegenau ihren Root-Quellen entsprechen. Lokal und im PR-CI-Lauf #42313464272 (#162) 77/77 Automationstests, Worker-Build und -Validierung grün. Am 07.11.2026 per Squash in Merge-Commit `21eb8884da5581a8fdeb80817c3e0563067c1ffb` gemergt; Pages-Deploy #42313536000 (#163) und Pages-Build/Deployment #42313534516 (#380) erfolgreich.
- PR #37 vereinheitlicht den konservativen Zutatenabgleich für Angebote, Vorräte und Reste; „Milch“ wird nicht mehr als Buttermilch/Hafer-/Kokosmilch fehlzugeordnet, belegte Komposita bleiben erhalten. PR-CI #42330261096 (#166): 81/81 Tests, Worker-Build und -Validierung erfolgreich; PR-Deploy-Job übersprungen. Am 07.11.2026 per Squash in Merge-Commit `b6f05e5b52df4fa3e7043942c872a5df75878ebf` gemergt.
- PR #38 härtet den JSON-LD-Rezeptimport: ungültige Rezeptkandidaten verdecken keine späteren gültigen Kandidaten; Objektzutaten werden nicht zu `[object Object]` umgewandelt. PR-CI #42330483770 (#168): 81/81 Tests, Worker-Build und Endpoint-Validierung erfolgreich; PR-Deploy-Job übersprungen. Am 07.11.2026 per Squash in Merge-Commit `5528a19ac815eccdc0d949b4efadf2800581e2d9` gemergt.
- Die früher pausierte Deploy-Pfadsteuerung bleibt unangetastet und uncommittet. Als getrennte, kleine Prüfaufgaben laufen jetzt Packungs-/Mengenberechnung (Chat B) und lokaler Backup-/Import-/Restore-Pfad mit synthetischen Testdaten (Chat A); keine Supabase-, Auth-, Nutzerdaten- oder Angebotsdatenänderung.
- Nächster Produktschritt nach diesem Kandidatenvergleich: den Kosten- und Kassenfluss für Mittagessen und optionales Abendessen vervollständigen. Der vollständige Kassenbetrag bleibt offen, bis reguläre Preise, belastbare Mengen/Vorräte und bestätigte Ausgaben getrennt vorliegen; Mehrstopp-Empfehlungen warten auf einen Startwert für die Nettoersparnis-Schwelle und eine bestätigte Fahrtkostenbasis.
### Fortschritt 07.11.2026 – Daten- und Offline-Stabilisierung

- Snapshot-Duplikate und die Erkennung von Grundpreis-OCR wurden geprüft bzw. abgesichert, damit doppelte Angebotsdaten nicht unkontrolliert übernommen und Grundpreise nicht als Paketpreise gerechnet werden.
- Singular-/Plural-Zutaten sowie manuelle Varianten und stabile IDs wurden geprüft bzw. abgesichert, damit Zutatenabgleich und lokale Zuordnungen bei zulässigen Schreibvarianten erhalten bleiben.
- Die Reconciliation von `shoppingChecks` wurde geprüft bzw. abgesichert; veraltete oder nicht mehr zur aktuellen Einkaufsliste gehörende Markierungen werden nicht als gültige Erledigungen weitergeführt.
- Die Service-Worker-Aktivierung wurde geprüft bzw. abgesichert, damit eine neue Version nach der Aktivierung kontrolliert übernimmt.
- Kombinierte Legacy-Backup-Tests wurden geprüft bzw. abgesichert; ältere Sicherungsstände mit ausgelassenen Feldern verändern erhaltene lokale Daten nicht unkontrolliert.
- Supabase, Datenmodell und Budgetlogik bleiben unverändert. Der nächste fachliche Freigabepunkt betrifft ausschließlich den tatsächlichen Einkaufs-/Kassenfluss; Frühstücks-Slots sind keine offene Produktentscheidung.


## Fachliche Aktualisierung – Mahlzeitenumfang – 07.11.2026

Die aktuelle Nutzerentscheidung ersetzt frühere Planungsannahmen mit Frühstück:

- Es gibt keinen Frühstücks-Slot.
- Der bestehende Hauptgericht-Slot wird als Mittagessen verstanden.
- Zusätzlich ist ausschließlich ein optionales Abendessen vorgesehen.
- Der bestehende optionale Abendblock bleibt die kleinste rückwärtskompatible Grundlage. Eine per-Person-Auswahl, automatische Umklassifizierung vorhandener Rezepte und eine neue Datenbankstruktur sind nicht Bestandteil dieser Entscheidung.
- Frühere Passagen, die Frühstück als aktuellen oder nächsten Pflichtumfang nennen, gelten insoweit als überholt. Die nächste Umsetzung darf nur den optionalen Abendessen-Umfang betreffen.

## Fortschritt 07.11.2026 – vorbereiteter IST-Budget-Kern

- [PR #142](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/142) ergänzt den rein lokalen, deterministischen Validator/Summarizer für das dokumentierte Format `purchaseRecords`.
- Der Kern leitet den Monat aus einem gültigen Kaufdatum ab, prüft Centbeträge und eindeutige manuelle Datensätze und berechnet eine Monatszwischensumme gegen das dokumentierte Ziel von 400,00 €.
- Die Funktion ist noch nicht in UI, lokale Speicherung, Backup, Haushaltssync, Supabase, Beleg/OCR oder echte Einkaufsdaten integriert. Der vollständige Kassenbetrag und die produktive IST-Erfassung bleiben Freigabepunkt 9.

## Fortschritt 07.11.2026 – gemeinsamer Kostenkern

- PR #146 extrahiert die deterministische Angebots-Packungsberechnung aus dem HTML in das gemeinsam geladene Browser-Modul `shopping-costs.js`; `root` und `dist` bleiben bytegleich.
- Der Kern summiert ausschließlich ausdrücklich geparste Angebotspreise in Cent, normalisiert Packungszahlen und trennt bekannte Preise, unbekannte Preise und nicht verankerte Artikel. Unbekannte Preise werden nicht zu null und fehlende Artikel nicht zu einem Kassenbetrag.
- Die Berechnung ist mit Node-Tests abgesichert. Sie ist weiterhin ein Angebots-Zwischenwert; echte Kassenbeträge, IST-Erfassung, Fahrtkosten und Haushaltssynchronisierung bleiben getrennte nächste Arbeitspakete bzw. Freigabepunkt 9.

## Fortschritt 07.11.2026 – gemeinsamer UI-Kostenstatus

- PR #147 verwendet den gemeinsamen Kostenkern auch im Einkaufslisten-Rendering. Die UI bezieht die Aufteilung in Angebotspositionen, unbekannte Angebotspreise und nicht verankerte Artikel nun aus derselben deterministischen Zusammenfassung wie Teilen und Tests.
- Dadurch bleibt der bekannte Angebotsbetrag ein klar abgegrenzter Zwischenwert; fehlende Artikel, Vorräte, Fahrtkosten und der echte Kassenbetrag werden nicht stillschweigend eingerechnet.
- Nächster sicherer Schritt ist die weitere Verbindung von Plan-/Einkaufsbedarf und Vorratsmengen. Eine produktive IST-Erfassung oder Haushaltssynchronisierung bleibt bis zur fachlichen Freigabe von Punkt 9 ausgeschlossen.

## Fortschritt 07.11.2026 – sichtbarer Vorratsabgleich

- PR #149 ergänzt eine deterministische, rein informative Vorratsabdeckung für den aktuellen Plan. Die Einkaufsliste weist nun aus, wie viele geplante Zutaten aus dem vorhandenen Vorrat berücksichtigt werden.
- Es werden keine Mengen, Haltbarkeiten oder Kassenpreise behauptet. Vorratszutaten bleiben aus dem Angebots-Zwischenwert ausgeschlossen; nicht verankerte Einkaufspositionen bleiben separat sichtbar.
- Das bestehende Vorratsformat, lokale Daten, Backups, Haushaltssync und Supabase bleiben unverändert. Eine mengenfähige Vorratserfassung ist ein späteres, separat zu prüfendes Arbeitspaket.

## Fortschritt 07.11.2026 – gemeinsamer Angebots-Snapshot-Vertrag

- Die Angebots-Workflows verwenden jetzt denselben bestehenden Validator `automation/offer-snapshot.mjs`, der auch die automatisierten Regressionstests und den atomaren Snapshot-Schreibpfad absichert.
- Dadurch gelten vor einer Veröffentlichung einheitlich HTTPS-Quelle ohne Zugangsdaten, gültige Abruf-/Angebotsdaten, explizite Eurobeträge, nichtleere Angebote, konsistente Zähler und Duplikatsschutz.
- Die zuvor ergänzte doppelte Workflow-Prüfung wurde entfernt; damit bleibt die Angebotsvalidierung an einer Stelle wartbar.
- Die Prüfung erfindet keine Preise und verändert keine Angebotsdaten. Keine Nutzerdaten, Supabase-/Datenbankänderung, Migration, Deployment- oder kostenpflichtige Ressourcenänderung.

## Fortschritt 07.11.2026 – zentraler Mahlzeiten-Slot-Vertrag

- Die Slot-Regel für den Wochenplan liegt jetzt im getesteten Modul `meal-planning.js` und wird von Root- und `dist`-App verwendet.
- Der Plan lässt weiterhin nur Hauptgericht/Flexibel für das Mittagessen und Brotzeit/Flexibel für das optionale Abendessen zu; Frühstück, Snack und Getränk werden nicht automatisch als Plan-Slots verwendet.
- Gespeicherte Mahlzeitenzwecke bleiben gültig und werden nicht umklassifiziert. Die Änderung ist damit rückwärtskompatibel und verändert keine Nutzer- oder Supabase-Daten.

## Fortschritt 07.11.2026 – Worker-Sync-Grenze für Rezeptverlauf

- Der bestehende Client begrenzt `recipeHistory` bereits als Array; der Worker-Grenzvalidator übernimmt diese Begrenzung nun ebenfalls mit maximal 5.000 Einträgen.
- Ungültige Objektwerte und übergroße Rezeptverläufe werden am Worker-Sync abgewiesen, bevor sie in den D1-Pfad gelangen.
- Worker-Quelle und `dist/server/index.js` bleiben synchron. Die Supabase-RPC-Validierung und deren möglicher Migrationsbedarf bleiben unverändert und werden nicht vorweggenommen.

## Fortschritt 07.11.2026 – Sync-Vertragsparität

- Ein automatischer Paritätstest vergleicht die Client- und Worker-Feldlisten für Arrays und Objekte sowie das veröffentlichte Worker-Artefakt.
- Dadurch wird verhindert, dass ein lokales Sync-Feld wie `recipeHistory` künftig nur an einer Boundary ergänzt wird.
- Der Test verändert keine Laufzeitlogik, Supabase-Daten, Datenbankstruktur oder Nutzerinhalte.

## Fortschritt 07.11.2026 – transparenter Vorratsabgleich

- Die Einkaufsliste zeigt neben der Anzahl nun bis zu vier konkret berücksichtigte Vorratszutaten und weist weitere Treffer nur als Anzahl aus.
- Es werden weiterhin keine Vorratsmengen, Haltbarkeiten, Preise oder Verbrauchsannahmen behauptet; der Angebots-Zwischenwert bleibt unverändert.
- Die Anzeige nutzt ausschließlich den bestehenden lokalen Plan-/Vorratsabgleich und verändert keine Nutzer-, Backup-, Sync- oder Supabase-Daten.

## Fortschritt 07.11.2026 – barrierefreier Vorratsstatus

- PR #160 kennzeichnet die dynamische Vorratsdetailzeile der Einkaufsliste als zugänglichen Status und kündigt Aktualisierungen für unterstützende Technologien an.
- Die Verbesserung betrifft ausschließlich die Darstellung; Vorratsmengen, Planwerte, Preise, Angebots-Zwischensummen sowie lokale, Backup-, Sync- und Supabase-Daten bleiben unverändert.
- Root und `dist` bleiben synchron; die Regressionstest- und CI-Prüfung war erfolgreich.

## Fortschritt 07.11.2026 – eindeutiger Vorratsabgleich

- PR #162 zählt eine geplante Vorratszutat pro stabiler Zutatenidentität nur einmal, auch wenn sie in mehreren Gerichten oder in zulässigen Singular-/Pluralvarianten vorkommt.
- Der zuerst sichtbare Zutatenname bleibt erhalten; Varianten werden nicht in Mengen, Preise oder Verbrauchsannahmen umgedeutet.
- Root und `dist` bleiben synchron; die Regressionstests und CI waren nach Korrektur des Regex-Escapings grün.

## Fortschritt 07.11.2026 – gemeinsame Zutaten-Normalisierung

- PR #164 führt die Zutaten-Normalisierung in einem gemeinsam geladenen Modul für App, Vorratsabgleich und Kostenmodell zusammen.
- Singular-/Plural- und beschreibende Varianten verwenden damit denselben Identitätsvertrag; isolierte Legacy-/Offline-Fallbacks bleiben erhalten.
- Root und `dist` bleiben synchron; Verhalten, Modul-Synchronität und die bestehende Einkaufslistenlogik sind durch Tests abgesichert.

## Fortschritt 07.11.2026 – Offline-Erststart der App

- PR #166 nimmt die für den ersten App-Start benötigten Zutaten-, Kosten- und Planmodule in den Service-Worker-Shell-Cache auf.
- Der Cache-Marker wurde auf v29 erhöht, damit bestehende Clients den vollständigen Shell-Bestand neu übernehmen.
- Root und `dist` bleiben synchron; Service-Worker- und Worker-Validierung sind durch Tests abgesichert.

## Fortschritt 07.11.2026 – konsistente Vorratseingabe

- Die Vorratseingabe verwendet nun denselben Zutaten-Identitätsvertrag wie Einkaufsabgleich und Vorratsabdeckung.
- Bereits gespeicherte Namen bleiben erhalten; neue Singular-/Pluralvarianten werden nicht zusätzlich als scheinbar neuer Vorrat gespeichert.
- Leere oder nur aus Satzzeichen bestehende Eingaben werden nicht als Vorrat übernommen. Mengen, Haltbarkeiten und bestehende Nutzerdaten bleiben unberührt.

## Fortschritt 07.11.2026 – zugängliche Eingaberückmeldungen

- Rückmeldungen beim Speichern von Vorräten und manuellen Einkaufsartikeln werden nun als höfliche, atomare Statusmeldungen für unterstützende Technologien ausgezeichnet.
- Die Änderung betrifft ausschließlich die Darstellung und erhält alle bestehenden Eingaben, Daten und Berechnungen.

## Fortschritt 07.11.2026 – Offline-Shell-Vertrag

- Ein Regressionstest vergleicht jetzt automatisch alle lokalen JavaScript-Dateien aus `index.html` mit dem Service-Worker-App-Shell-Cache.
- Neue Frontend-Module können dadurch nicht mehr ohne passende Offline-Cache-Absicherung veröffentlicht werden.

## Fortschritt 07.11.2026 – stabile manuelle Einkaufsartikel

- Ältere oder importierte manuelle Einkaufsartikel mit doppelter expliziter ID erhalten jetzt deterministische Suffixe statt denselben Statusschlüssel zu teilen.
- Kein Eintrag wird verworfen; Mengen, Namen, Einkaufschecks und bestehende Backup-/Restore-Daten bleiben erhalten.


## Laufender Entwicklungsstand – Service-Worker-Versionskopplung – 07.11.2026

- [PR #172](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/172) korrigiert die Registrierungs-URL in Root und `dist` von `sw.js?v=28` auf die aktive Cache-Version `v29`.
- Ein Regressionstest vergleicht die Versionsnummer der App-Registrierung automatisch mit `CACHE_NAME`; dadurch wird verhindert, dass eine neue Offline-Shell veröffentlicht, aber mit einer alten Registrierungskennung angefordert wird.
- Root und `dist` bleiben bytegleich. Es wurden keine Nutzer-, Plan-, Preis-, Angebots-, Supabase- oder Datenbankdaten verändert; keine zusätzliche Freigabe ist erforderlich.
## Fortschritt 07.11.2026 – Angebotsgültigkeit über den Jahreswechsel

- Der Lidl-Prospektparser übernimmt bei einer ausdrücklich angegebenen Spanne wie „28.12. bis 03.01.“ das fehlende Endjahr als Folgejahr; damit wird ein gültiges Prospekt nicht fälschlich als abgelaufen verworfen.
- Der Jahreswechsel ist durch einen deterministischen Regressionstest abgesichert. Fehlende Datumsangaben, Preise oder Quellen bleiben weiterhin unbekannt beziehungsweise werden vom Snapshot-Vertrag abgewiesen; Live-Angebotsdaten und Nutzerdaten wurden nicht verändert.

## Fortschritt 07.11.2026 – KaufDA-Angebotsgültigkeit über den Jahreswechsel

- Der KaufDA-Importer übernimmt bei einem quellenbelegten Ende wie „Gültig bis 03.01.“ während eines Dezemberabrufs das Folgejahr; zuvor konnte der Snapshot als bereits abgelaufen verworfen werden.
- Der Randfall ist synthetisch getestet. Offizielle Händlerparser behalten ihre bestehende Jahreswechselbehandlung; fehlende Enddaten werden weiterhin nicht erfunden.


## Fortschritt 07.11.2026 – gemeinsame Angebotsauswahl für Plan und Einkaufsliste

- Der deterministische Kandidatenselektor wird für Plan-Matcher und Einkaufsliste gemeinsam verwendet. Marktpräferenzen überschreiben die Relevanz-/Packungsgrößen-Rangfolge nicht mehr nur im Einkaufslistenpfad.
- Ein synthetischer Test für Mittagessen plus optionales Abendessen bestätigt, dass Planpreis und Einkaufs-Zwischensumme dieselbe Angebotsbasis verwenden. Es wurden keine echten Angebots-, Nutzer-, Supabase- oder Datenbankdaten verändert.


## Fortschritt 07.11.2026 – Packungsbasis für Planpreis und Einkaufssumme

- Die Gesamtanzeige des Wochenplans verwendet dieselbe deterministische Einkaufsliste und dieselbe Packungsrundung wie die Einkaufssumme. Bei drei Personen werden Verkaufspackungen deshalb nicht mehr nur anteilig skaliert.
- Mittagessen und optionales Abendessen sind im synthetischen Regressionstest enthalten. Keine echten Angebots-, Nutzer-, Supabase- oder Datenbankdaten wurden verändert.

## Fortschritt 07.11.2026 – Mahlzeiten-Slots im Wochenplan

- Manuelle Tageszuordnungen akzeptieren jetzt ausschließlich Rezepte für den Mittagsslot (`Hauptgericht` oder `Flexibel`); Frühstück, Snack und Getränk bleiben Rezeptzwecke, werden aber nicht als Wochenplan-Slot verwendet.
- Auch ältere gespeicherte manuelle Zuordnungen werden beim Planaufbau gegen die Mittagsslot-Kandidaten geprüft. Dadurch gelangen ausgeschlossene Mahlzeiten nicht in Einkaufsliste, Mengen-/Packungsberechnung oder Planbetrag; bestehende Nutzerdaten werden nicht gelöscht.

## Fortschritt 07.11.2026 – sichere Budget-Centwerte

- Der vorbereitete `purchaseRecords`-Validator akzeptiert nur nichtnegative sichere Ganzzahlen als Centbeträge. Dadurch bleiben Summen oberhalb der JavaScript-Präzisionsgrenze nicht stillschweigend ungenau.
- Gültige Budgetwerte, die noch nicht produktiv gespeichert oder angezeigt werden, bleiben unverändert. Es wurden keine IST-, Nutzer-, Supabase- oder Datenbankdaten geändert.


### Fortschritt 07.11.2026 – Audit Angebotsvollständigkeit und Marktvergleich

- Der Vollständigkeitsreport unterscheidet weiterhin korrekt zwischen Ladeziel und Prospekt-Gesamtumfang: `targetReached` wird nur als Ladeziel angezeigt; „Gesamtumfang nicht belegt“ bleibt explizit.
- Audit der eingecheckten Snapshots: Aldi, EDEKA, Lidl, Netto und Penny liefern `recognizedCount` plus Ladeziel; Kaufland liefert aktuell 49 Angebote ohne belastbare Sollzahl/`recognizedCount`. Alle sechs Snapshots sind nichtleer, datiert, nicht dupliziert und `recognizedCount` (wo vorhanden) entspricht `offers.length`. Keine Vollständigkeitsbehauptung wird daraus abgeleitet.
- Der Marktvergleich verwendet nur aktuelle Angebote aktiver Märkte; fehlende oder unklare Preise bleiben unbekannt. Die bestehenden Regressionstests sichern die Coverage-Darstellung, Quellzeitpunkte und den Erhalt nicht aktualisierter Märkte. Für diesen Audit war keine Laufzeitänderung erforderlich.

## Fortschritt 07.11.2026 – sofort angewendetes Marktlimit

- Beim Ändern des Marktlimits werden die Einstellungen vor der Planneuberechnung gespeichert. Dadurch verwendet der aktuelle Plan sofort dieselbe Stopplimit-Einstellung wie die Marktansicht.
- Dies ist keine Routen-, Fahrtkosten- oder Ersparnisoptimierung; automatische Mehrstopp-Empfehlungen bleiben bis zur fachlichen Freigabe deaktiviert. Keine Nutz-, Angebots-, Supabase- oder Datenbankdaten wurden geändert.

## Fortschritt 07.11.2026 – sichere Budget-Monatssumme

- Der vorbereitete `purchaseRecords`-Summarizer bricht jetzt ab, wenn die Summe gültiger Centwerte nicht mehr sicher als JavaScript-Ganzzahl darstellbar ist. Einzelwerte waren bereits auf sichere Centzahlen begrenzt; die Aggregatsumme ist nun ebenfalls deterministisch geschützt.
- Die produktive IST-Erfassung bleibt weiterhin nicht integriert. Keine Nutzer-, Angebots-, Supabase- oder Datenbankdaten wurden geändert.


### Fortschritt 07.11.2026 – Quellstatus bei fehlgeschlagenem Refresh

- Wenn eine Angebotsquelle vorübergehend nicht erreichbar ist, bleiben zuletzt geladene Angebote lokal erhalten; abgelaufene Angebote werden weiterhin nicht geplant.
- Die Statusanzeige kennzeichnet den fehlgeschlagenen Refresh jetzt ausdrücklich als „letzter Datensatz behalten“ und zeigt weiterhin den letzten bekannten Quellzeitpunkt, die Gültigkeit und vorhandene Ladezielmetadaten. Fehlende Sollzahlen bleiben unbekannt.


### Fortschritt 07.11.2026 – Snapshot-Quelladresse in der Marktstatusanzeige

- Die Marktstatusanzeige verwendet nach einem Quellen- oder Snapshotwechsel jetzt die vom validierten Snapshot gemeldete sichere `sourceUrl`; bei alten lokalen Statusständen ohne diese Angabe bleibt die hinterlegte Marktseite als Fallback bestehen.
- Ungültige oder unsichere Quelladressen werden nicht verlinkt. Fehlende Sollzahlen bleiben unabhängig von der Quelladresse unbekannt.


### Fortschritt 07.11.2026 – Transaktionaler Backup-/Cloud-Import

- Backup- und Cloud-Daten werden vor dem Schreiben validiert und jetzt als gemeinsamer lokaler Schreibvorgang behandelt. Wenn ein einzelner `localStorage`-Schreibvorgang fehlschlägt, werden bereits geänderte Schlüssel bestmöglich auf den vorherigen Stand zurückgesetzt.
- Der Service Worker bleibt unverändert; Offline-Shell und Cache-Fallback verändern keine lokalen App-Daten.


### Fortschritt 07.11.2026 – Offline-Snapshot-Fallback

- Ein aus dem Service-Worker-Cache gelieferter Angebots-Snapshot wird jetzt ausdrücklich markiert. Die App behandelt ihn nicht als frischen Refresh, sondern behält den bisherigen Angebotsstand und zeigt den Offline-/Fehlerpfad.
- Die Offline-Shell bleibt verfügbar; lokale Einstellungen, Backups und persönliche Daten werden vom Cache-Fallback nicht verändert.
