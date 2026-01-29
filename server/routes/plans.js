const express = require('express');
const { prepare } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generic root route for shim compatibility
router.get('/', async (req, res) => {
  const table = req.baseUrl.split('/').pop();

  if (table === 'location_settings') {
    const locations = await prepare('location_settings').all('sort_order', 'asc');
    return res.json(locations);
  }

  if (table === 'site_settings' || table === 'settings') {
    const { key } = req.query;
    if (key) {
      const setting = await prepare('site_settings').get('id', key); // Key acts as ID in site_settings
      return res.json(setting || { key, value: '0' });
    }
    const settings = await prepare('site_settings').all();
    return res.json(settings);
  }

  // Default to paid_plans
  const showAll = req.query.is_active === 'false' || req.query.all === 'true';
  const plans = await prepare('paid_plans').all('sort_order', 'asc');

  if (showAll) {
    res.json(plans);
  } else {
    res.json(plans.filter(p => p.is_active));
  }
});

// Admin CRUD for paid plans (mapped to table: paid_plans)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, ram, cpu, storage, location, price, discount, sort_order } = req.body;
  const result = await prepare('paid_plans').run({
    name, ram, cpu, storage, location, price,
    discount: discount || 0,
    sort_order: sort_order || 0,
    is_active: 1
  });
  res.json({ id: result.lastInsertRowid, message: 'Plan created' });
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, ram, cpu, storage, location, price, discount, sort_order, is_active } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (ram) updates.ram = ram;
  if (cpu) updates.cpu = cpu;
  if (storage) updates.storage = storage;
  if (location) updates.location = location;
  if (price) updates.price = price;
  if (typeof discount !== 'undefined') updates.discount = discount;
  if (typeof sort_order !== 'undefined') updates.sort_order = sort_order;
  if (typeof is_active !== 'undefined') updates.is_active = is_active;

  await prepare('paid_plans').update(req.params.id, updates);
  res.json({ message: 'Plan updated' });
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await prepare('paid_plans').delete(req.params.id);
  res.json({ message: 'Plan deleted' });
});

// Added generic table name route for shim compatibility
router.get('/paid_plans', async (req, res) => {
  const plans = await prepare('paid_plans').all('sort_order', 'asc');
  res.json(plans.filter(p => p.is_active));
});

router.get('/paid', async (req, res) => {
  const plans = await prepare('paid_plans').all('sort_order', 'asc');
  res.json(plans.filter(p => p.is_active));
});

router.get('/free', async (req, res) => {
  const plans = await prepare('free_plans').all('sort_order', 'asc');
  res.json(plans);
});

// Get location availability (mapped from table: location_settings)
router.get('/locations', async (req, res) => {
  const locations = await prepare('location_settings').all('sort_order', 'asc');
  res.json(locations);
});

router.put('/locations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { is_available } = req.body;
  await prepare('location_settings').update(req.params.id, { is_available: is_available ? 1 : 0 });
  res.json({ message: 'Location updated' });
});

// Added generic table name route for shim compatibility
router.get('/location_settings', async (req, res) => {
  const locations = await prepare('location_settings').all('sort_order', 'asc');
  res.json(locations);
});

// Check if user can access free plans
router.get('/free-plan-status', authMiddleware, async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const usersRef = prepare('users');
  const user = await usersRef.get('id', req.user.id);

  // Checking IP claim is complex with simple shim, we could skip or implement
  const ipClaimed = await usersRef.get('claimed_ip', clientIP);

  res.json({
    canClaim: !user?.has_claimed_free_plan && !(ipClaimed && ipClaimed.has_claimed_free_plan),
    hasClaimed: !!user?.has_claimed_free_plan,
    ipAlreadyUsed: !!(ipClaimed && ipClaimed.has_claimed_free_plan)
  });
});

// Claim free plan
router.post('/claim-free', authMiddleware, async (req, res) => {
  const { planId } = req.body;
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const usersRef = prepare('users');
  const user = await usersRef.get('id', req.user.id);

  if (user?.has_claimed_free_plan) {
    return res.status(400).json({ error: 'You have already claimed a free plan' });
  }

  const ipClaimed = await usersRef.get('claimed_ip', clientIP);
  if (ipClaimed && ipClaimed.has_claimed_free_plan) {
    return res.status(400).json({ error: 'A free plan has already been claimed from this IP address' });
  }

  const plan = await prepare('free_plans').get('id', planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  await usersRef.update(req.user.id, { has_claimed_free_plan: 1, claimed_ip: clientIP });
  await prepare('tickets').run({
    user_id: req.user.id,
    subject: `Free Plan: ${plan.name}`,
    message: `Free Plan Claimed\nPlan: ${plan.name}\nRAM: ${plan.ram}\nCPU: ${plan.cpu}\nLocation: ${plan.location}`,
    status: 'pending'
  });
  res.json({ success: true, message: 'Free plan claimed successfully!' });
});

// Public YT Partners
router.get('/yt-partners', async (req, res) => {
  const partners = await prepare('yt_partners').all('sort_order', 'asc');
  res.json(partners);
});

// Admin CRUD for YT Partners
router.post('/yt-partners', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, channel_link, logo, is_featured } = req.body;
  const result = await prepare('yt_partners').run({
    name,
    channel_link,
    logo: logo || null,
    is_featured: is_featured ? 1 : 0
  });
  res.json({ id: result.lastInsertRowid, message: 'Partner added' });
});

router.put('/yt-partners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, channel_link, logo, is_featured } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (channel_link) updates.channel_link = channel_link;
  if (typeof logo !== 'undefined') updates.logo = logo;
  if (typeof is_featured !== 'undefined') updates.is_featured = is_featured ? 1 : 0;

  await prepare('yt_partners').update(req.params.id, updates);
  res.json({ message: 'Partner updated' });
});

router.delete('/yt-partners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await prepare('yt_partners').delete(req.params.id);
  res.json({ message: 'Partner deleted' });
});

// Public site settings
router.get('/settings/:key', async (req, res) => {
  const setting = await prepare('site_settings').get('id', req.params.key);
  res.json(setting || { key: req.params.key, value: '0' });
});

// Create an order/ticket for a paid plan
router.post('/order', authMiddleware, async (req, res) => {
  const { subject, message, screenshot } = req.body;
  if (!subject || !message) return res.status(400).json({ error: 'Subject and message required' });
  try {
    await prepare('tickets').run({
      user_id: req.user.id,
      subject,
      message,
      screenshot: screenshot || null,
      status: 'pending'
    });
    res.json({ message: 'Order submitted successfully' });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
