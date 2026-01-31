const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'flame.db');
let db = null;

async function initDB() {
  const SQL = await initSqlJs();
  const exists = fs.existsSync(DB_PATH);
  if (exists) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('🔥 Local SQLite database (flame.db) loaded.');
  } else {
    db = new SQL.Database();
    console.log('⚠️ Local SQLite database (flame.db) not found, creating and seeding...');

    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
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

    db.run(`CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS location_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT UNIQUE NOT NULL,
        is_available INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS paid_plans (
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

    db.run(`CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        screenshot TEXT,
        status TEXT DEFAULT 'pending',
        admin_response TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed Data
    db.run("INSERT INTO site_settings (key, value) VALUES ('yt_partners_enabled', '1'), ('discord_members', '400+')");
    db.run("INSERT INTO location_settings (location, is_available, sort_order) VALUES ('UAE', 1, 1), ('France', 0, 2), ('Singapore', 0, 3)");

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

    saveDB();
    console.log('✅ Default data seeded to flame.db');
  }
  return db;
}

function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Shim for SQL-like interface used by existing routes
const prepare = (tableName) => {
  return {
    run: async (data) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      db.run(sql, values);
      saveDB();
      // Simple approximation for lastInsertRowid
      const res = db.exec("SELECT last_insert_rowid() as id");
      return { lastInsertRowid: res[0].values[0][0] };
    },
    get: async (field, value) => {
      const sql = `SELECT * FROM ${tableName} WHERE ${field} = ?`;
      const result = db.exec(sql, [value]);
      if (result.length === 0 || result[0].values.length === 0) return null;
      const cols = result[0].columns;
      const vals = result[0].values[0];
      return cols.reduce((obj, col, i) => { obj[col] = vals[i]; return obj; }, {});
    },
    all: async (orderByField = 'id', direction = 'asc') => {
      const sql = `SELECT * FROM ${tableName} ORDER BY ${orderByField} ${direction}`;
      const result = db.exec(sql);
      if (result.length === 0) return [];
      const cols = result[0].columns;
      return result[0].values.map(vals =>
        cols.reduce((obj, col, i) => { obj[col] = vals[i]; return obj; }, {})
      );
    },
    delete: async (id) => {
      const sql = `DELETE FROM ${tableName} WHERE id = ?`;
      db.run(sql, [id]);
      saveDB();
    },
    update: async (id, data) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const sets = keys.map(k => `${k} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${sets} WHERE id = ?`;
      db.run(sql, [...values, id]);
      saveDB();
    }
  };
};

function getDB() {
  return db;
}

module.exports = { initDB, getDB, prepare, saveDB };
