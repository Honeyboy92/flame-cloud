const express = require('express');
const { prepare } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const ticketsRef = prepare('tickets');
    let tickets;

    if (req.user.isAdmin) {
      tickets = await ticketsRef.all('created_at', 'desc');
    } else {
      // Small limitation: Shim doesn't support where() easily for all(), 
      // let's fetch all and filter or add more to shim.
      // For Firestore-scale, we should filter in query.
      const allTickets = await ticketsRef.all('created_at', 'desc');
      tickets = allTickets.filter(t => t.user_id === req.user.id);
    }

    const mappedTickets = (tickets || []).map(t => ({
      id: t.id,
      userId: t.user_id,
      subject: t.subject,
      message: t.message,
      screenshot: t.screenshot,
      status: t.status,
      adminResponse: t.admin_response,
      createdAt: t.created_at
    }));

    res.json(mappedTickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to load tickets' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { subject, message, screenshot } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message required' });
  }

  try {
    const result = await prepare('tickets').run({
      user_id: req.user.id,
      subject,
      message,
      screenshot: screenshot || null,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    res.json({ id: result.lastInsertRowid, message: 'Ticket submitted successfully' });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status, admin_response } = req.body;
  try {
    await prepare('tickets').update(req.params.id, {
      status,
      admin_response: admin_response || null
    });
    res.json({ message: 'Ticket updated successfully' });
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

module.exports = router;
