# MVP-Status – Angebotsküche

Stand: 10.11.2026  
Basis: PR-Branch `codex/mvp-playwright-e2e-20261110` @ `113dbd27a1a1473c9ed6d2ab03628c8de7c324b9`

## Reparaturpaket 1: Startdarstellung

Status: in `main` integriert und veröffentlicht.

- Befund: Die erste Darstellung hing an `startInitialOfferRefresh().finally(...)`; ein langsamer oder nicht erreichbarer Angebotsabruf konnte den sichtbaren App-Kern verzögern.
- Korrektur: Der lokale/offlinefähige Kern rendert sofort. Der optionale Angebotsabruf aktualisiert anschließend dieselben Ansichten; Fehler werden im bestehenden Statuspfad sichtbar.
- Automatischer Nachweis: Regressionstest für die Reihenfolge sowie Root-/`dist`-Parität; PR-CI-Validierung #982 war grün.
- Veröffentlichung: GitHub-Pages-Deployment #983, Root-Sync #223 und Pages-Build #725 waren grün.
- Noch offen: Ein vollständiger iPhone-End-to-End-Test ist noch nicht durchgeführt. Die Browsersteuerung konnte den veröffentlichten App-Tab laden und den Titel lesen, lief beim DOM-/Screenshot-Zugriff aber in einen reproduzierbaren Timeout. Das bleibt getrennt vom App-Befund.

## Reparaturpaket 2: MVP-Kernablauf

Status: Browser-End-to-End-Test grün; PR #381 wartet auf Integration.

- Reproduzierbarkeit: lokaler Node-Static-Server für `dist/`, gepinnter Playwright-Test-Runner `@playwright/test@1.51.1`, Chromium in GitHub Actions.
- Geprüft: Personenanzahl, Tagesanzahl, optionale Abendessen, Rezeptvorschlag öffnen und einem Tag zuordnen, lokale Speicherung des manuellen Plans.
- Geprüft: Vorrat `E2E-Reis` mit `500 g`, Speicherung in Pantry und Mengenmodell.
- Geprüft: automatisch berechnete Einkaufsartikel, manueller Zusatzartikel mit zwei Packungen und Persistenz nach Reload.
- Zusätzlich: Der Test sammelt JavaScript-Seitenfehler und `console.error`; beide waren im grünen Lauf leer.
- CI-Nachweis: MVP-Browserlauf #21 (GitHub Actions Run `42828193534`) grün; bestehender Pages-Validierungs-/Deploymentlauf #1006 grün.
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
