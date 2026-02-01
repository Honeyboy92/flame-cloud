import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing in client .env, using fallback credentials.');
}

export const supabase = createClient(
    supabaseUrl || 'https://zxdnrjkyygzermwkkxmk.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZG5yamt5eWd6ZXJtd2treG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY3ODIsImV4cCI6MjA4NTQ2Mjc4Mn0.RuvEZmcfXl3MwSaxQUQ6QE8zVNLjf2f8FpygHBA7FJo'
);
