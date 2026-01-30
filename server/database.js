// Use Supabase for the backend
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDB() {
  console.log('🔥 Supabase client initialized.');
}

// Shim for SQL-like interface used by existing routes
const prepare = (tableName) => {
  return {
    run: async (data) => {
      // For simple inserts
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([data])
        .select();

      if (error) throw error;
      return { lastInsertRowid: result[0]?.id };
    },
    get: async (field, value) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(field, value)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    all: async (orderByField = 'created_at', direction = 'asc') => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(orderByField, { ascending: direction === 'asc' });

      if (error) throw error;
      return data || [];
    },
    delete: async (id) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    update: async (id, data) => {
      const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    }
  };
};

function getDB() {
  return supabase;
}

// dummy functions for compatibility
function saveDB() { }

module.exports = { initDB, getDB, prepare, saveDB };
