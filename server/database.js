const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing. Please check your .env file.');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

async function initDB() {
  console.log('🔥 Supabase client initialized.');
}

// Shim for SQL-like interface used by existing routes
const prepare = (tableName) => {
  return {
    run: async (data) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([data])
        .select();

      if (error) {
        console.error(`Supabase Insert Error (${tableName}):`, error);
        throw error;
      }
      // Map 'id' to 'lastInsertRowid' for caller compatibility
      return { lastInsertRowid: result && result[0] ? result[0].id : null };
    },
    get: async (field, value) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(field, value)
        .maybeSingle();

      if (error) {
        console.error(`Supabase Select Error (${tableName}):`, error);
        throw error;
      }
      return data;
    },
    all: async (orderByField = 'id', direction = 'asc') => {
      let query = supabase
        .from(tableName)
        .select('*');

      // Special handling for 'paid_plans' to filter by 'is_active'
      if (tableName === 'paid_plans') {
        query = query.eq('is_active', 1);
      }

      const { data, error } = await query
        .order(orderByField, { ascending: direction === 'asc' });

      if (error) {
        console.error(`Supabase All Error (${tableName}):`, error);
        throw error;
      }
      return data || [];
    },
    delete: async (id) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) {
        console.error(`Supabase Delete Error (${tableName}):`, error);
        throw error;
      }
    },
    update: async (id, data) => {
      const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id);
      if (error) {
        console.error(`Supabase Update Error (${tableName}):`, error);
        throw error;
      }
    }
  };
};

function getDB() {
  return supabase;
}

function saveDB() { }

module.exports = { initDB, getDB, prepare, saveDB };
