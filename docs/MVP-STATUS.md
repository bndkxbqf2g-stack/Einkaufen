# MVP-Status – Angebotsküche

Stand: 11.11.2026  
Basis: main@87c6c618fe98c16ad10f816f9f63d34451da33c6

## Reparaturpaket 1: Startdarstellung

Status: in `main` integriert und veröffentlicht.

- Befund: Die erste Darstellung hing an `startInitialOfferRefresh().finally(...)`; ein langsamer oder nicht erreichbarer Angebotsabruf konnte den sichtbaren App-Kern verzögern.
- Korrektur: Der lokale/offlinefähige Kern rendert sofort. Der optionale Angebotsabruf aktualisiert anschließend dieselben Ansichten; Fehler werden im bestehenden Statuspfad sichtbar.
- Automatischer Nachweis: Regressionstest für die Reihenfolge sowie Root-/`dist`-Parität; PR-CI-Validierung #982 war grün.
- Veröffentlichung: GitHub-Pages-Deployment #983, Root-Sync #223 und Pages-Build #725 waren grün.
- Noch offen: Ein vollständiger iPhone-End-to-End-Test ist noch nicht durchgeführt. Die Browsersteuerung konnte den veröffentlichten App-Tab laden und den Titel lesen, lief beim DOM-/Screenshot-Zugriff aber in einen reproduzierbaren Timeout. Das bleibt getrennt vom App-Befund.

## Reparaturpaket 2b: Vorratswirkung im Browserablauf

Status: Testabdeckung ergänzt.

- Der MVP-Browserlauf wählt ein deterministisches Reisgericht und legt Reis mit Mengenangabe im Vorrat an.
- Der Einkaufslistenlauf weist den Vorratsabgleich aus und stellt sicher, dass Reis nicht als zusätzlicher Einkaufsartikel erscheint.
- Keine Kaufbuchung, keine Datenbankänderung und keine Angebotsannahme.

## Reparaturpaket 2a: Tagesbezogene Personenzahl

Status: Testabdeckung ergänzt.

- Der Browser-E2E-Test prüft jetzt eine vom globalen Wert abweichende Tagespersonenzahl.
- Die Änderung wird in den lokalen Planungseinstellungen gespeichert und nach einem Reload wiederhergestellt.
- Keine Backend-, Angebots- oder Datenmodelländerung.

## Reparaturpaket 2c: Explizite Mengen und Teildeckung

Status: Testabdeckung ergänzt und in `main` integriert.

- Der Browser-E2E-Test importiert ein manuelles Rezept mit `500 g` Hackfleisch, ordnet es einem Planungstag zu und erfasst `250 g` desselben Vorrats.
- Die Einkaufsliste weist nachweisbar `Vorrat deckt 250 g · Restbedarf 250 g` aus; der Restbedarf bleibt sichtbar und wird nicht stillschweigend entfernt.
- Lokale Mengen-/Planpersistenz und leere JavaScript-/Konsolenfehler wurden im selben Lauf geprüft.
- CI-Nachweis: MVP-Browserlauf #37 (GitHub Actions Run `42968580657`) grün; Pages-Deployment #1027 und Pages-Build/Deploy #734 grün.
- Keine Produktionslogik-, Supabase-, Datenbank- oder kostenpflichtige Dienständerung.

## Reparaturpaket 2d: Optionales Abendessen im Browserablauf

Status: Testabdeckung ergänzt und in `main` integriert.

- Der Browser-E2E-Test importiert ein Brotzeit-Rezept, ordnet es separat einem Planungstag zu und prüft die lokale Speicherung des Abendessenplans.
- Beim Deaktivieren des optionalen Abendessen-Slots verschwindet die Abendessen-Zutat aus der Einkaufsliste; beim erneuten Aktivieren wird sie wieder berücksichtigt.
- Frühstück, Snacks und Getränke werden in diesem Planungspfad nicht als eigene Slots verwendet.
- CI-Nachweis: MVP-Browserlauf #37 (GitHub Actions Run `42968580657`) grün; Pages-Deployment #1027 und Pages-Build/Deploy #734 grün.
- Keine Produktionslogik-, Supabase-, Datenbank- oder kostenpflichtige Dienständerung.

## Reparaturpaket 2e: Rezepttausch im Browserablauf

Status: Testabdeckung ergänzt und in `main` integriert.

- Der Browser-E2E-Test ordnet zunächst ein Rezept einem Tag zu und ersetzt es anschließend durch ein anderes Rezept am selben Tag.
- Die alte Zuordnung wird aus `angebotskueche.manualPlan` entfernt; Planansicht und Einkaufsliste werden nach dem Tausch neu aufgebaut.
- CI-Nachweis: MVP-Browserlauf #44 (GitHub Actions Run `42971340701`) grün; Pages-Deployment #1038 und Pages-Build/Deploy #738 grün.
- Keine Produktionslogik-, Supabase-, Datenbank- oder kostenpflichtige Dienständerung.

