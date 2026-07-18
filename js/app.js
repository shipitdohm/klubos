/* ══════════════════════════════════════════════════════════════
   KLUBOS — Shared Application Logic
   ══════════════════════════════════════════════════════════════ */

/* ── Supabase Setup ─────────────────────────────────────────── */
// const SUPABASE_URL = 'YOUR_SUPABASE_URL';
// const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── Auth Handlers ──────────────────────────────────────────── */

const KLUBOS_ADMIN_CLUB = {
  name: 'TC Kirchhörde',
  legalName: 'Tennis-Club Kirchhörde e.V.',
  shortName: 'TCK',
  website: 'https://tennisclubkirchhoerde.de/',
  logo: 'https://tennisclubkirchhoerde.de/wp-content/uploads/2022/11/TCK_Logo.png',
  ort: 'Dortmund-Kirchhörde',
  verband: 'Westfälischer Tennis-Verband',
  mitglieder: 342,
};

const KLUBOS_DEFAULT_SETTINGS = {
  contribution: '120 €/Jahr',
  widgets: {
    'widget-mitglieder': true,
    'widget-naechstes-event': true,
    'widget-platzbelegung': true,
    'widget-aufgaben': true,
    'widget-vorstandssitzung': true,
    'widget-sponsoren': true,
  },
};

const KLUBOS_DEFAULT_WORKSPACE = {
  schemaVersion: 1,
  club: KLUBOS_ADMIN_CLUB,
  members: [
    { id: 'm-1', name: 'Anna Weber', role: 'Mitglied', status: 'Aktiv' },
    { id: 'm-2', name: 'Thomas Müller', role: 'Mannschaftsführer', status: 'Aktiv' },
    { id: 'm-3', name: 'Julia Schneider', role: 'Jugendwartin', status: 'Aktiv' },
  ],
  events: [
    { id: 'e-1', title: 'Sommerfest', date: 'Sa, 14. Juni', type: 'Vereinsevent' },
    { id: 'e-2', title: 'Jahreshauptversammlung', date: 'Mi, 18. Juni', type: 'Vorstand' },
    { id: 'e-3', title: 'Jugendturnier', date: 'Sa, 12. Juli', type: 'Sport' },
  ],
  sponsors: [
    { id: 's-1', name: 'Sparkasse Musterstadt', volume: 15000, status: 'Aktiv' },
    { id: 's-2', name: 'Regionalwerk GmbH', volume: 5000, status: 'Aktiv' },
    { id: 's-3', name: 'Sportshop Müller', volume: 3000, status: 'Aktiv' },
    { id: 's-4', name: 'Bäckerei Schmidt', volume: 1500, status: 'Läuft aus' },
  ],
  transactions: [
    { id: 't-1', label: 'Mitgliedsbeiträge Juni', amount: 8200, type: 'Einnahme' },
    { id: 't-2', label: 'Platzpflege', amount: -1400, type: 'Ausgabe' },
  ],
  bookings: [],
  tasks: [
    { id: 'task-1', title: 'Einladung zur JHV vorbereiten', done: false },
    { id: 'task-2', title: 'Sponsorenverträge prüfen', done: false },
    { id: 'task-3', title: 'Sommerfest abstimmen', done: false },
  ],
  metrics: { occupancy: '87%', bookingsThisWeek: 12, availableSlots: 3, budget: 38400, incomeYtd: 24500, expensesYtd: 12800, balance: 11700, sponsorVolume: 24500 },
  assets: [],
  brandProfile: { color: '#D0684C', tone: '' },
};

function cloneWorkspace(value) {
  return JSON.parse(JSON.stringify(value));
}

function getWorkspace() {
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem('klubos_workspace') || 'null'); } catch (_) {}
  const workspace = stored || cloneWorkspace(KLUBOS_DEFAULT_WORKSPACE);
  workspace.club = { ...KLUBOS_DEFAULT_WORKSPACE.club, ...(workspace.club || {}) };
  workspace.members = Array.isArray(workspace.members) ? workspace.members : [];
  workspace.events = Array.isArray(workspace.events) ? workspace.events : [];
  workspace.sponsors = Array.isArray(workspace.sponsors) ? workspace.sponsors : [];
  workspace.transactions = Array.isArray(workspace.transactions) ? workspace.transactions : [];
  workspace.bookings = Array.isArray(workspace.bookings) ? workspace.bookings : [];
  workspace.tasks = Array.isArray(workspace.tasks) ? workspace.tasks : [];
  workspace.assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  workspace.brandProfile = { ...KLUBOS_DEFAULT_WORKSPACE.brandProfile, ...(workspace.brandProfile || {}) };
  workspace.metrics = { ...KLUBOS_DEFAULT_WORKSPACE.metrics, ...(workspace.metrics || {}) };
  return workspace;
}

