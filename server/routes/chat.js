const express = require('express');
const { prepare } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get chat messages (General or specific)
router.get('/', authMiddleware, async (req, res) => {
  const { or, dir } = req.query;
  const userId = req.user.id;

  try {
    const chatRef = prepare('chat_messages');
    let messages = await chatRef.all('created_at', dir === 'desc' ? 'desc' : 'asc');

    if (or) {
      const decodedOr = decodeURIComponent(or);
      const idsmatch = decodedOr.match(/\.eq\.(\d+)/g);

      if (idsmatch && idsmatch.length >= 2) {
        const otherId = idsmatch.find(m => m !== `.eq.${userId}`)?.replace('.eq.', '');
        if (otherId) {
          messages = messages.filter(m =>
            (String(m.sender_id) === String(userId) && String(m.receiver_id) === String(otherId)) ||
            (String(m.sender_id) === String(otherId) && String(m.receiver_id) === String(userId))
          );
        }
      } else {
        messages = messages.filter(m => String(m.sender_id) === String(userId) || String(m.receiver_id) === String(userId));
      }
    }

    // Enrich with user info
    const usersRef = prepare('users');
    const enriched = await Promise.all(messages.map(async (m) => {
      const sender = await usersRef.get('id', m.sender_id);
      return {
        ...m,
        sender: { username: sender?.username || 'Unknown', avatar: sender?.avatar || null }
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Chat fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages for specific user (compatibility)
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  const otherUserId = req.params.otherUserId;
  const currentUserId = req.user.id;
  try {
    const chatRef = prepare('chat_messages');
    const all = await chatRef.all('created_at', 'asc');
    const filtered = all.filter(m =>
      (String(m.sender_id) === String(currentUserId) && String(m.receiver_id) === String(otherUserId)) ||
      (String(m.sender_id) === String(otherUserId) && String(m.receiver_id) === String(currentUserId))
    );
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  const sId = sender_id || req.user.id;
  if (!message || !receiver_id) return res.status(400).json({ error: 'Missing data' });

  try {
    const result = await prepare('chat_messages').run({
      sender_id: sId,
      receiver_id,
      message,
      is_read: 0,
      created_at: new Date().toISOString()
    });
    res.json({ id: result.lastInsertRowid, message: 'Sent' });
  } catch (err) {
    res.status(500).json({ error: 'Send failed' });
  }
});

// Admin-specific users list
router.get('/users-list', authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const users = await prepare('users').all('last_seen', 'desc');
    res.json(users.filter(u => !u.is_admin));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Support admin getter
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const allUsers = await prepare('users').all();
    const admin = allUsers.find(u => u.is_admin);
    res.json(admin ? { id: admin.id, username: admin.username } : null);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
