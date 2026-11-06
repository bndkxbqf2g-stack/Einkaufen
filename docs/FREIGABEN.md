# Gebündelte Freigaben und externe Voraussetzungen

Stand: 06.11.2026

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
- Ein isolierter Branch ergänzt bekannte Angebotssummen je Markt; unbekannte Preise bleiben separat. Auf dem aktuellen main 58/58 Tests und Worker-Prüfungen grün; PR und CI-Abgleich stehen noch aus.
- Chat A ist auf Wunsch pausiert. Die Deploy-Pfadsteuerung bleibt uncommittet im verwalteten Worktree; keine Deploy-, Auth- oder Datenbankänderungen wurden ausgeführt.
- Die zusätzliche Marktstopp-Schwelle und Fahrtkostenbasis werden als spätere Nutzerentscheidung gesammelt. Bis dahin bleibt automatische Routen-/Mehrstoppoptimierung deaktiviert.
- Neue Entscheidungen zu Kosten, Nutzerdaten, Cloud, Rechten oder Produktumfang werden hier vor ihrer Umsetzung gesammelt.
