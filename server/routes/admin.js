const express = require('express');
const bcrypt = require('bcryptjs');
const { prepare } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Paid Plans CRUD (Admin only)
router.get('/paid-plans', adminMiddleware, async (req, res) => {
  const plans = await prepare('paid_plans').all('sort_order', 'asc');
  res.json(plans);
});

router.post('/paid-plans', adminMiddleware, async (req, res) => {
  const { name, ram, cpu, storage, location, price, discount, sort_order } = req.body;
  const plansRef = prepare('paid_plans');
  const plans = await plansRef.all('sort_order', 'desc');
  const actualMax = (plans.length > 0) ? (plans[0].sort_order || 0) : 0;
  const newOrder = sort_order || (actualMax + 1);

  const result = await plansRef.run({
    name, ram, cpu, storage: storage || '10GB', location, price,
    discount: discount || 0, sort_order: newOrder, is_active: 1
  });
  res.json({ id: result.lastInsertRowid });
});

router.put('/paid-plans/:id', adminMiddleware, async (req, res) => {
  const { name, ram, cpu, storage, location, price, discount, sort_order } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (ram) updates.ram = ram;
  if (cpu) updates.cpu = cpu;
  if (storage) updates.storage = storage;
  if (location) updates.location = location;
  if (price) updates.price = price;
  if (typeof discount !== 'undefined') updates.discount = discount;
  if (typeof sort_order !== 'undefined') updates.sort_order = sort_order;

  await prepare('paid_plans').update(req.params.id, updates);
  res.json({ message: 'Plan updated' });
});

router.delete('/paid-plans/:id', adminMiddleware, async (req, res) => {
  await prepare('paid_plans').delete(req.params.id);
  res.json({ message: 'Plan deleted' });
});

// Restore default paid plans (admin only)
router.post('/paid-plans/restore-defaults', adminMiddleware, async (req, res) => {
  const plansRef = prepare('paid_plans');
  const existingDocs = await plansRef.all();
  const existingNames = existingDocs.map(r => r.name.toLowerCase());

  const defaults = [
    { name: 'Bronze Plan', ram: '2GB', cpu: '100%', storage: '10 GB SSD', location: 'UAE', price: '200 PKR' },
    { name: 'Silver Plan', ram: '4GB', cpu: '150%', storage: '20 GB SSD', location: 'UAE', price: '400 PKR' },
    { name: 'Gold Plan', ram: '8GB', cpu: '250%', storage: '30 GB SSD', location: 'UAE', price: '600 PKR' },
    { name: 'Platinum Plan', ram: '10GB', cpu: '300%', storage: '40 GB SSD', location: 'UAE', price: '800 PKR' },
    { name: 'Emerald Plan', ram: '12GB', cpu: '350%', storage: '50 GB SSD', location: 'UAE', price: '1200 PKR' },
    { name: 'Amethyst Plan', ram: '14GB', cpu: '400%', storage: '60 GB SSD', location: 'UAE', price: '3600 PKR' },
    { name: 'Diamond Plan', ram: '16GB', cpu: '500%', storage: '80 GB SSD', location: 'UAE', price: '1600 PKR' },
    { name: 'Ruby Plan', ram: '32GB', cpu: '1000%', storage: '100 GB SSD', location: 'UAE', price: '3200 PKR' },
    { name: 'Black Ruby Plan', ram: '34GB', cpu: '2000%', storage: '200 GB SSD', location: 'UAE', price: '3400 PKR' }
  ];

  let inserted = 0;
  for (let i = 0; i < defaults.length; i++) {
    const p = defaults[i];
    if (!existingNames.includes(p.name.toLowerCase())) {
      await plansRef.run({ ...p, discount: 0, sort_order: i + 1, is_active: 1 });
      inserted++;
    }
  }

  res.json({ message: `Defaults restored, inserted ${inserted} plans` });
});

// Free Plans CRUD (Admin only)
router.get('/free-plans', adminMiddleware, async (req, res) => {
  const plans = await prepare('free_plans').all('sort_order', 'asc');
  res.json(plans);
});

router.post('/free-plans', adminMiddleware, async (req, res) => {
  const { name, ram, cpu, location, description, sort_order } = req.body;
  const result = await prepare('free_plans').run({
    name, ram, cpu, location, description, sort_order: sort_order || 0
  });
  res.json({ id: result.lastInsertRowid });
});

router.put('/free-plans/:id', adminMiddleware, async (req, res) => {
  const { name, ram, cpu, location, description, sort_order } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (ram) updates.ram = ram;
  if (cpu) updates.cpu = cpu;
  if (location) updates.location = location;
  if (description) updates.description = description;
  if (typeof sort_order !== 'undefined') updates.sort_order = sort_order;

  await prepare('free_plans').update(req.params.id, updates);
  res.json({ message: 'Plan updated' });
});

router.delete('/free-plans/:id', adminMiddleware, async (req, res) => {
  await prepare('free_plans').delete(req.params.id);
  res.json({ message: 'Plan deleted' });
});

