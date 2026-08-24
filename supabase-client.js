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