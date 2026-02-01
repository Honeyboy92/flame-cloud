const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zxdnrjkyygzermwkkxmk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZG5yamt5eWd6ZXJtd2treG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODY3ODIsImV4cCI6MjA4NTQ2Mjc4Mn0.RuvEZmcfXl3MwSaxQUQ6QE8zVNLjf2f8FpygHBA7FJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPlans() {
    console.log('Testing connection to Supabase...');
    try {
        const { data, error } = await supabase
            .from('paid_plans')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching plans:', error);
        } else {
            console.log('Plans fetched successfully with is_active=true:', data.length, 'plans found.');
            console.log(data);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

verifyPlans();
