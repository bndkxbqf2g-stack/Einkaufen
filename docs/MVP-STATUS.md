# MVP-Status – Angebotsküche

Stand: 10.11.2026  
Basis: main@84df2e87fe9376c090ee0efe91e0075694aefb23

## Reparaturpaket 1: Startdarstellung

Status: in main integriert und veröffentlicht.

- Befund: Die erste Darstellung hing an startInitialOfferRefresh().finally(...); ein langsamer oder nicht erreichbarer Angebotsabruf konnte den sichtbaren App-Kern verzögern.
- Korrektur: Der lokale/offlinefähige Kern rendert sofort. Der optionale Angebotsabruf aktualisiert anschließend dieselben Ansichten; Fehler werden im bestehenden Statuspfad sichtbar.
- Automatischer Nachweis: Regressionstest für die Reihenfolge sowie Root-/dist-Parität; PR-CI-Validierung #982 war grün.
- Veröffentlichung: GitHub-Pages-Deployment #983, Root-Sync #223 und Pages-Build #725 waren grün.
- Noch nicht behauptet: Ein vollständiger iPhone-End-to-End-Test ist noch offen. Die Browsersteuerung konnte den veröffentlichten App-Tab laden und den Titel lesen, lief beim DOM-/Screenshot-Zugriff aber in einen reproduzierbaren Timeout. Das ist getrennt vom App-Befund zu behandeln.

## Kernabläufe

Noch nicht vollständig als End-to-End-Lauf bestätigt:

- Personen und Mahlzeiten auswählen
- Wochenplan erzeugen und einzelne Gerichte austauschen
- Mengen-/Packungsberechnung mit Teilvorrat und Resteverwendung
- Einkaufsliste erzeugen, abhaken und lokal wieder laden
- Veraltete/fehlende Angebotsquellen ohne Blockade sichtbar behandeln

## Bewusst offen

- Tatsächliche IST-/Belegbeträge und Verbrauchsbuchung bleiben bis zur gebündelten Freigabe außerhalb der produktiven UI.
- Supabase-Schema-/Rollen-/Konfliktänderungen bleiben unverändert.
- Routen-/Fahrtkosten- und Mehrstoppoptimierung bleibt freigabepflichtig.
- Keine kostenpflichtige Ressource wurde angelegt.
