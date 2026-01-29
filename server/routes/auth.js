const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prepare } = require('../database');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  try {
    const users = prepare('users');
    const existing = await users.get('email', email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    await users.run({ username, email, password: hashedPassword });
    res.json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prepare('users').get('email', email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, isAdmin: user.is_admin } });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await prepare('users').get('id', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password, ...safeUser } = user;
  res.json({ ...safeUser, isAdmin: !!user.is_admin });
});

// Update email
router.put('/update-email', authMiddleware, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const users = prepare('users');
    const existing = await users.get('email', email);
    if (existing && existing.id !== req.user.id) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    await users.update(req.user.id, { email });
    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Update password
router.put('/update-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  try {
    const users = prepare('users');
    const user = await users.get('id', req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await users.update(req.user.id, { password: hashedPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Update username
router.put('/update-username', authMiddleware, async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const users = prepare('users');
    const existing = await users.get('username', username);
    if (existing && existing.id !== req.user.id) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    await users.update(req.user.id, { username });
    res.json({ message: 'Username updated successfully', username });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update username' });
  }
});

// Update profile (Unified: username, email, avatar)
router.put('/update-profile', authMiddleware, async (req, res) => {
  const { username, email, avatar } = req.body;
  const userId = req.user.id;
  const users = prepare('users');

  const updates = {};
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (typeof avatar !== 'undefined') updates.avatar = avatar;

  try {
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });

    // Unique checks
    if (username) {
      const existing = await users.get('username', username);
      if (existing && existing.id !== userId) return res.status(400).json({ error: 'Username already taken' });
    }
    if (email) {
      const existing = await users.get('email', email);
      if (existing && existing.id !== userId) return res.status(400).json({ error: 'Email already in use' });
    }

    await users.update(userId, updates);
    const updated = await users.get('id', userId);
    const { password, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update avatar
router.put('/update-avatar', authMiddleware, async (req, res) => {
  const { avatar } = req.body;
  try {
    await prepare('users').update(req.user.id, { avatar: avatar || null });
    res.json({ message: 'Avatar updated successfully', avatar });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

module.exports = router;
