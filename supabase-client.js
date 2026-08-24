// Supabase Client — VoiceCast
const SUPABASE_URL = "https://llzfucyxpqakmpsohjgl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsemZ1Y3l4cHFha21wc29oamdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzIyNzAsImV4cCI6MjEwMjkwODI3MH0.DTHehHS0EPRK0O80qJn4zamOdb4kP6TfAOr8ihlmy1c";

// The supabase-js@2 CDN exposes window.supabase as the module (with .createClient)
// We create one shared client instance and expose it as window._supabase
(function () {
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      window._supabase = null;
    }
  } catch (e) {
    console.warn('Supabase init failed:', e);
    window._supabase = null;
  }
})();

// Automatic Auth State Manager & Navbar Synchronizer
document.addEventListener('DOMContentLoaded', async function () {
  const db = window._supabase;
  if (!db) return;

  // Clean URL hash if it contains OAuth tokens after login
  if (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('error='))) {
    try {
      setTimeout(() => {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }, 350);
    } catch (e) {}
  }

  function updateNavbarUserUI(session) {
    const navCta = document.querySelector('.nav-cta');
    const mobCta = document.querySelector('.mob-cta');

    if (session && session.user) {
      const user = session.user;
      const meta = user.user_metadata || {};
      const name = meta.full_name || meta.name || user.email.split('@')[0] || 'User';
      const initial = (name[0] || 'U').toUpperCase();

      // Desktop nav CTA update
      if (navCta) {
        const langToggle = navCta.querySelector('.lang-toggle');
        const langHtml = langToggle ? langToggle.outerHTML : '<button class="lang-toggle">EN | বাং</button>';
        navCta.innerHTML = `
          ${langHtml}
          <div class="user-pill" style="display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:4px 12px 4px 6px;">
            <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;color:#0B0A16;font-weight:700;font-size:0.75rem;">${initial}</div>
            <span style="font-size:0.84rem;color:var(--text);font-weight:500;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
          </div>
          <button id="logoutBtn" style="background:transparent;border:1px solid var(--border);color:var(--text-muted);font-size:0.82rem;padding:7px 14px;border-radius:8px;cursor:pointer;transition:border-color 0.15s,color 0.15s;">Log out</button>
        `;
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            logoutBtn.textContent = 'Logging out...';
            await db.auth.signOut();
            window.location.reload();
          });
        }
      }

      // Mobile nav CTA update
      if (mobCta) {
        mobCta.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:8px 0;">
            <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;color:#0B0A16;font-weight:700;font-size:0.85rem;">${initial}</div>
            <div>
              <div style="font-size:0.9rem;font-weight:600;color:var(--text);">${name}</div>
              <div style="font-size:0.75rem;color:var(--text-faint);">${user.email}</div>
            </div>
          </div>
          <button id="mobLogoutBtn" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:0.86rem;padding:10px;border-radius:8px;cursor:pointer;">Log out</button>
        `;
        const mobLogoutBtn = document.getElementById('mobLogoutBtn');
        if (mobLogoutBtn) {
          mobLogoutBtn.addEventListener('click', async () => {
            await db.auth.signOut();
            window.location.reload();
          });
        }
      }

      // Reattach language toggle listener
      const newLangToggles = document.querySelectorAll('.lang-toggle');
      newLangToggles.forEach(btn => {
        btn.addEventListener('click', () => {
          if (typeof applyLanguage === 'function') {
            applyLanguage(currentLang === 'en' ? 'bn' : 'en');
          }
        });
      });
    }
  }

  // Check current session immediately
  try {
    const { data } = await db.auth.getSession();
    if (data && data.session) {
      updateNavbarUserUI(data.session);
    }
  } catch (e) {}

  // Subscribe to auth state events
  try {
    db.auth.onAuthStateChange((event, session) => {
      if (session) {
        updateNavbarUserUI(session);
      }
    });
  } catch (e) {}
});