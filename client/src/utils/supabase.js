import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing in client .env, using fallback credentials.');
}

export const supabase = createClient(
    supabaseUrl || 'https://wzmoqcdpxmhnoojuyqum.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bW9xY2RweG1obm9vanV5cXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NTMzNjUsImV4cCI6MjA4NjEyOTM2NX0.7zGfx7eIgUsk3PB9Sj14musOaGyNkE7dtJgbmk7Z-Nw'
);
