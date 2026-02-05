const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateOrder() {
    const orders = [
        { id: 1, sort_order: 1 }, // Bronze
        { id: 2, sort_order: 2 }, // Silver
        { id: 3, sort_order: 3 }, // Gold
        { id: 4, sort_order: 4 }, // Platinum
        { id: 9, sort_order: 5 }, // Amethyst
        { id: 5, sort_order: 6 }, // Diamond
        { id: 6, sort_order: 7 }, // Emerald
        { id: 7, sort_order: 8 }, // Ruby
        { id: 8, sort_order: 9 }  // Black Ruby
    ];

    for (const item of orders) {
        const { error } = await supabase
            .from('paid_plans')
            .update({ sort_order: item.sort_order })
            .eq('id', item.id);

        if (error) {
            console.error(`Error updating ID ${item.id}:`, error.message);
        } else {
            console.log(`Updated ID ${item.id} to sort_order ${item.sort_order}`);
        }
    }
}

updateOrder();