## Reparaturpaket 2f: Mobiler Viewport-Nachweis

Status: emulierter Test in `main` integriert.

- Der bestehende Playwright-Lauf prüft einen Touch-Viewport mit `390×844` Pixeln.
- Start, Hauptnavigation, horizontale Überlauffreiheit sowie Speichern und Wiederherstellen eines Einkaufsartikels wurden im mobilen Chromium-Viewport geprüft.
- Das ist ein reproduzierbarer Layout-/Bediennachweis, aber kein echter iPhone-/Safari-Praxistest. Dieser bleibt für den Nutzergerätetest offen.
- CI-Nachweis: MVP-Browserlauf #44 (GitHub Actions Run `42971340701`) grün; Pages-Deployment #1038 und Pages-Build/Deploy #738 grün.
- Keine Produktionslogik-, Supabase-, Datenbank- oder kostenpflichtige Dienständerung.

## Reparaturpaket 2g: Fehlende Angebotsanker transparent behandeln

Status: Testabdeckung ergänzt und in `main` integriert.

- Ein manueller Einkaufsartikel ohne Angebotsanker wird im Browserablauf sichtbar als „ergänzen“ markiert.
- Für diesen Artikel wird kein Preisfeld gerendert; insbesondere wird kein `0 €` als scheinbarer Angebots- oder Kaufpreis angezeigt.
- Der Nachweis ergänzt die bestehenden Unit-Tests für initiale Kosten und Angebots-Evidenz um den sichtbaren End-to-End-Pfad.
- CI-Nachweis: PR #393, Playwright MVP flow Run `42972085920` und `validate` Run `42972085924` grün.
- Keine Produktionslogik-, Supabase-, Datenbank- oder kostenpflichtige Dienständerung.

## Reparaturpaket 2: MVP-Kernablauf

Status: in main integriert und veröffentlicht.

- Reproduzierbarkeit: lokaler Node-Static-Server für `dist/`, gepinnter Playwright-Test-Runner `@playwright/test@1.51.1`, Chromium in GitHub Actions.
- Geprüft: Personenanzahl, Tagesanzahl, optionale Abendessen, Rezeptvorschlag öffnen und einem Tag zuordnen, lokale Speicherung des manuellen Plans.
- Geprüft: Vorrat `Reis` mit `500 g`, tatsächlicher Vorratsabgleich und Speicherung in Pantry/Mengenmodell.
- Geprüft: automatisch berechnete Einkaufsartikel, manueller Zusatzartikel mit zwei Packungen und Persistenz nach Reload.
- Zusätzlich: Der Test sammelt JavaScript-Seitenfehler und `console.error`; beide waren im grünen Lauf leer.
- CI-Nachweis: MVP-Browserlauf #44 (GitHub Actions Run `42971340701`) grün; Pages-Deployment #1038 und Pages-Build/Deploy #738 grün.
- Befund/Fix: Der Einkaufslistencontainer wurde beim Wechsel auf die Seite und nach Reload nicht zuverlässig neu gerendert. `showPage('shopping')` aktualisiert die Liste jetzt. Zusätzlich wurde ein echter Renderfehler in `decoratePlanSourceLinks` korrigiert: NodeList-Iteration verwendet `$$` statt des einzelnen `$`.
- Angebotsabgrenzung: Der Test schaltet den optionalen Filter „mindestens 2 Angebotszutaten“ aus, damit fehlende oder veraltete Angebote den Kernablauf nicht blockieren. Es wurden keine Angebotsdaten erfunden.

## Kernabläufe

Als lokaler Browserablauf grün nachgewiesen:

- Personen und Mahlzeiten auswählen
- Wochenplan erzeugen und ein Gericht austauschen
- Vorrat mit Menge/Einheit speichern
- Einkaufsliste erzeugen und manuellen Artikel speichern
- lokale Persistenz nach Reload
- Angebote als optionale Eingabe behandeln, ohne den Kern zu blockieren

Noch nicht vollständig als produktiver/iPhone-End-to-End-Lauf bestätigt:

- reale Angebotsabrufe und Quellenfrische unter aktuellen Netzbedingungen
- tatsächliche IST-/Belegbeträge und Verbrauchsbuchung
- Supabase-Login, Haushaltsrechte, Realtime-Synchronisierung und Konfliktbehandlung
- vollständige Packungs-/Teilmengen-Matrix im Browser
- Routen-/Fahrtkosten- und Mehrstoppoptimierung

## Bewusst offen

- Tatsächliche IST-/Belegbeträge und Verbrauchsbuchung bleiben bis zur gebündelten Freigabe außerhalb der produktiven UI.
- Supabase-Schema-/Rollen-/Konfliktänderungen bleiben unverändert.
- Keine kostenpflichtige Ressource wurde angelegt.
- Produktive Veröffentlichung über den bestehenden GitHub-Pages-Weg erfolgt erst nach dem vereinbarten Freigabepunkt; dieser PR verändert ausschließlich den bestehenden Code-/CI-Pfad.
