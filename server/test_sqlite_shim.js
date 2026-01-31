const { initDB, prepare } = require('./database');

async function test() {
    console.log('Testing SQLite Shim...');
    await initDB();

    try {
        const plans = await prepare('paid_plans').all('sort_order', 'asc');
        console.log(`Successfully fetched ${plans.length} plans.`);
        if (plans.length > 0) {
            console.log('Sample plan:', plans[0].name, '-', plans[0].location);
        }

        const uae = await prepare('location_settings').get('location', 'UAE');
        console.log('UAE Location Status:', uae ? (uae.is_available ? 'Available' : 'Coming Soon') : 'Not Found');

        console.log('✅ SQLite Shim Test Passed');
    } catch (e) {
        console.error('❌ SQLite Shim Test Failed:', e.message);
    }
}

test();