function saveWorkspace(workspace) {
  try { localStorage.setItem('klubos_workspace', JSON.stringify(workspace)); } catch (_) {}
  return workspace;
}

function updateWorkspace(mutator) {
  const workspace = getWorkspace();
  mutator(workspace);
  return saveWorkspace(workspace);
}

function getClubState() {
  const workspace = getWorkspace();
  try {
    return JSON.parse(localStorage.getItem('klubos_verein') || 'null') || workspace.club || KLUBOS_ADMIN_CLUB;
  } catch (_) {
    return KLUBOS_ADMIN_CLUB;
  }
}

function getClubSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem('klubos_settings') || 'null');
    return {
      ...KLUBOS_DEFAULT_SETTINGS,
      ...stored,
      widgets: { ...KLUBOS_DEFAULT_SETTINGS.widgets, ...(stored?.widgets || {}) },
    };
  } catch (_) {
    return KLUBOS_DEFAULT_SETTINGS;
  }
}

function saveClubSettings(settings) {
  try { localStorage.setItem('klubos_settings', JSON.stringify(settings)); } catch (_) {}
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // TODO: Replace with Supabase auth
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  // if (error) return showError(error.message);
  // window.location = 'dashboard.html';

  if (email.toLowerCase() !== 'admin' || password !== 'admin') {
    showError('Bitte prüfe Benutzername und Passwort.');
    return false;
  }

  seedAdminSession();
  return false;
}

function seedAdminSession() {
  let pendingClub = null;
  try { pendingClub = JSON.parse(localStorage.getItem('klubos_pending_club') || 'null'); } catch (_) {}
  const selectedClub = pendingClub || KLUBOS_ADMIN_CLUB;
  const adminUser = {
    username: 'admin',
    name: 'Admin',
    role: 'Admin',
    verein: selectedClub.name,
  };

  const adminClub = {
    verein: selectedClub.legalName || selectedClub.name,
    name: selectedClub.name,
    shortName: selectedClub.shortName || '',
    website: selectedClub.website || '',
    logo: selectedClub.logo || '',
    ort: selectedClub.ort || '',
    verband: selectedClub.verband || '',
    mitglieder: selectedClub.mitglieder || 0,
  };

  try {
    localStorage.setItem('klubos_user', JSON.stringify(adminUser));
    localStorage.setItem('klubos_verein', JSON.stringify(adminClub));
    localStorage.setItem('klubos_auth_mode', 'admin');
    if (pendingClub) localStorage.removeItem('klubos_pending_club');
  } catch (_) {}

  const existing = getWorkspace();
  existing.club = adminClub;
  if (pendingClub?.mitglieder) existing.club.mitglieder = pendingClub.mitglieder;
  saveWorkspace(existing);

  window.location.href = 'dashboard.html';
}

function handleSignup(event) {
  event.preventDefault();
  const verein = document.getElementById('verein').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  // TODO: Replace with Supabase auth
  // const { data, error } = await supabase.auth.signUp({
  //   email, password,
  //   options: { data: { verein, name } }
  // });
  // if (error) return showError(error.message);

  console.log('Signup:', { verein, name, email, password });
  window.location.href = 'vereinssuche.html?verein=' + encodeURIComponent(verein);
  return false;
}

function showError(message) {
  const existing = document.querySelector('.form-error');
  if (existing) existing.remove();
  const el = document.createElement('p');
  el.className = 'form-error';
  el.textContent = message;
  const form = document.querySelector('form');
  form.appendChild(el);
}

