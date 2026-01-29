const functions = require('firebase-functions');
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
  if (req.url.startsWith('/api')) {
    console.log(`[API Request] ${req.method} ${req.url}`);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/about', require('./routes/about'));
app.use('/api/chat_messages', require('./routes/chat'));

// Consistent aliases
app.use('/api/yt_partners', require('./routes/admin'));
app.use('/api/location_settings', require('./routes/plans'));
app.use('/api/paid_plans', require('./routes/plans'));
app.use('/api/site_settings', require('./routes/plans'));
app.use('/api/about_content', require('./routes/about'));

// Health check
app.get('/api/health-check', (req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV, time: new Date().toISOString() }));

// Error handling
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

// Export as Firebase Cloud Function
exports.api = functions.https.onRequest(app);

module.exports = app;
