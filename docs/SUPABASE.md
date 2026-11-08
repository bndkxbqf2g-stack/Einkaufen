# Supabase-Setup

Stand: 06.11.2026

## Projekt

- Supabase-Projekt: `Angebotskueche`
- Organisation: `FamSchicht` (Free-Tarif)
- Projekt-Ref: `idcejbnkpeaaqchtkvkd`
- Region: `eu-central-1`
- API-URL: `https://idcejbnkpeaaqchtkvkd.supabase.co`
- Projektanlage wurde mit 0 USD/Monat ausgewiesen. Es wurden keine weiteren Ressourcen angelegt.
- Das bestehende Projekt `mein-geldplan` wurde nicht geändert. `FamSchicht` wurde nicht gelöscht.

## Datenmodell und Zugriff

Die Tabellen `app_private.households`, `app_private.household_members` und
`app_private.household_state` sind mit RLS geschützt und liegen außerhalb des
üblichen Data-API-Schemas. Authentifizierte Nutzer erhalten nur Leserechte auf
die Tabellen; Schreibzugriffe laufen über geprüfte RPCs. Anonyme und nicht
angemeldete Sitzungen sind ausgeschlossen. Die Sicherheitsprüfung von Supabase
meldet aktuell keine Findings.

Die RPC-Schnittstelle lautet:

- `create_household(p_name)` – erstellt einen Haushalt und setzt den Aufrufer als Owner.
- `list_my_households()` – listet ausschließlich Haushalte des Aufrufers.
- `get_household_state(p_household_id)` – liest den gemeinsamen Zustand des Haushalts.
- `save_household_state(p_household_id, p_expected_revision, p_payload)` – speichert
  nur bei erwarteter Revision. Revision `0` legt den ersten Stand an; eine veraltete
  Revision liefert SQLSTATE `40001`, damit ein Client einen Konflikt anzeigen oder
  zusammenführen kann, statt Änderungen still zu überschreiben.

Der gespeicherte JSON-Zustand folgt dem bestehenden App-Format Version 1 und dem
bisherigen Limit von 600.000 Bytes. Die Datenbank prüft zusätzlich bekannte
Array-/Objektfelder und Arraygrößen. Mitgliedschaftsrollen sind `owner`, `editor`
und `viewer`. Ein Einladungs-/Beitrittsablauf ist noch nicht implementiert.

Die CLI-Konfiguration exponiert nur `public` und `graphql_public`; `app_private`
ist nicht als Data-API-Schema eingetragen. Neue Tabellen im lokalen Setup sind
nicht automatisch exponiert. Siehe [supabase/config.toml](../supabase/config.toml).

## App-Anbindung (implementiert und auf GitHub Pages veröffentlicht)

[`supabase-sync.js`](../supabase-sync.js) bindet die gepinnte Version
`@supabase/supabase-js@2.119.0` bei Bedarf über jsDelivr ein, wenn Einstellungen
oder Cloud-Sync geöffnet werden. Verwendet werden nur Projekt-URL und
Publishable Key; Secret-/Service-Role-Schlüssel kommen nicht in den Browser.
Auth-Sitzungen werden vom offiziellen Client auf diesem Gerät persistiert.

In den Einstellungen gibt es E-Mail/Passwort-Anmeldung, Haushaltsauswahl und
Haushaltserstellung. Der Nutzerzustand wird weiterhin im bestehenden v1-Format
aus `localStorage` gelesen. Nichts wird automatisch hochgeladen. Ein leerer
Haushalt erhält lokale Daten erst nach einer ausdrücklichen Speicherbestätigung;
Cloud-Laden übernimmt nach Bestätigung die im Snapshot enthaltenen Felder.
Optionale Felder, die in einem älteren v1-Snapshot fehlen, bleiben lokal
unverändert. Bei veralteter Revision bricht der Compare-and-swap-Speichervorgang
ab und fordert zum Prüfen/Laden auf.
Einladungen und Beitrittslinks sind noch nicht implementiert.

