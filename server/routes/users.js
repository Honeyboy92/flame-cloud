const express = require('express');
const { prepare, saveDB } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get user list (Authenticated users)
router.get('/', async (req, res) => {
    try {
        const usersRef = prepare('users');
        let users;

        // If not admin, only show administrators (Support Staff)
        const isAdmin = req.user.isAdmin === true || req.user.isAdmin === 1;
        if (!isAdmin) {
            // For simple shim simplicity, we use .all and filter, or we could add query support to shim
            // But let's keep it simple for now
            const allUsers = await usersRef.all();
            users = allUsers.filter(u => u.is_admin === 1 || u.is_admin === true);
        } else {
            users = await usersRef.all('created_at', 'desc');
        }

        // Strip passwords
        const safeUsers = users.map(({ password, ...rest }) => ({ ...rest, is_admin: !!rest.is_admin }));
        res.json(safeUsers);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update user (Own profile or Admin)
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, avatar } = req.body;

    // Security check: Only original user OR admin can update
    const isSelf = String(req.user.id) === String(userId);
    const isAdmin = req.user.isAdmin === true || req.user.isAdmin === 1;

    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: `Permission denied: You cannot update this profile.` });
    }

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (typeof avatar !== 'undefined') updates.avatar = avatar;

    try {
        if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });

        const usersRef = prepare('users');

        // Unique checks
        if (username) {
            const existing = await usersRef.get('username', username);
            if (existing && existing.id !== userId) return res.status(400).json({ error: 'Username already taken' });
        }
        if (email) {
            const existing = await usersRef.get('email', email);
            if (existing && existing.id !== userId) return res.status(400).json({ error: 'Email already in use' });
        }

        await usersRef.update(userId, updates);

        const updated = await usersRef.get('id', userId);
        const { password, ...safeUser } = updated;
        res.json({ message: 'User updated successfully', user: safeUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete user (Admin only)
router.delete('/:id', async (req, res) => {
    const isAdmin = req.user.isAdmin === true || req.user.isAdmin === 1;
    if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required for deletion' });
    }

    const userId = req.params.id;
    const usersRef = prepare('users');
    const user = await usersRef.get('id', userId);

    if (user?.is_admin) {
        return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    // In Firestore, we should ideally delete related docs too, or let it slide for now
    await usersRef.delete(userId);
    res.json({ message: 'User deleted successfully' });
});

module.exports = router;
