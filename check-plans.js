const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPlans() {
    const { data, error } = await supabase
        .from('paid_plans')
        .select('*');

    if (error) {
        console.error('Error fetching plans:', error);
        return;
    }

    console.log('Current Paid Plans:');
    data.forEach(plan => {
        console.log(`ID: ${plan.id} | Name: ${plan.name} | Sort Order: ${plan.sort_order}`);
    });
}

checkPlans();