Die Cloud-Schaltflächen verwenden auf GitHub Pages Supabase, sobald ein Konto
angemeldet ist. Beim bisherigen App-Backend bleibt `/api/sync` mit D1 als
Fallback erhalten, solange keine Supabase-Sitzung aktiv ist. Lokale Funktionen
und JSON-Backup bleiben ohne Netzwerk nutzbar; es gibt derzeit keine
Offline-Warteschlange oder automatische Konfliktzusammenführung.

Der optionale Worker-/D1-Pfad hat eine separate, hostingabhängige Vertrauensgrenze: `worker/index.js` übernimmt `oai-authenticated-user-id` als D1-Schlüssel und prüft im Repository nur, ob der Header nicht leer ist. Eine Signatur- oder JWT-Prüfung ist dort nicht enthalten. Der Pfad darf deshalb nur hinter einer Hosting-Schicht betrieben werden, die den Header verlässlich aus einer authentifizierten Sitzung setzt und clientseitig gesetzte Header verhindert; eine direkt öffentliche Worker-URL ist ohne zusätzliche Authentifizierung nicht freigabefähig. Diese Voraussetzung wurde in diesem Audit nicht verändert.

[`sw.js`](../sw.js) cached nur noch gleich-originierte App-Ressourcen. Externe
Supabase-/CDN-Antworten sowie der private D1-Endpunkt `/api/sync` werden nicht
vom Service Worker abgefangen oder gecached. Der App-Worker liefert
`supabase-sync.js` ebenfalls aus.

Der Nutzer hat am 06.11.2026 bestätigt, die Supabase Auth Site-URL und
Redirect-Allowlist auf `https://bndkxbqf2g-stack.github.io/Einkaufen/` gesetzt zu
haben. Die Dashboardwerte waren über die getrennte Codex-Browsersitzung nicht
unabhängig auslesbar. Ein echter Anmelde-/Bestätigungslauf in der App steht
deshalb weiterhin aus. Es wurde kein eigener SMTP-Dienst eingerichtet. Die
Anmeldung meldet, wenn die E-Mail-Bestätigung noch aussteht.

Der Supabase-Integrationscommit wurde am 06.11.2026 auf GitHub Pages veröffentlicht;
Validierung, Worker-Prüfung und Deployment liefen erfolgreich ([GitHub-Actions-Lauf](https://github.com/bndkxbqf2g-stack/Einkaufen/actions/runs/42249870124)).
Vorhandene `localStorage`- oder D1-Daten wurden nicht übernommen. Zum Zeitpunkt
der letzten Projektprüfung enthielt Supabase keine Haushalte oder App-Zustände.

## Migrationen

- [Haushalts- und Sync-Grundlage](../supabase/migrations/20261106150037_household_sync_foundation.sql)
- [RLS-Lesepolicies und Indizes](../supabase/migrations/20261106150301_private_schema_read_policies.sql)
- [RLS-Policy-Optimierung](../supabase/migrations/20261106150906_rls_policy_auth_claim_cache.sql)
- [Validierung des Rezeptverlaufs](../supabase/migrations/20261106152728_recipe_history_validation.sql)

Die Migrationen wurden auf dem neuen `Angebotskueche`-Projekt angewendet und
remote in der Migrationstabelle verifiziert. Security- und Health-Advisors sind
sauber. Der Performance-Advisor zeigt nur unbenutzte Indizes auf den noch leeren
Tabellen; das ist erwartbar, bis die App die Haushaltsabfragen ausführt.

## Verifikation und nächste Schritte

- Unit-Tests decken v1-Payloads, `recipeHistory`, Arraygrenzen, UTF-8-Größenlimit
  und den fehlenden Service-Role-Key ab.
- Der Worker-Test prüft, dass `supabase-sync.js` ausgeliefert und die neue
  Service-Worker-Version eingebettet wird.
- GitHub-Pages-Deployment des Supabase-Integrationsstands ist erfolgreich.
- Ein echter End-to-End-Anmelde-/Registrierungslauf benötigt ein Testkonto und
  steht noch aus. Die Auth-URLs wurden laut Nutzer im Dashboard gesetzt, aber
  über die verfügbare Projekt-API nicht unabhängig verifiziert.
- Offen bleiben Einladungen, Offline-Queue/Konflikt-UX über mehrere Geräte und
  der End-to-End-Test mit einem vom Nutzer angelegten Konto. Es wurden keine
  App-Daten migriert.
