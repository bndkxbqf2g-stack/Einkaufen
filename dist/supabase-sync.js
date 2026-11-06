(function () {
  'use strict';

  const SUPABASE_URL = "https://idcejbnkpeaaqchtkvkd.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qaw9HZma98hZljnGkDmm5g_2qaSXxCW";
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0';
  const MAX_PAYLOAD_BYTES = 600000;
  const HOUSEHOLD_KEY = 'angebotskueche.supabase.household';
  const LOCAL_DATA_HOUSEHOLD_KEY = 'angebotskueche.supabase.localHousehold';
  const REVISION_KEY_PREFIX = 'angebotskueche.supabase.revision.';
  const ARRAY_KEYS = ['pantry', 'favorites', 'dismissedRecipes', 'pinnedRecipes', 'customOffers', 'manualShoppingItems', 'recipeHistory'];

  let app = null;
  let client = null;
  let clientPromise = null;
  let sdkPromise = null;
  let session = null;
  let households = [];
  let selectedHouseholdId = safeGet(HOUSEHOLD_KEY);
  let handlersBound = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  function setStatus(message) {
    const status = byId('supabaseStatus');
    if (status) status.textContent = String(message || '');
  }

  function toast(message) {
    if (typeof app?.showToast === 'function') app.showToast(message);
  }

  function errorMessage(error) {
    const message = String(error?.message || 'Supabase-Anfrage fehlgeschlagen.');
    if (error?.code === '40001' || /changed on another device/i.test(message)) {
      return 'Synchronisierungskonflikt: Der Cloud-Stand wurde auf einem anderen Gerät geändert. Bitte zuerst laden und prüfen; lokale Daten bleiben erhalten.';
    }
    if (error?.code === '42501' || /permission|not a member|edit permission/i.test(message)) {
      return 'Für diesen Haushalt fehlen die nötigen Zugriffsrechte.';
    }
    return message.slice(0, 240);
  }

  function validatePayload(payload) {
    // The app's existing v1 validator owns payload shape; this adds server limits only.
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Ungültiger Angebotsküche-Datenstand.');
    for (const key of ARRAY_KEYS) {
      if (Array.isArray(payload[key]) && payload[key].length > 5000) throw new Error(`Das Array „${key}“ überschreitet das Supabase-Limit.`);
    }
    const byteLength = new TextEncoder().encode(JSON.stringify(payload)).byteLength;
    if (byteLength > MAX_PAYLOAD_BYTES) throw new Error('Der Datenstand überschreitet das Supabase-Limit von 600.000 Bytes.');
    return byteLength;
  }

  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let timer;
      const finish = (error) => {
        clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
        if (error) {
          script.remove();
          reject(error);
        } else if (window.supabase?.createClient) {
          resolve(window.supabase);
        } else {
          reject(new Error('Supabase-JavaScript konnte nicht initialisiert werden.'));
        }
      };
      script.src = SDK_URL;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => finish();
      script.onerror = () => finish(new Error('Supabase-SDK nicht erreichbar. Die lokale App bleibt verfügbar.'));
      timer = setTimeout(() => finish(new Error('Laden des Supabase-SDK hat zu lange gedauert.')), 10000);
      document.head.appendChild(script);
    }).catch(error => {
      sdkPromise = null;
      throw error;
    });
    return sdkPromise;
  }

  function isSignedIn() {
    return Boolean(session && !session.user?.is_anonymous);
  }

  function renderUi() {
    const signedIn = isSignedIn();
    const authFields = byId('supabaseAuthFields');
    const signOut = byId('supabaseSignOut');
    const account = byId('supabaseAccount');
    const householdSelect = byId('supabaseHousehold');
    const createHousehold = byId('supabaseCreateHousehold');

    if (authFields) authFields.hidden = signedIn;
    if (signOut) signOut.hidden = !signedIn;
    if (account) account.textContent = signedIn ? `Angemeldet als ${session.user.email || 'Supabase-Konto'}` : 'Nicht angemeldet';
    if (createHousehold) createHousehold.disabled = !signedIn;

    if (householdSelect) {
      householdSelect.replaceChildren();
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = signedIn ? 'Haushalt auswählen' : 'Nach der Anmeldung verfügbar';
      householdSelect.appendChild(placeholder);
      for (const household of households) {
        const option = document.createElement('option');
        option.value = String(household.household_id);
        option.textContent = `${household.name} · ${household.role}`;
        householdSelect.appendChild(option);
      }
      householdSelect.value = selectedHouseholdId || '';
      householdSelect.disabled = !signedIn || households.length === 0;
    }
  }

  async function ensureClient() {
    if (client) return client;
    if (clientPromise) return clientPromise;

    clientPromise = loadSdk().then(async sdk => {
      client = sdk.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      client.auth.onAuthStateChange((_event, nextSession) => {
        const priorUserId = session?.user?.id;
        session = nextSession;
        if (!session || (priorUserId && session.user?.id !== priorUserId)) {
          households = [];
          if (!session) selectedHouseholdId = null;
        }
        renderUi();
      });
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      session = data?.session || null;
      renderUi();
      return client;
    }).catch(error => {
      client = null;
      clientPromise = null;
      setStatus(errorMessage(error));
      throw error;
    });
    return clientPromise;
  }

  async function requireSession() {
    const activeClient = await ensureClient();
    const { data, error } = await activeClient.auth.getSession();
    if (error) throw error;
    session = data?.session || null;
    renderUi();
    if (!isSignedIn()) throw new Error('Bitte zuerst mit einem bestätigten Konto anmelden.');
    return activeClient;
  }

  function setSelectedHousehold(id) {
    selectedHouseholdId = households.some(item => String(item.household_id) === id) ? id : null;
    if (selectedHouseholdId) safeSet(HOUSEHOLD_KEY, selectedHouseholdId);
    renderUi();
  }

  async function refreshHouseholds() {
    const activeClient = await requireSession();
    const { data, error } = await activeClient.rpc('list_my_households');
    if (error) throw error;
    households = Array.isArray(data) ? data : [];
    const remembered = selectedHouseholdId || safeGet(HOUSEHOLD_KEY);
    const rememberedExists = households.some(item => String(item.household_id) === remembered);
    if (!rememberedExists) {
      selectedHouseholdId = households.length === 1 ? String(households[0].household_id) : null;
    } else {
      selectedHouseholdId = remembered;
    }
    if (selectedHouseholdId) safeSet(HOUSEHOLD_KEY, selectedHouseholdId);
    renderUi();
    return households;
  }

  function selectedHousehold() {
    const household = households.find(item => String(item.household_id) === selectedHouseholdId);
    if (!household) throw new Error('Bitte zuerst in den Einstellungen einen Haushalt auswählen.');
    return household;
  }

  async function readHouseholdState(activeClient, householdId) {
    const { data, error } = await activeClient.rpc('get_household_state', { p_household_id: householdId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return { payload: row.payload, revision: String(row.revision), updatedAt: row.updated_at };
  }

  function revisionKey(householdId) {
    return REVISION_KEY_PREFIX + householdId;
  }

  function savedRevision(householdId) {
    const value = safeGet(revisionKey(householdId));
    return value !== null && /^\d+$/.test(value) ? value : null;
  }

  async function load() {
    const activeClient = await requireSession();
    const household = selectedHousehold();
    setStatus(`Cloud-Stand für „${household.name}“ wird geprüft …`);
    const remote = await readHouseholdState(activeClient, household.household_id);
    if (!remote) {
      safeSet(revisionKey(household.household_id), '0');
      setStatus(`Für „${household.name}“ gibt es noch keinen Cloud-Stand. Lokale Daten wurden nicht verändert.`);
      toast('Noch kein Cloud-Stand. Lokale Daten sind unverändert.');
      return false;
    }
    if (typeof app?.validatePayload !== 'function' || typeof app?.applyPayload !== 'function') {
      throw new Error('Die Datenfunktionen der App sind nicht verfügbar.');
    }
    app.validatePayload(remote.payload);
    validatePayload(remote.payload);
    const stamp = remote.updatedAt ? ` vom ${new Date(remote.updatedAt).toLocaleString('de-DE')}` : '';
    if (!window.confirm(`Cloud-Stand von „${household.name}“${stamp} auf diesem Gerät übernehmen? Lokale Daten werden ersetzt.`)) {
      setStatus('Laden abgebrochen. Lokale Daten bleiben erhalten.');
      return false;
    }
    app.applyPayload(remote.payload, 'Haushaltsdaten geladen – die App wird aktualisiert.');
    safeSet(revisionKey(household.household_id), remote.revision);
    safeSet(LOCAL_DATA_HOUSEHOLD_KEY, String(household.household_id));
    setStatus(`Cloud-Stand von „${household.name}“ übernommen.`);
    return true;
  }

  async function save() {
    const activeClient = await requireSession();
    const household = selectedHousehold();
    if (household.role === 'viewer') throw new Error('Mit der Rolle „viewer“ kann dieser Haushalt nicht geändert werden.');

    setStatus(`Cloud-Stand für „${household.name}“ wird geprüft …`);
    const householdId = String(household.household_id);
    const remote = await readHouseholdState(activeClient, householdId);
    const expectedRevision = savedRevision(householdId);
    const localHousehold = safeGet(LOCAL_DATA_HOUSEHOLD_KEY);

    if (remote) {
      if (localHousehold !== householdId) {
        throw new Error('Dieser Haushalt enthält bereits Cloud-Daten. Bitte zuerst „Cloud laden“ und die Übernahme bestätigen; lokale Daten werden nicht überschrieben.');
      }
      if (expectedRevision !== remote.revision) {
        throw new Error('Der Cloud-Stand ist neuer oder wurde auf diesem Gerät noch nicht geladen. Bitte zuerst „Cloud laden“ und prüfen; es wird nichts überschrieben.');
      }
    } else {
      if (expectedRevision !== null && expectedRevision !== '0') {
        throw new Error('Der bekannte Cloud-Stand ist nicht mehr vorhanden. Bitte zuerst den Haushalt neu laden und prüfen.');
      }
      if (!window.confirm(`In „${household.name}“ gibt es noch keinen Cloud-Stand. Soll der aktuelle lokale App-Stand dort gespeichert werden?`)) return false;
    }

    if (typeof app?.buildPayload !== 'function') throw new Error('Die Datenfunktionen der App sind nicht verfügbar.');
    const payload = app.buildPayload();
    app.validatePayload(payload);
    validatePayload(payload);
    const { data, error } = await activeClient.rpc('save_household_state', {
      p_household_id: householdId,
      p_expected_revision: expectedRevision || '0',
      p_payload: payload,
    });
    if (error) throw error;
    const saved = Array.isArray(data) ? data[0] : data;
    if (!saved?.revision) throw new Error('Supabase hat keinen bestätigten Revisionsstand zurückgegeben.');

    safeSet(revisionKey(householdId), String(saved.revision));
    safeSet(LOCAL_DATA_HOUSEHOLD_KEY, householdId);
    const stamp = saved.updated_at ? new Date(saved.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'jetzt';
    setStatus(`Haushalt „${household.name}“ gespeichert · ${stamp}.`);
    toast(`Haushalt gespeichert · ${stamp}`);
    return true;
  }

  async function signIn() {
    const activeClient = await ensureClient();
    const email = String(byId('supabaseEmail')?.value || '').trim();
    const password = String(byId('supabasePassword')?.value || '');
    if (!email || !password) throw new Error('Bitte E-Mail und Passwort eingeben.');
    setStatus('Anmeldung läuft …');
    const { data, error } = await activeClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    session = data?.session || null;
    if (!isSignedIn()) throw new Error('Anmeldung benötigt noch eine E-Mail-Bestätigung.');
    if (byId('supabasePassword')) byId('supabasePassword').value = '';
    await refreshHouseholds();
    setStatus(`Angemeldet als ${session.user.email || 'Supabase-Konto'}. Haushalt auswählen oder erstellen.`);
  }

  async function signUp() {
    const activeClient = await ensureClient();
    const email = String(byId('supabaseEmail')?.value || '').trim();
    const password = String(byId('supabasePassword')?.value || '');
    if (!email || !password) throw new Error('Bitte E-Mail und Passwort eingeben.');
    if (password.length < 8) throw new Error('Bitte ein Passwort mit mindestens 8 Zeichen verwenden.');
    setStatus('Konto wird bei Supabase angelegt …');
    const { data, error } = await activeClient.auth.signUp({ email, password });
    if (error) throw error;
    if (byId('supabasePassword')) byId('supabasePassword').value = '';
    session = data?.session || null;
    renderUi();
    if (isSignedIn()) {
      await refreshHouseholds();
      setStatus('Konto angelegt und angemeldet. Erstelle oder wähle jetzt einen Haushalt.');
    } else {
      setStatus('Registrierung gestartet. Falls E-Mail-Bestätigung aktiv ist, bitte den Bestätigungslink öffnen und danach hier anmelden. Es wurden keine App-Daten übertragen.');
    }
  }

  async function signOut() {
    const activeClient = await ensureClient();
    const { error } = await activeClient.auth.signOut();
    if (error) throw error;
    session = null;
    households = [];
    selectedHouseholdId = null;
    renderUi();
    setStatus('Abgemeldet. Lokale App-Daten bleiben auf diesem Gerät erhalten.');
  }

  async function createHousehold() {
    const activeClient = await requireSession();
    const name = String(window.prompt('Name des neuen Haushalts (max. 80 Zeichen):', 'Unser Haushalt') || '').trim();
    if (!name) return;
    if (name.length > 80) throw new Error('Der Haushaltsname darf höchstens 80 Zeichen lang sein.');
    setStatus('Haushalt wird erstellt …');
    const { data, error } = await activeClient.rpc('create_household', { p_name: name });
    if (error) throw error;
    await refreshHouseholds();
    const householdId = typeof data === 'string' ? data : Array.isArray(data) ? String(data[0] || '') : '';
    if (householdId && households.some(item => String(item.household_id) === householdId)) setSelectedHousehold(householdId);
    setStatus(`Haushalt „${name}“ erstellt. Es wurden noch keine lokalen Daten übertragen.`);
  }

  function bindAction(id, action) {
    const button = byId(id);
    if (!button) return;
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await action();
      } catch (error) {
        const message = errorMessage(error);
        setStatus(message);
        toast(message);
      } finally {
        button.disabled = false;
        renderUi();
      }
    });
  }

  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;
    bindAction('supabaseSignIn', signIn);
    bindAction('supabaseSignUp', signUp);
    bindAction('supabaseSignOut', signOut);
    bindAction('supabaseCreateHousehold', createHousehold);
    const select = byId('supabaseHousehold');
    if (select) {
      select.addEventListener('change', () => {
        setSelectedHousehold(String(select.value || ''));
        const household = households.find(item => String(item.household_id) === selectedHouseholdId);
        setStatus(household
          ? `„${household.name}“ ausgewählt. Bestehende Cloud-Daten zuerst laden, bevor dieser Haushalt gespeichert wird.`
          : 'Bitte einen Haushalt auswählen.');
      });
    }
  }

  async function initialize(hooks) {
    if (hooks) app = hooks;
    bindHandlers();
    try {
      await ensureClient();
      if (isSignedIn()) {
        try {
          await refreshHouseholds();
          setStatus(`Angemeldet als ${session.user.email || 'Supabase-Konto'}.`);
        } catch (error) {
          setStatus(`Angemeldet; Haushalt konnte nicht geladen werden: ${errorMessage(error)}`);
        }
      } else {
        setStatus('Supabase bereit. Anmeldung nötig, bevor Haushaltsdaten synchronisiert werden.');
      }
      return true;
    } catch (error) {
      setStatus(`Supabase-Anmeldung momentan nicht verfügbar. Lokale Daten bleiben nutzbar. ${errorMessage(error)}`);
      return false;
    }
  }

  async function hasSession() {
    try {
      await ensureClient();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      session = data?.session || null;
      renderUi();
      return isSignedIn();
    } catch {
      return false;
    }
  }

  function openSettings() {
    const modal = byId('settingsModal');
    if (modal) modal.classList.add('open');
    setTimeout(() => byId('supabaseEmail')?.focus(), 0);
  }

  async function guardedSync(action) {
    try {
      return await action();
    } catch (error) {
      const message = errorMessage(error);
      setStatus(message);
      throw new Error(message);
    }
  }

  window.angebotskuecheSupabaseSync = {
    initialize,
    hasSession,
    save: () => guardedSync(save),
    load: () => guardedSync(load),
    openSettings,
    validatePayload,
  };
})();
