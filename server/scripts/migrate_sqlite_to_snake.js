const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../flame.db');

async function migrate() {
    console.log('Starting DB migration...');
    const SQL = await initSqlJs();
    let db;

    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
        console.log('Loaded existing flame.db');
    } else {
        db = new SQL.Database();
        console.log('Created new flame.db');
    }

    // 1. Users table migration (isAdmin -> is_admin)
    db.run(`CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        is_admin INTEGER DEFAULT 0,
        has_claimed_free_plan INTEGER DEFAULT 0,
        last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    try {
        db.run(`INSERT INTO users_new (id, username, email, password, avatar, is_admin)
                SELECT id, username, email, password, avatar, isAdmin FROM users`);
        db.run(`DROP TABLE users`);
        db.run(`ALTER TABLE users_new RENAME TO users`);
        console.log('Migrated users table');
    } catch (e) {
        console.log('Users table already migrated or error:', e.message);
    }

    // 2. Paid Plans table migration (sortOrder -> sort_order)
    db.run(`CREATE TABLE IF NOT EXISTS paid_plans_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ram TEXT NOT NULL,
        cpu TEXT NOT NULL,
        storage TEXT NOT NULL,
        location TEXT NOT NULL,
        price TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    try {
        db.run(`INSERT INTO paid_plans_new (id, name, ram, cpu, storage, location, price, sort_order)
                SELECT id, name, ram, cpu, storage, location, price, sortOrder FROM paid_plans`);
        db.run(`DROP TABLE paid_plans`);
        db.run(`ALTER TABLE paid_plans_new RENAME TO paid_plans`);
        console.log('Migrated paid_plans table');
    } catch (e) {
        console.log('Paid plans table already migrated or error:', e.message);
    }

    // 3. Location Settings table migration (isAvailable -> is_available)
    db.run(`CREATE TABLE IF NOT EXISTS location_settings_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT UNIQUE NOT NULL,
        is_available INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    try {
        db.run(`INSERT INTO location_settings_new (id, location, is_available)
                SELECT id, location, isAvailable FROM location_settings`);
        db.run(`DROP TABLE location_settings`);
        db.run(`ALTER TABLE location_settings_new RENAME TO location_settings`);
        console.log('Migrated location_settings table');
    } catch (e) {
        console.log('Location settings table already migrated or error:', e.message);
    }

    // Ensure data exists for UAE if empty
    const checkPlans = db.exec("SELECT count(*) FROM paid_plans");
    if (checkPlans[0].values[0][0] === 0) {
        console.log('Seeding plans...');
        const plans = [
            ['Bronze Plan', '2GB', '100%', '10 GB SSD', 'UAE', '200 PKR', 1],
            ['Silver Plan', '4GB', '150%', '20 GB SSD', 'UAE', '400 PKR', 2],
            ['Gold Plan', '8GB', '250%', '30 GB SSD', 'UAE', '600 PKR', 3],
            ['Platinum Plan', '10GB', '300%', '40 GB SSD', 'UAE', '800 PKR', 4],
            ['Diamond Plan', '16GB', '500%', '80 GB SSD', 'UAE', '1600 PKR', 5],
            ['Emerald Plan', '12GB', '350%', '50 GB SSD', 'UAE', '1200 PKR', 6],
            ['Ruby Plan', '32GB', '1000%', '100 GB SSD', 'UAE', '3200 PKR', 7],
            ['Black Ruby Plan', '64GB', '2000%', '200 GB SSD', 'UAE', '3400 PKR', 8],
            ['Amethyst Plan', '36GB', '2500%', '250 GB SSD', 'UAE', '3600 PKR', 9]
        ];
        plans.forEach(p => {
            db.run("INSERT INTO paid_plans (name, ram, cpu, storage, location, price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", p);
        });
    }

    const checkLocs = db.exec("SELECT count(*) FROM location_settings");
    if (checkLocs[0].values[0][0] === 0) {
        console.log('Seeding locations...');
        db.run("INSERT INTO location_settings (location, is_available, sort_order) VALUES ('UAE', 1, 1)");
        db.run("INSERT INTO location_settings (location, is_available, sort_order) VALUES ('France', 0, 2)");
        db.run("INSERT INTO location_settings (location, is_available, sort_order) VALUES ('Singapore', 0, 3)");
    }

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    console.log('Migration complete. flame.db updated.');
}

migrate().catch(console.error);