// Tickets (Admin only for full list/update)
router.get('/tickets', adminMiddleware, async (req, res) => {
  const tickets = await prepare('tickets').all('created_at', 'desc');
  // Enrichment with usernames (simple version for Firestore)
  const usersRef = prepare('users');
  const enriched = await Promise.all(tickets.map(async (t) => {
    const user = await usersRef.get('id', t.user_id);
    return { ...t, username: user?.username || 'Unknown', userEmail: user?.email || 'Unknown' };
  }));
  res.json(enriched);
});

router.put('/tickets/:id', adminMiddleware, async (req, res) => {
  const { status, adminResponse } = req.body;
  await prepare('tickets').update(req.params.id, { status, admin_response: adminResponse });
  res.json({ message: 'Ticket updated' });
});

// Admin credentials update
router.put('/credentials', adminMiddleware, async (req, res) => {
  const { email, password } = req.body;
  const updates = {};
  if (email) updates.email = email;
  if (password) updates.password = bcrypt.hashSync(password, 10);

  if (Object.keys(updates).length > 0) {
    await prepare('users').update(req.user.id, updates);
  }
  res.json({ message: 'Credentials updated' });
});

// About Content Management
router.get('/about', async (req, res) => {
  try {
    const about = await prepare('about_content').all();
    if (about && about.length > 0) {
      res.json(about[0]);
    } else {
      res.json({
        id: 1,
        content: "Flame Cloud is a next-generation gaming server hosting platform built for speed, power, and reliability.",
        founder_name: "Flame Founder",
        owner_name: "Flame Owner",
        management_name: "Flame Management"
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/about', adminMiddleware, async (req, res) => {
  const { content, founder_name, founder_photo, owner_name, owner_photo, management_name, management_photo } = req.body;
  const aboutRef = prepare('about_content');
  const existing = await aboutRef.all();

  const updates = {
    content, founder_name, founder_photo: founder_photo || null,
    owner_name, owner_photo: owner_photo || null,
    management_name, management_photo: management_photo || null
  };

  if (existing.length > 0) {
    await aboutRef.update(existing[0].id, updates);
  } else {
    await aboutRef.run(updates);
  }

  res.json({ message: 'About content updated' });
});

// Location Settings (Admin only)
router.get('/locations', adminMiddleware, async (req, res) => {
  const locations = await prepare('location_settings').all('sort_order', 'asc');
  res.json(locations);
});

router.put('/locations/:id', adminMiddleware, async (req, res) => {
  const { isAvailable } = req.body;
  await prepare('location_settings').update(req.params.id, { is_available: isAvailable ? 1 : 0 });
  res.json({ message: 'Location updated' });
});

// YT Partners CRUD (Admin only)
router.get('/yt-partners', adminMiddleware, async (req, res) => {
  const partners = await prepare('yt_partners').all('sort_order', 'asc');
  res.json(partners);
});

router.post('/yt-partners', adminMiddleware, async (req, res) => {
  const { name, link, logo, isFeatured } = req.body;
  const partnersRef = prepare('yt_partners');
  const existing = await partnersRef.all('sort_order', 'desc');
  const newOrder = (existing.length > 0) ? (existing[0].sort_order || 0) + 1 : 1;

  const result = await partnersRef.run({
    name, channel_link: link, logo: logo || null,
    is_featured: isFeatured ? 1 : 0,
    sort_order: newOrder,
    created_at: new Date().toISOString()
  });
  res.json({ id: result.lastInsertRowid });
});

router.put('/yt-partners/:id', adminMiddleware, async (req, res) => {
  const { name, link, logo, isFeatured } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (link) updates.channel_link = link;
  if (typeof logo !== 'undefined') updates.logo = logo;
  if (typeof isFeatured !== 'undefined') updates.is_featured = isFeatured ? 1 : 0;

  await prepare('yt_partners').update(req.params.id, updates);
  res.json({ message: 'Partner updated' });
});

router.delete('/yt-partners/:id', adminMiddleware, async (req, res) => {
  await prepare('yt_partners').delete(req.params.id);
  res.json({ message: 'Partner deleted' });
});

// YT Partners Reorder (Admin only)
router.put('/yt-partners-reorder', adminMiddleware, async (req, res) => {
  const { orderedIds } = req.body;
  const partnersRef = prepare('yt_partners');
  for (let i = 0; i < orderedIds.length; i++) {
    await partnersRef.update(orderedIds[i], { sort_order: i + 1 });
  }
  res.json({ message: 'Partners reordered' });
});

// Site Settings
router.get('/settings/:key', async (req, res) => {
  const setting = await prepare('site_settings').get('id', req.params.key);
  res.json(setting || { key: req.params.key, value: '0' });
});

router.put('/settings/:key', adminMiddleware, async (req, res) => {
  const { value } = req.body;
  const settingsRef = prepare('site_settings');
  // For site settings, we use fixed keys as doc IDs
  await settingsRef.update(req.params.key, { value }).catch(async () => {
    // If update fails (doc doesn't exist), we try set but our shim uses add
    // Let's use get/run logic
    const exists = await settingsRef.get('id', req.params.key);
    if (exists) {
      await settingsRef.update(req.params.key, { value });
    } else {
      // Small adjustment: our shim adds random ID. For settings we need fixed ID.
      // We can manually use getDB()
      const admin = require('firebase-admin');
      await admin.firestore().collection('site_settings').doc(req.params.key).set({ value });
    }
  });
  res.json({ message: 'Setting updated' });
});

module.exports = router;
