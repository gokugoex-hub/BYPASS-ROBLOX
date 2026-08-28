// ⚠️ Preencha com os dados do SEU projeto Supabase
// Encontre em: Supabase > Project Settings > API
const SUPABASE_URL = "https://fzzzogykpmqmititknyn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6enpvZ3lrcG1xbWl0aXRrbnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5Mjk0MTgsImV4cCI6MjEwMzUwNTQxOH0.WdHxfl0kRULTSsbeyNz0pjAjlyGpRHFy12gAj2SYSxk";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);