/* ══════════════════════════════════════════════════════════════
   CLUBOS — Shared Application Logic
   ══════════════════════════════════════════════════════════════ */

/* ── Supabase Setup ─────────────────────────────────────────── */
// const SUPABASE_URL = 'YOUR_SUPABASE_URL';
// const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── Auth Handlers ──────────────────────────────────────────── */

const CLUBOS_ADMIN_CLUB = {
  name: 'TC Kirchhörde',
  legalName: 'Tennis-Club Kirchhörde e.V.',
  shortName: 'TCK',
  website: 'https://tennisclubkirchhoerde.de/',
  logo: 'https://tennisclubkirchhoerde.de/wp-content/uploads/2022/11/TCK_Logo.png',
  ort: 'Dortmund-Kirchhörde',
  verband: 'Westfälischer Tennis-Verband',
  mitglieder: 342,
};

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
  const adminUser = {
    username: 'admin',
    name: 'Admin',
    role: 'Admin',
    verein: CLUBOS_ADMIN_CLUB.name,
  };

  const adminClub = {
    verein: CLUBOS_ADMIN_CLUB.legalName,
    name: CLUBOS_ADMIN_CLUB.name,
    shortName: CLUBOS_ADMIN_CLUB.shortName,
    website: CLUBOS_ADMIN_CLUB.website,
    logo: CLUBOS_ADMIN_CLUB.logo,
    ort: CLUBOS_ADMIN_CLUB.ort,
    verband: CLUBOS_ADMIN_CLUB.verband,
    mitglieder: CLUBOS_ADMIN_CLUB.mitglieder,
  };

  try {
    localStorage.setItem('clubos_user', JSON.stringify(adminUser));
    localStorage.setItem('clubos_verein', JSON.stringify(adminClub));
    localStorage.setItem('clubos_auth_mode', 'admin');
  } catch (_) {}

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

function applyClubState() {
  let club = null;
  let user = null;

  try {
    club = JSON.parse(localStorage.getItem('clubos_verein') || 'null');
    user = JSON.parse(localStorage.getItem('clubos_user') || 'null');
  } catch (_) {}

  if (!club || !club.name) return;

  document.querySelectorAll('.club-switcher-name').forEach((el) => {
    el.textContent = club.name;
  });

  document.querySelectorAll('.club-switcher-meta').forEach((el) => {
    el.textContent = club.mitglieder ? `${club.mitglieder} Mitglieder` : club.ort || '';
  });

  document.querySelectorAll('.club-switcher-crest text').forEach((el) => {
    el.textContent = club.shortName || getClubInitials(club.name);
  });

  document.querySelectorAll('.page-subtitle').forEach((el) => {
    if (/Willkommen zurück/.test(el.textContent)) {
      el.textContent = `Willkommen zurück, ${user?.name || 'Admin'}. ${club.name} ist geladen.`;
    }
  });
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
  const podStoreKey = 'clubos:sidebar-open-pod';
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
