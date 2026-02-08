import { supabase } from './supabase';

// Wrapper to match the existing API query builder but using Supabase directly
const createApiClient = () => {
    return {
        from: (table) => {
            // We return the supabase query builder directly because most methods
            // (select, eq, order, single, insert) already match.
            return supabase.from(table);
        }
    };
};

export const api = createApiClient();