/* ── Chat (Vereins-KI) ─────────────────────────────────────── */

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';

  // Simulate AI response
  setTimeout(() => {
    const responses = {
      'Sommersaison planen': 'Gerne! Basierend auf den Vorjahresdaten empfehle ich folgende Termine für die Sommersaison:\n\n• **Trainingsauftakt:** 12. April\n• **Erstes Heimspiel:** 27. April\n• **Sommerfest:** 20. Juli\n• **Saisonabschluss:** 28. September\n\nSoll ich die Termine direkt im Vereinskalender anlegen?',
      'Sponsorenbericht schreiben': 'Hier ist der Entwurf für den Sponsorenbericht:\n\n---\n**Sponsorenbericht Q2 2026**\n\nAktive Sponsoren: 4\n- Sparkasse Musterstadt (Hauptsponsor, 15.000 €)\n- Regionalwerk GmbH (5.000 €)\n- Sportshop Müller (3.000 €)\n- Bäckerei Schmidt (1.500 €)\n\nGesamteinnahmen: 24.500 €\nAuslaufende Verträge: 1 (Bäckerei Schmidt, 30.09.)\n---\n\nSoll ich den Bericht als PDF exportieren?',
      'Einladung zur JHV erstellen': 'Hier ist der Entwurf für die Einladung:\n\n---\n**Einladung zur Jahreshauptversammlung 2026**\n\nLiebe Mitglieder des TSV Musterstadt 1890,\n\nhiermit laden wir euch herzlich zur diesjährigen Jahreshauptversammlung ein:\n\n**Datum:** Mittwoch, 18. Juni 2026\n**Uhrzeit:** 19:00 Uhr\n**Ort:** Vereinsheim, Sportplatzstraße 12\n\n**Tagesordnung:**\n1. Bericht des Vorstands\n2. Kassenbericht 2025\n3. Entlastung des Vorstands\n4. Neuwahlen\n5. Verschiedenes\n\n---\n\nSoll ich die Einladung an alle Mitglieder versenden?',
      'Mitglieder-Erinnerung senden': 'Ich habe 87 Mitglieder identifiziert, deren Beitragszahlung aussteht. Möchtest du eine freundliche Erinnerung an folgende Gruppen senden?\n\n• **Fällig seit 30+ Tagen:** 12 Mitglieder\n• **Fällig seit 14–30 Tagen:** 34 Mitglieder\n• **Fällig seit 1–14 Tagen:** 41 Mitglieder\n\nStandard-Text: "Liebes Mitglied, dein Mitgliedsbeitrag ist noch ausstehend. Bitte überweise den Betrag bis zum 15. des Monats auf das Vereinskonto."\n\nSoll ich die Erinnerungen versenden?'
    };

    const response = responses[text] || `Danke für deine Frage zu "${text}". Ich durchsuche die Vereinsdatenbank und melde mich gleich mit einer detaillierten Antwort.`;
    addMessage(response, 'ai');
  }, 600);
}

function sendPrompt(prompt) {
  document.getElementById('chat-input').value = prompt;
  sendMessage();
}

