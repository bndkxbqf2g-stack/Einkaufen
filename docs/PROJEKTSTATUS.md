# Projektstatus: Einkaufen / Angebotsküche

Stand: 05.11.2026  
Zweck: belegbarer Arbeitsstand, Automationsstatus und nächste überprüfbare Schritte.

## Projekt- und Repository-Identität

- Produktname und Repository-Inhalt sind „Einkaufen / Angebotsküche“: `README.md`, Manifest, GitHub-Pages-Adresse und die letzten Angebots-/Planungs-Commits stimmen überein.
- Die Suche im Repository enthält keinen Treffer für „SparzamApp“; das Projekt wird deshalb nicht damit gleichgesetzt.
- GitHub-Zielrepository: `bndkxbqf2g-stack/Einkaufen`, Standardbranch `main`.
- GitHub-Hauptstand zum Audit: Commit `49902e57e3ad0dbce4cd0b1d28939991e351526a`.
- Lokaler Prüfstand: `site-source-4`, Commit `2812fb2`; der lokale `origin` zeigt auf einen verwalteten Spiegel und wird nicht als GitHub-Ziel angenommen.

## Änderungen und Arbeitsisolierung

- Der Hauptcheckout hatte beim Start bereits ungesicherte Änderungen in `automation/bring-offers.mjs` und ein nicht versioniertes `node_modules/`. Beides bleibt unangetastet und wird nicht in diese Arbeit übernommen.
- Für diese Weiterentwicklung wurde ein separater Worktree angelegt: `worktrees/daily-development`.
- Arbeitsbranch: `codex/daily-development`, Ausgangspunkt `2812fb2`.
- Ein Codex-Worktree-Attachment war wegen der Windows-Git-Sicherheitsprüfung („dubious ownership“ des Sandbox-Besitzers) nicht möglich. Die Git-Befehle im Worktree werden deshalb mit einem auf diesen Repositorypfad begrenzten `safe.directory`-Override geprüft; es wurde keine globale Git-Sicherheitsregel verändert.

## Zuverlässig geprüft

Die vorhandenen Prüfungen wurden auf dem isolierten Stand ausgeführt:

- `node automation/lidl-parser.test.mjs` – Lidl-Parser-Prüfungen bestanden.
- `node scripts/validate-generated-offers.test.mjs` – Payload-Validator-Prüfungen bestanden.
- `node scripts/validate-generated-offers.mjs generated/aldi-offers.json generated/edeka-offers.json generated/kaufland-offers.json generated/netto-offers.json generated/penny-offers.json` – 153 gültige Angebote geprüft.
- Der bekannte leere Lidl-Datensatz wurde mit demselben Validator kontrolliert abgewiesen; er kann dadurch nicht veröffentlicht werden.
- `node scripts/validate-worker.mjs` – Worker-Artefakt- und Rezept-Endpunkt-Prüfungen bestanden.
- `node --check worker/index.js` – Syntaxprüfung bestanden.
- `git diff --check` – keine Whitespace-Fehler festgestellt.
- Offener Pull Request im GitHub-Zielrepository: Draft [#1](https://github.com/bndkxbqf2g-stack/Einkaufen/pull/1) für Dokumentation und gemeinsame Angebotsdaten-Validierung; kein Merge.
- Einmaliger 20-Minuten-Entwicklungslauf am 05.11.2026: zentrale Angebots-Payload-Prüfung ergänzt, in die drei vorhandenen Angebots-Workflows eingehängt und erfolgreich getestet.
- Der erste echte Lauf der täglichen Codex-Automation um 19:00 Uhr steht noch aus.

Diese Prüfungen belegen noch keine fachliche Vollständigkeit aller KaufDA-Karten oder des Wochenbudgets. Diese Einschränkung bleibt bestehen.

## Automationsstatus

- Native lokale Codex-Automationen sind auf dem Rechner als Fähigkeit vorhanden.
- `codex.exe` ist installiert (`codex-cli 0.163.0-alpha.10.2`) und unterstützt `codex exec` für nichtinteraktive, geplante Läufe.
- Der direkte CLI-Login-Status konnte in der aktuellen Shell noch nicht verifiziert werden, weil der Prozess vor dem Login-Check mit „Could not find home directory“ abbricht. Auth-Dateien wurden nicht gelesen oder kopiert.
- Der bevorzugte Weg ist daher die native lokale Codex-Automation des Desktop-Clients; eine kostenpflichtige API-Automation und eine neue GitHub-Action für Codex werden nicht eingerichtet.
- Der tägliche Zeitplan ist in der Codex-Desktop-Automation **aktiv**: „Einkaufen – tägliche Weiterentwicklung“, Automation-ID `einkaufen-t-gliche-weiterentwicklung`.
- Geplanter Zeitpunkt: täglich um 19:00 Uhr Europe/Berlin. Die Windows-Zeitzone ist `W. Europe Standard Time` (Berlin); der erste Lauf ist am 05.11.2026 um 19:00 Uhr vorgesehen.
- Die Automation liegt außerhalb des Repositories in der lokalen Codex-Automationsverwaltung. Es wurden keine Passwörter, Tokens oder persönlichen Einkaufsdaten in das Repository geschrieben.
- Für lokale Dateien müssen der Laptop eingeschaltet und die Codex-Desktop-App ausgeführt sein. Die Einkaufen-Webapp selbst muss nicht geöffnet sein.
- Pausieren oder beenden: Codex-Desktop-App → geplante Automationen → „Einkaufen – tägliche Weiterentwicklung“ → **Pause** bzw. **Delete**. Ein laufender Durchlauf muss zusätzlich abgebrochen werden, wenn er sofort stoppen soll.
- Die Ausführung bleibt auf den isolierten Worktree und den Branch `codex/daily-development` begrenzt; es gibt keinen automatischen Merge und keine App-Veröffentlichung.
- Der GitHub-Draft-PR enthält Dokumentation plus die zentrale Angebots-Payload-Prüfung in den drei Angebots-Workflows; App-Funktionen und Design bleiben unverändert.

## Priorisierte Aufgaben mit Abschlusskriterien

1. **Daten- und Kostenbasis stabilisieren**
   - Kein leerer oder abgelaufener Marktstand ersetzt gültige Daten.
   - Angebote, Datenalter, Gültigkeit und Parserstatus stammen aus einer normalisierten Quelle.
   - Kassenbetrag, Verbrauchskosten, Angebotsanteil, fehlende Preise, Vorratsverbrauch und Fahrtkosten bleiben getrennt.
   - Relevante Parser- und Konsistenztests bestehen.
2. **Wochenumfang und Mengenmodell vervollständigen**
   - Frühstück, Brotzeit, Snacks und Getränke werden neben Hauptgerichten geplant.
   - Ganze Verkaufspackungen, gemeinsame Zutaten und Vorratsreservierungen werden ohne Doppelzählung berücksichtigt.
   - Personen, Kindertage, verbleibendes Monatsbudget und tatsächliche Ausgaben fließen nachvollziehbar ein.
3. **Persönliche und kreative Rezeptauswahl verbessern**
   - Lieblingsgerichte bleiben bearbeitbar und werden mit neuen, gut belegten Quellen kombiniert.
   - Fixieren, Austauschen, Ablehnen und Resteverwertung aktualisieren Plan, Einkauf und Kosten gemeinsam.
   - Rezeptquelle, Gültigkeit und Bewertung werden sichtbar und überprüfbar behandelt.

## Nächster Lauf

Der nächste automatisierte Entwicklungslauf darf nur eine zusammenhängende Verbesserung aus Aufgabe 1 bearbeiten. Er muss zunächst Status, offene Pull Requests und den letzten Lauf prüfen, maximal 60 Minuten laufen, höchstens zwei gezielte Reparaturversuche machen, relevante Tests ausführen und Ergebnis sowie nächsten Schritt hier dokumentieren. Die Payload-Prüfung ist jetzt die gemeinsame Schutzschicht; als nächster fachlicher Schritt bleibt die getrennte Kostenbasis. Es gibt keinen automatischen Merge und keine Veröffentlichung der App.

## Verweise

- Produktanforderungen und fachliche Regeln: `docs/PRODUKTZIEL.md`.
- Arbeitsregeln: `AGENTS.md`.

