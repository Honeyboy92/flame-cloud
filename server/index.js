// Firebase removed, using Supabase now
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: true,
  credentials: true
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.url.startsWith('/api')) {
    // Debug log for API paths
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes - Support both /api/ prefix and bare paths for compatibility
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/users`, require('./routes/users'));
  app.use(`${prefix}/auth`, require('./routes/auth'));
  app.use(`${prefix}/plans`, require('./routes/plans'));
  app.use(`${prefix}/tickets`, require('./routes/tickets'));
  app.use(`${prefix}/admin`, require('./routes/admin'));
  app.use(`${prefix}/about`, require('./routes/about'));
  app.use(`${prefix}/chat_messages`, require('./routes/chat'));

  // Consistent aliases
  app.use(`${prefix}/yt_partners`, require('./routes/admin'));
  app.use(`${prefix}/location_settings`, require('./routes/plans'));
  app.use(`${prefix}/paid_plans`, require('./routes/plans'));
  app.use(`${prefix}/site_settings`, require('./routes/plans'));
  app.use(`${prefix}/about_content`, require('./routes/about'));
};

registerRoutes('/api');
registerRoutes(''); // Fallback for when /api is stripped by proxy/Vercel

// Health check
app.get('/api/health-check', (req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV, time: new Date().toISOString() }));

// Error handling
app.use((req, res) => {
  console.log(`[404 Not Found] ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB (Firestore initialization is idempotent)
initDB().catch(err => console.error('DB Init Error:', err));

// Local development server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Flame Cloud server running on port ${PORT}`);
  });
}

// Export app for external use (e.g. Vercel)

module.exports = app;