function addMessage(text, role) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = role === 'user' ? 'MK' : 'KI';
  if (role === 'ai') {
    avatar.style.background = 'var(--accent)';
    avatar.style.color = '#fff';
  }

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  if (role === 'user') {
    div.appendChild(bubble);
    div.appendChild(avatar);
  } else {
    div.appendChild(avatar);
    div.appendChild(bubble);
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/* ── Auto-resize textarea ──────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  applyClubState();
  initializeAiTaskMode();

  document.querySelectorAll('[data-demo-action]').forEach((button) => {
    button.addEventListener('click', () => showInlineStatus(button.dataset.demoAction));
  });
  document.querySelectorAll('[data-workspace-action]').forEach((button) => {
    button.addEventListener('click', () => openWorkspaceForm(button.dataset.workspaceAction));
  });

  const textarea = document.getElementById('chat-input');
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

function initializeAiTaskMode() {
  const task = new URLSearchParams(window.location.search).get('task');
  const main = document.querySelector('[data-od-id="vereins-ki-main"]');
  if (!main || !task) return;
  const workspace = getWorkspace();
  const clubName = workspace.club?.name || 'euer Verein';
  const header = main.querySelector('.page-header');
  const container = main.querySelector('.chat-container');
  if (!header || !container) return;

  if (task === 'social') {
    const safeClubName = escapeHtml(clubName);
    header.querySelector('.page-title').textContent = 'Social Media Generator';
    header.querySelector('.page-subtitle').textContent = `Erstellt einen passenden Vereins-Post für ${clubName} — mit eurem Brand Kit als Kontext.`;
    container.className = 'generator-shell';
    container.innerHTML = `
      <div class="generator-intro card">
        <div><span class="body-xs" style="color:var(--accent)">VEREINS-KI · SOCIAL</span><h2 style="margin-top:.35rem">Vom Vereinsmoment zum fertigen Post.</h2><p class="body-sm" style="margin-top:.35rem">KlubOS nutzt eure freigegebenen Assets und Tonalität. Ihr prüft jeden Entwurf, bevor er veröffentlicht wird.</p></div>
        <div class="generator-context"><span class="badge badge-success">${workspace.assets.length} Assets verbunden</span><span class="badge">${workspace.brandProfile?.tone ? 'Tonalität hinterlegt' : 'Tonalität ergänzen'}</span></div>
      </div>
      <div class="generator-grid">
        <form class="card generator-form" data-social-form>
          <div class="card-header"><div><span class="body-xs">1 · Briefing</span><h3 style="margin-top:.3rem">Was soll raus?</h3></div><span class="card-icon">✦</span></div>
          <label class="form-group"><span class="form-label">Kanal</span><select class="input" name="channel"><option>Instagram</option><option>Facebook</option><option>Vereinswebsite</option></select></label>
          <label class="form-group"><span class="form-label">Thema</span><input class="input" name="topic" required placeholder="z. B. Sommerfest am Samstag"></label>
          <label class="form-group"><span class="form-label">Was soll der Post auslösen?</span><textarea class="input" name="goal" rows="3" placeholder="z. B. Mitglieder zur Anmeldung motivieren"></textarea></label>
          <button class="btn btn-primary" type="submit">Entwurf erstellen <span aria-hidden="true">→</span></button>
          <p class="body-xs" style="margin-top:.75rem">Der Entwurf ist noch nicht veröffentlicht.</p>
        </form>
        <section class="card generator-preview" aria-live="polite">
          <div class="card-header"><div><span class="body-xs">2 · Vorschau</span><h3 style="margin-top:.3rem">Euer Entwurf</h3></div><span class="badge">Noch nicht erstellt</span></div>
          <div class="social-preview-empty"><div class="empty-state-icon">✦</div><h3>Bereit für euren Vereinsmoment</h3><p>Füllt links ein kurzes Briefing aus. KlubOS erstellt daraus Text, Bildidee und einen klaren nächsten Schritt.</p></div>
        </section>
      </div>`;
    const form = container.querySelector('[data-social-form]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      const safeTopic = escapeHtml(values.topic || 'Vereinsmoment');
      const safeGoal = escapeHtml(values.goal || 'Gemeinsam erleben, was unseren Verein ausmacht. Mehr Details und Anmeldung direkt bei uns im Verein.');
      const preview = container.querySelector('.generator-preview');
      const asset = workspace.assets[0];
      preview.innerHTML = `
        <div class="card-header"><div><span class="body-xs">2 · Vorschau</span><h3 style="margin-top:.3rem">${values.channel}-Entwurf</h3></div><span class="badge badge-success">Prüfen</span></div>
        <article class="social-preview-card">
          <div class="social-preview-media"><span>${asset ? '' : 'Euer Vereinsbild'}</span></div>
          <div class="social-preview-copy"><strong>${safeClubName}</strong><p><b>${safeTopic}</b><br><br>${safeGoal}</p><span class="body-xs">#${clubName.replace(/[^a-zA-Z0-9äöüÄÖÜ]/g, '').toLowerCase()} #vereinsleben</span></div>
          <div class="generator-actions"><button type="button" class="btn btn-secondary" data-demo-action="Text kann nach der Prüfung weiter angepasst werden.">Text anpassen</button><button type="button" class="btn btn-primary" data-demo-action="Export wird mit der produktiven Medienablage verbunden.">Export vorbereiten</button></div>
        </article>`;
      if (asset) preview.querySelector('.social-preview-media').style.backgroundImage = `url("${asset.url}")`;
      preview.querySelectorAll('[data-demo-action]').forEach((button) => button.addEventListener('click', () => showInlineStatus(button.dataset.demoAction)));
    });
  } else if (task === 'magazin') {
    const safeClubName = escapeHtml(clubName);
    header.querySelector('.page-title').textContent = 'Vereinsmagazin Generator';
    header.querySelector('.page-subtitle').textContent = `Erstellt eine lesbare Ausgabe für ${clubName} — mit euren Themen, Assets und Vereinsdaten als Kontext.`;
    container.className = 'generator-shell';
    container.innerHTML = `
      <div class="generator-intro card">
        <div><span class="body-xs" style="color:var(--accent)">VEREINS-KI · MAGAZIN</span><h2 style="margin-top:.35rem">Vom Vereinsalltag zur fertigen Ausgabe.</h2><p class="body-sm" style="margin-top:.35rem">Strukturiert Berichte, Termine und Aufrufe zu einem Entwurf, den ihr gemeinsam prüfen und weiterbearbeiten könnt.</p></div>
        <div class="generator-context"><span class="badge badge-success">${workspace.assets.length} Assets verbunden</span><span class="badge">Vereinsdaten als Kontext</span></div>
      </div>
      <div class="generator-grid">
        <form class="card generator-form" data-magazin-form>
          <div class="card-header"><div><span class="body-xs">1 · AUSGABE PLANEN</span><h3 style="margin-top:.3rem">Was soll hinein?</h3></div><span class="card-icon">▤</span></div>
          <label class="form-group"><span class="form-label">Ausgabe</span><select class="input" name="edition"><option>Sommerausgabe</option><option>Monatsupdate</option><option>Saisonrückblick</option></select></label>
          <label class="form-group"><span class="form-label">Hauptthema</span><input class="input" name="topic" required placeholder="z. B. Saisonstart und Sommerfest"></label>
          <label class="form-group"><span class="form-label">Welche Inhalte sollen enthalten sein?</span><textarea class="input" name="sections" rows="3" placeholder="z. B. Termine, Mannschaften, Helferaufruf"></textarea></label>
          <button class="btn btn-primary" type="submit">Ausgabe-Entwurf erstellen <span aria-hidden="true">→</span></button>
          <p class="body-xs" style="margin-top:.75rem">Der Entwurf bleibt intern, bis ihr ihn freigebt.</p>
        </form>
        <section class="card generator-preview" aria-live="polite">
          <div class="card-header"><div><span class="body-xs">2 · VORSCHAU</span><h3 style="margin-top:.3rem">Euer Magazin</h3></div><span class="badge">Noch nicht erstellt</span></div>
          <div class="social-preview-empty"><div class="empty-state-icon">▤</div><h3>Bereit für die nächste Ausgabe</h3><p>Definiert links Thema und Rubriken. KlubOS formt daraus eine klare, gut lesbare erste Struktur.</p></div>
        </section>
      </div>`;
    const form = container.querySelector('[data-magazin-form]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      const safeTopic = escapeHtml(values.topic || 'Vereinsmoment');
      const safeSections = escapeHtml(values.sections || 'Termine, Rückblick und Neuigkeiten aus dem Verein.');
      const preview = container.querySelector('.generator-preview');
      preview.innerHTML = `
        <div class="card-header"><div><span class="body-xs">2 · VORSCHAU</span><h3 style="margin-top:.3rem">${escapeHtml(values.edition)} · Entwurf</h3></div><span class="badge badge-success">Prüfen</span></div>
        <article class="social-preview-card">
          <div class="social-preview-media"><span>${safeClubName}</span></div>
          <div class="social-preview-copy"><strong>${safeClubName}</strong><p><b>${safeTopic}</b><br><br>${safeSections}</p><span class="body-xs">Interner Entwurf · noch nicht veröffentlicht</span></div>
          <div class="generator-actions"><button type="button" class="btn btn-secondary" data-demo-action="Die Rubriken können nach der Prüfung weiter angepasst werden.">Struktur anpassen</button><button type="button" class="btn btn-primary" data-demo-action="Export wird mit der produktiven Dokumentablage verbunden.">Export vorbereiten</button></div>
        </article>`;
      preview.querySelectorAll('[data-demo-action]').forEach((button) => button.addEventListener('click', () => showInlineStatus(button.dataset.demoAction)));
    });
  }
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

function applyClubState() {
  let club = null;
  let user = null;

  try {
    club = JSON.parse(localStorage.getItem('klubos_verein') || 'null');
    user = JSON.parse(localStorage.getItem('klubos_user') || 'null');
  } catch (_) {}

  if (!club || !club.name) club = getClubState();
  const workspace = getWorkspace();
  workspace.club = { ...workspace.club, ...club };
  saveWorkspace(workspace);

  document.querySelectorAll('.club-switcher-name').forEach((el) => {
    el.textContent = club.name;
  });

  document.querySelectorAll('.club-switcher-meta').forEach((el) => {
    el.textContent = club.mitglieder ? `${club.mitglieder} Mitglieder` : club.ort || '';
  });

  document.querySelectorAll('.club-switcher-crest text').forEach((el) => {
    el.textContent = club.shortName || getClubInitials(club.name);
  });

  document.querySelectorAll('[data-club-field="name"]').forEach((el) => {
    if ('value' in el) el.value = club.verein || club.legalName || club.name;
    else el.textContent = club.verein || club.legalName || club.name;
  });
  document.querySelectorAll('[data-club-field="members"]').forEach((el) => {
    el.textContent = club.mitglieder || '—';
  });

  document.querySelectorAll('[data-workspace-field]').forEach((el) => {
    const path = el.dataset.workspaceField.split('.');
    let value = workspace;
    path.forEach((key) => { value = value?.[key]; });
    if (value === undefined || value === null) return;
    if (typeof value === 'number' && /^metrics\.(budget|incomeYtd|expensesYtd|balance|sponsorVolume)$/.test(el.dataset.workspaceField)) {
      el.textContent = `${value.toLocaleString('de-DE')} €`;
    } else {
      el.textContent = typeof value === 'number' ? value.toLocaleString('de-DE') : value;
    }
  });

  renderWorkspaceTables(workspace);

  const settings = getClubSettings();
  document.querySelectorAll('[data-widget-setting]').forEach((control) => {
    const id = control.dataset.widgetSetting;
    control.checked = settings.widgets[id] !== false;
    control.addEventListener('change', () => {
      const next = getClubSettings();
      next.widgets[id] = control.checked;
      saveClubSettings(next);
      const widget = document.querySelector(`[data-od-id="${id}"]`);
      if (widget) widget.hidden = !control.checked;
    }, { once: true });
    const widget = document.querySelector(`[data-od-id="${id}"]`);
    if (widget) widget.hidden = settings.widgets[id] === false;
  });

  const contribution = document.querySelector('[data-club-setting="contribution"]');
  if (contribution) {
    contribution.value = getClubSettings().contribution;
    contribution.addEventListener('change', () => {
      const next = getClubSettings();
      next.contribution = contribution.value.trim();
      saveClubSettings(next);
      showInlineStatus('Vereinsdaten gespeichert.');
    }, { once: true });
  }

  document.querySelectorAll('.page-subtitle').forEach((el) => {
    if (/Willkommen zurück/.test(el.textContent)) {
      el.textContent = `Willkommen zurück, ${user?.name || 'Admin'}. ${club.name} ist geladen.`;
    }
  });
}

function appendCell(row, value, className = '') {
  const cell = document.createElement('td');
  cell.textContent = value ?? '—';
  if (className) {
    cell.className = className;
    cell.style.color = className === 'amount-positive' ? 'var(--success)' : 'var(--danger)';
  }
  row.appendChild(cell);
  return cell;
}

function appendBadgeCell(row, value) {
  const cell = document.createElement('td');
  const badge = document.createElement('span');
  const status = String(value || 'Aktiv');
  badge.className = `badge ${status === 'Aktiv' || status === 'Geplant' ? 'badge-success' : status === 'Gekündigt' ? 'badge-danger' : 'badge-warning'}`;
  badge.textContent = status;
  cell.appendChild(badge);
  row.appendChild(cell);
}

function formatCurrency(value, withSign = false) {
  const amount = Number(value || 0);
  const formatted = `${Math.abs(amount).toLocaleString('de-DE')} €`;
  if (!withSign) return `${amount.toLocaleString('de-DE')} €`;
  return `${amount >= 0 ? '+' : '−'}${formatted}`;
}

function renderWorkspaceTables(workspace) {
  const renderList = (key, renderer, emptyLabel) => {
    document.querySelectorAll(`[data-workspace-list="${key}"]`).forEach((tbody) => {
      tbody.replaceChildren();
      const items = Array.isArray(workspace[key]) ? workspace[key] : [];
      if (!items.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = tbody.closest('table')?.querySelectorAll('thead th').length || 1;
        cell.textContent = emptyLabel;
        cell.style.color = 'var(--fg-muted)';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
      }
      items.forEach((item) => tbody.appendChild(renderer(item)));
    });
  };

  renderList('members', (member) => {
    const row = document.createElement('tr');
    appendCell(row, member.name);
    appendCell(row, member.email || 'Noch nicht hinterlegt');
    appendBadgeCell(row, member.status || 'Aktiv');
    appendCell(row, member.status === 'Aktiv' ? getClubSettings().contribution : '—');
    appendCell(row, member.entryYear || '—');
    return row;
  }, 'Noch keine Mitglieder im Workspace.');

  renderList('events', (event) => {
    const row = document.createElement('tr');
    appendCell(row, event.title);
    appendCell(row, event.date);
    appendCell(row, event.location || event.type || 'Vereinsgelände');
    appendCell(row, event.attendees || '—');
    appendBadgeCell(row, event.status || 'In Planung');
    return row;
  }, 'Noch keine Events im Workspace.');

  renderList('sponsors', (sponsor) => {
    const row = document.createElement('tr');
    appendCell(row, sponsor.name);
    appendCell(row, sponsor.package || '—');
    appendCell(row, formatCurrency(sponsor.volume));
    appendCell(row, sponsor.term || '—');
    appendBadgeCell(row, sponsor.status || 'Aktiv');
    return row;
  }, 'Noch keine Sponsoren im Workspace.');

  renderList('transactions', (transaction) => {
    const row = document.createElement('tr');
    appendCell(row, transaction.date || new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }));
    appendCell(row, transaction.label);
    appendCell(row, transaction.category || transaction.type || 'Sonstiges');
    appendCell(row, formatCurrency(transaction.amount, true), Number(transaction.amount) >= 0 ? 'amount-positive' : 'amount-negative');
    return row;
  }, 'Noch keine Transaktionen im Workspace.');
}

function showInlineStatus(message) {
  let status = document.querySelector('[data-inline-status]');
  if (!status) {
    status = document.createElement('p');
    status.dataset.inlineStatus = 'true';
    status.style.cssText = 'margin-top:0.75rem;color:var(--success,#3f8f68);font-size:0.8125rem';
    document.querySelector('main')?.appendChild(status);
  }
  status.textContent = message;
  window.clearTimeout(status._klubosTimer);
  status._klubosTimer = window.setTimeout(() => status.remove(), 2800);
}

function openWorkspaceForm(action) {
  const definitions = {
    'add-member': { title: 'Mitglied hinzufügen', fields: [['name', 'Name', 'text', true], ['email', 'E-Mail', 'email', false]], save(w, v) { w.members.push({ id: `m-${Date.now()}`, name: v.name, email: v.email, role: 'Mitglied', status: 'Aktiv' }); w.club.mitglieder = Math.max(Number(w.club.mitglieder || 0), w.members.length); }, message: 'Mitglied wurde im Vereins-Workspace angelegt.' },
    'add-event': { title: 'Event erstellen', fields: [['title', 'Titel', 'text', true], ['date', 'Datum', 'text', true]], save(w, v) { w.events.push({ id: `e-${Date.now()}`, title: v.title, date: v.date, type: 'Vereinsevent' }); }, message: 'Event wurde im Vereins-Workspace angelegt.' },
    'add-sponsor': { title: 'Sponsor hinzufügen', fields: [['name', 'Name', 'text', true], ['volume', 'Jahresvolumen (€)', 'number', false]], save(w, v) { const volume = Number(v.volume || 0); w.sponsors.push({ id: `s-${Date.now()}`, name: v.name, volume, status: 'Aktiv' }); w.metrics.sponsorVolume = Number(w.metrics.sponsorVolume || 0) + volume; }, message: 'Sponsor wurde im Vereins-Workspace angelegt.' },
    'add-transaction': { title: 'Transaktion erfassen', fields: [['label', 'Bezeichnung', 'text', true], ['amount', 'Betrag (€)', 'number', true]], save(w, v) { const amount = Number(v.amount || 0); w.transactions.push({ id: `t-${Date.now()}`, label: v.label, amount, type: amount >= 0 ? 'Einnahme' : 'Ausgabe' }); if (amount >= 0) w.metrics.incomeYtd = Number(w.metrics.incomeYtd || 0) + amount; else w.metrics.expensesYtd = Number(w.metrics.expensesYtd || 0) + Math.abs(amount); w.metrics.balance = Number(w.metrics.balance || 0) + amount; }, message: 'Transaktion wurde im Vereins-Workspace gespeichert.' },
    'add-booking': { title: 'Buchung erstellen', fields: [['court', 'Platz / Ressource', 'text', true], ['date', 'Datum und Zeit', 'datetime-local', true]], save(w, v) { w.bookings.push({ id: `b-${Date.now()}`, court: v.court, date: v.date, status: 'Geplant' }); w.metrics.bookingsThisWeek = Number(w.metrics.bookingsThisWeek || 0) + 1; w.metrics.availableSlots = Math.max(0, Number(w.metrics.availableSlots || 0) - 1); }, message: 'Buchung wurde im Vereins-Workspace gespeichert.' },
  };
  const definition = definitions[action];
  if (!definition) return;
  document.querySelector('[data-workspace-modal]')?.remove();
  const modal = document.createElement('div');
  modal.dataset.workspaceModal = 'true';
  modal.style.cssText = 'position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:1rem;background:rgba(27,24,22,.24);backdrop-filter:blur(8px)';
  const card = document.createElement('form');
  card.style.cssText = 'width:min(100%,440px);display:grid;gap:1rem;padding:1.25rem;border:1px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:0 24px 70px rgba(27,24,22,.18)';
  card.innerHTML = `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:center"><h2 style="font-size:1.15rem">${definition.title}</h2><button type="button" data-close-modal aria-label="Schließen" style="font-size:1.25rem;color:var(--fg-muted)">×</button></div>`;
  definition.fields.forEach(([name, label, type, required]) => { const group = document.createElement('label'); group.style.cssText = 'display:grid;gap:.35rem;color:var(--fg-muted);font-size:.75rem'; group.textContent = label; const input = document.createElement('input'); input.name = name; input.type = type; input.required = required; input.className = 'input'; group.append(input); card.append(group); });
  const actions = document.createElement('div'); actions.style.cssText = 'display:flex;justify-content:flex-end;gap:.6rem;margin-top:.25rem'; actions.innerHTML = '<button type="button" class="btn btn-ghost" data-close-modal>Abbrechen</button><button type="submit" class="btn btn-primary">Speichern</button>'; card.append(actions); modal.append(card); document.body.append(modal);
  const close = () => modal.remove();
  modal.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', close));
  card.addEventListener('submit', (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(card).entries()); updateWorkspace((workspace) => definition.save(workspace, values)); close(); applyClubState(); showInlineStatus(definition.message); });
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  card.querySelector('input')?.focus();
}

function getClubInitials(name) {
  return String(name || '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/* ── Notification Bell ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const notifBtn = document.querySelector('.notification-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      alert('Keine neuen Benachrichtigungen.');
    });
  }
});

/* ── Adaptive App Sidebar ─────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const shell = document.body;
  const sidebar = document.querySelector('.sidebar');
  if (!shell.classList.contains('dashboard-floating-shell') || !sidebar) return;

  const compactViewport = window.matchMedia('(max-width: 900px)');
  const podStoreKey = 'klubos:sidebar-open-pod';
  const pods = [
    ['nav', sidebar.querySelector('.sidebar-nav')],
    ['bottom', sidebar.querySelector('.sidebar-bottom')]
  ].filter(([, el]) => Boolean(el));

  let openPod = null;

  const rememberOpenPod = (name) => {
    try { sessionStorage.setItem(podStoreKey, name); } catch (_) {}
    try { localStorage.setItem(podStoreKey, name); } catch (_) {}
  };

  const forgetOpenPod = () => {
    try { sessionStorage.removeItem(podStoreKey); } catch (_) {}
    try { localStorage.removeItem(podStoreKey); } catch (_) {}
  };

  const clearOpenPod = () => {
    pods.forEach(([, el]) => el.classList.remove('is-pod-open'));
    openPod = null;
    forgetOpenPod();
  };

  const setOpenPod = (name, persist = false) => {
    const match = pods.find(([id]) => id === name);
    if (!match) return;
    pods.forEach(([id, el]) => el.classList.toggle('is-pod-open', id === name));
    openPod = match[1];
    if (persist) {
      rememberOpenPod(name);
    }
  };

  const syncSidebarMode = () => {
    if (compactViewport.matches) {
      shell.classList.remove('sidebar-collapsed');
      clearOpenPod();
      return;
    }
    shell.classList.add('sidebar-collapsed');
  };

  syncSidebarMode();

  try {
    const storedPod = sessionStorage.getItem(podStoreKey) || localStorage.getItem(podStoreKey);
    if (storedPod && !compactViewport.matches) setOpenPod(storedPod);
  } catch (_) {}

  pods.forEach(([name, el]) => {
    el.addEventListener('pointerenter', () => setOpenPod(name, true));
    el.addEventListener('pointerdown', (event) => {
      if (event.target.closest('a')) setOpenPod(name, true);
    });
    el.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpenPod(name, true);
    }, true);
  });

  document.addEventListener('pointermove', (event) => {
    if (!openPod || compactViewport.matches) return;
    const rect = openPod.getBoundingClientRect();
    const buffer = 8;
    const inside =
      event.clientX >= rect.left - buffer &&
      event.clientX <= rect.right + buffer &&
      event.clientY >= rect.top - buffer &&
      event.clientY <= rect.bottom + buffer;
    if (!inside) clearOpenPod();
  });

  compactViewport.addEventListener('change', () => {
    syncSidebarMode();
  });
});

/* ── Widget toggling (stub for Einstellungen) ─────────────── */

function toggleWidget(widgetId, visible) {
  const el = document.querySelector(`[data-od-id="${widgetId}"]`);
  if (el) el.style.display = visible ? '' : 'none';
}
