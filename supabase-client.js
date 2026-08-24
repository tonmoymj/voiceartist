// Supabase Client CDN initialization
const SUPABASE_URL = "https://llzfucyxpqakmpsohjgl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsemZ1Y3l4cHFha21wc29oamdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzIyNzAsImV4cCI6MjEwMjkwODI3MH0.DTHehHS0EPRK0O80qJn4zamOdb4kP6TfAOr8ihlmy1c";

// Load supabase client
window.supabase = window.supabase || (window.supabaseJs ? window.supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null);