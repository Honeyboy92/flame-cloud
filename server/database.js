// Use Firebase Firestore for the backend
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin
// In production, this will use the service account from environment variables or default credentials
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.warn('Firebase init warning (likely missing credentials):', error.message);
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function initDB() {
  console.log('🔥 Initializing Firestore collections...');

  // Initialize default admin if it doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || 'flamecloud@gmail.com';
  const usersRef = db.collection('users');
  const adminQuery = await usersRef.where('is_admin', '==', 1).limit(1).get();

  if (adminQuery.empty) {
    console.log('👤 Creating default admin user in Firestore...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'GSFY!25V$';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    await usersRef.add({
      username: 'Flame Cloud Admin',
      email: adminEmail,
      password: hashedPassword,
      is_admin: 1,
      has_claimed_free_plan: 0,
      created_at: new Date().toISOString()
    });
  }

  // Initialize Site Settings if empty
  const settingsRef = db.collection('site_settings');
  const settingsSnap = await settingsRef.limit(1).get();
  if (settingsSnap.empty) {
    await settingsRef.doc('yt_partners_enabled').set({ value: '0' });
    await settingsRef.doc('discord_members').set({ value: '400+' });
  }

  // Initialize location settings if empty
  const locationsRef = db.collection('location_settings');
  const locationsSnap = await locationsRef.limit(1).get();
  if (locationsSnap.empty) {
    await locationsRef.add({ location: 'UAE', is_available: 1, sort_order: 1 });
    await locationsRef.add({ location: 'France', is_available: 0, sort_order: 2 });
    await locationsRef.add({ location: 'Singapore', is_available: 0, sort_order: 3 });
  }

  // Initialize default paid plans if empty
  const plansRef = db.collection('paid_plans');
  const plansSnap = await plansRef.limit(1).get();
  if (plansSnap.empty) {
    const plans = [
      { name: 'Bronze Plan', ram: '2GB', cpu: '100%', storage: '10 GB SSD', location: 'UAE', price: '200 PKR', sort_order: 1 },
      { name: 'Silver Plan', ram: '4GB', cpu: '150%', storage: '20 GB SSD', location: 'UAE', price: '400 PKR', sort_order: 2 },
      { name: 'Gold Plan', ram: '8GB', cpu: '250%', storage: '30 GB SSD', location: 'UAE', price: '600 PKR', sort_order: 3 },
      { name: 'Platinum Plan', ram: '10GB', cpu: '300%', storage: '40 GB SSD', location: 'UAE', price: '800 PKR', sort_order: 4 },
      { name: 'Emerald Plan', ram: '12GB', cpu: '350%', storage: '50 GB SSD', location: 'UAE', price: '1200 PKR', sort_order: 5 },
      { name: 'Amethyst Plan', ram: '14GB', cpu: '400%', storage: '60 GB SSD', location: 'UAE', price: '3600 PKR', sort_order: 6 },
      { name: 'Diamond Plan', ram: '16GB', cpu: '500%', storage: '80 GB SSD', location: 'UAE', price: '1600 PKR', sort_order: 7 },
      { name: 'Ruby Plan', ram: '32GB', cpu: '1000%', storage: '100 GB SSD', location: 'UAE', price: '3200 PKR', sort_order: 8 },
      { name: 'Black Ruby Plan', ram: '34GB', cpu: '2000%', storage: '200 GB SSD', location: 'UAE', price: '3400 PKR', sort_order: 9 }
    ];
    for (const p of plans) {
      await plansRef.add({ ...p, is_active: 1 });
    }
  }

  console.log('✅ Firestore initialization complete');
}

// Shim for previous SQL-like interface
const prepare = (collectionName) => {
  const collection = db.collection(collectionName);

  return {
    run: async (data) => {
      // For simple inserts (used in auth, tickets, etc)
      const docRef = await collection.add({
        ...data,
        created_at: data.created_at || new Date().toISOString()
      });
      return { lastInsertRowid: docRef.id };
    },
    get: async (field, value) => {
      const snap = await collection.where(field, '==', value).limit(1).get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() };
    },
    all: async (orderByField = 'sort_order', direction = 'asc') => {
      const snap = await collection.orderBy(orderByField, direction).get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    delete: async (id) => {
      await collection.doc(id).delete();
    },
    update: async (id, data) => {
      await collection.doc(id).update(data);
    }
  };
};

function getDB() {
  return db;
}

// dummy saveDB for compatibility
function saveDB() { }

module.exports = { initDB, getDB, prepare, saveDB };
