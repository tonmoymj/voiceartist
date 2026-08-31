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

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag])
    );
  }

  // Sync role if returning from OAuth
  async function syncUserRole(user) {
    if (!user) return;
    const pendingRole = localStorage.getItem('voicecast_pending_role');
    
    if (pendingRole) {
      const allowedRoles = ['artist', 'client'];
      if (!allowedRoles.includes(pendingRole)) {
        localStorage.removeItem('voicecast_pending_role');
        return;
      }
    }
    
    const existingRole = user.user_metadata?.role || localStorage.getItem('voicecast_user_role') || 'artist';
    const finalRole = pendingRole || existingRole;

    if (pendingRole) {
      try {
        await db.auth.updateUser({ data: { role: finalRole } });
      } catch (e) { console.error('Context:', e); }
      localStorage.setItem('voicecast_user_role', finalRole);
      localStorage.removeItem('voicecast_pending_role');
    }

    try {
      await db.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
        role: finalRole,
        updated_at: new Date().toISOString()
      });
    } catch (e) { console.error('Context:', e); }
    
    return finalRole;
  }

  // Clean URL hash if it contains OAuth tokens after login
  if (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('error='))) {
    window._supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }
    });
  }

  async function updateNavbarUserUI(session) {
    const navCta = document.querySelector('.nav-cta');
    const mobCta = document.querySelector('.mob-cta');

    if (session && session.user) {
      const user = session.user;
      const role = await syncUserRole(user) || user.user_metadata?.role || localStorage.getItem('voicecast_user_role') || 'artist';
      const meta = user.user_metadata || {};
      const name = escapeHTML(meta.full_name || meta.name || user.email.split('@')[0] || 'User');
      const initial = (name[0] || 'U').toUpperCase();
      const isSuperAdmin = (user.email && user.email.toLowerCase() === 'tonmoymbm@gmail.com');
      const roleLabel = isSuperAdmin ? 'Super Admin' : (role === 'client' ? 'Client' : 'Artist');
      const superAdminNavBtn = isSuperAdmin ? '<a href="superadmin" style="background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);color:#EF4444;font-weight:700;font-size:0.82rem;padding:6px 12px;border-radius:8px;text-decoration:none;box-shadow:0 0 10px rgba(239,68,68,0.2);">👑 Super Admin</a>' : '';

      // Desktop nav CTA update
      if (navCta) {
        const langToggle = navCta.querySelector('.lang-toggle');
        const langHtml = langToggle ? langToggle.outerHTML : '<button class="lang-toggle">EN | বাং</button>';
        navCta.innerHTML = `
          ${langHtml}
          ${superAdminNavBtn}
          <a href="dashboard" style="display:inline-flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:5px 14px 5px 6px;text-decoration:none;transition:border-color 0.15s;">
            <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;color:#0B0A16;font-weight:700;font-size:0.75rem;">${initial}</div>
            <span style="font-size:0.84rem;color:var(--text);font-weight:500;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
            <span style="font-size:0.68rem;padding:2px 7px;border-radius:999px;background:rgba(139,92,246,0.18);color:var(--purple);font-weight:600;">${roleLabel}</span>
          </a>
          <a class="btn-outline" href="dashboard" style="padding:7px 14px;font-size:0.82rem;">Dashboard</a>
          <button id="logoutBtn" style="background:transparent;border:1px solid var(--border);color:var(--text-muted);font-size:0.82rem;padding:7px 12px;border-radius:8px;cursor:pointer;transition:border-color 0.15s,color 0.15s;">Log out</button>
        `;
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            logoutBtn.textContent = 'Logging out...';
            await db.auth.signOut();
            window.location.href = '/';
          });
        }
      }

      // Mobile nav CTA update
      if (mobCta) {
        mobCta.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:8px 0;border-bottom:1px solid var(--border-soft);">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;color:#0B0A16;font-weight:700;font-size:0.9rem;">${initial}</div>
            <div>
              <div style="font-size:0.92rem;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px;">
                ${name} <span style="font-size:0.68rem;padding:1px 6px;border-radius:999px;background:rgba(139,92,246,0.2);color:var(--purple);">${roleLabel}</span>
              </div>
              <div style="font-size:0.75rem;color:var(--text-faint);">${escapeHTML(user.email)}</div>
            </div>
          </div>
          ${isSuperAdmin ? '<a class="btn-grad" href="superadmin" style="display:block;text-align:center;margin-bottom:8px;padding:10px;background:linear-gradient(90deg,#EF4444,#DC2626);color:#FFF;">👑 Open Super Admin Panel</a>' : ''}
          <a class="btn-grad" href="dashboard" style="display:block;text-align:center;margin-bottom:8px;padding:10px;">Go to Dashboard</a>
          <button id="mobLogoutBtn" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text-muted);font-size:0.86rem;padding:9px;border-radius:8px;cursor:pointer;">Log out</button>
        `;
        const mobLogoutBtn = document.getElementById('mobLogoutBtn');
        if (mobLogoutBtn) {
          mobLogoutBtn.addEventListener('click', async () => {
            await db.auth.signOut();
            window.location.href = '/';
          });
        }
      }

      // Reattach language toggle listener
      const newLangToggles = document.querySelectorAll('.lang-toggle');
      newLangToggles.forEach(btn => {
        btn.addEventListener('click', () => {
          if (typeof applyGlobalLanguage === 'function') {
            applyGlobalLanguage(typeof currentVoiceCastLang !== 'undefined' && currentVoiceCastLang === 'en' ? 'bn' : 'en');
          }
        });
      });
    }
  }

  // Check current session immediately
  try {
    const { data } = await db.auth.getSession();
    if (data && data.session) {
      await updateNavbarUserUI(data.session);
    }
  } catch (e) { console.error('Context:', e); }

  // Subscribe to auth state events
  try {
    db.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await updateNavbarUserUI(session);
      }
    });
  } catch (e) { console.error('Context:', e); }
});