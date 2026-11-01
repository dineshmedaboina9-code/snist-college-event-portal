const db = require('../config/database');

// Get all events with dynamic registration metrics
exports.getAllEvents = async (req, res) => {
  try {
    const { category, search, upcoming } = req.query;
    let query = `
      SELECT 
        e.*,
        COUNT(DISTINCT r.registration_id) AS registered_count,
        (e.capacity - COUNT(DISTINCT r.registration_id)) AS available_seats
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'CONFIRMED'
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND e.category = ?`;
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ` AND (e.event_name LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (upcoming === 'true') {
      query += ` AND e.event_date >= CURDATE()`;
    }

    query += ` GROUP BY e.event_id ORDER BY e.event_date ASC, e.event_time ASC`;

    const [events] = await db.query(query, params);

    // If a student is authenticated, check if they are registered for each event
    if (req.user && req.user.role === 'student') {
      const [userRegs] = await db.query(
        'SELECT event_id, qr_token FROM registrations WHERE student_id = ? AND status = "CONFIRMED"',
        [req.user.id]
      );
      const registeredMap = {};
      userRegs.forEach(r => { registeredMap[r.event_id] = r.qr_token; });

      events.forEach(event => {
        event.is_registered = Boolean(registeredMap[event.event_id]);
        event.user_qr_token = registeredMap[event.event_id] || null;
      });
    }

    res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

// Get single event details
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const [rows] = await db.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.registration_id) AS registered_count,
        (e.capacity - COUNT(DISTINCT r.registration_id)) AS available_seats,
        a.name as creator_name,
        a.email as creator_email
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'CONFIRMED'
      LEFT JOIN admins a ON e.created_by = a.admin_id
      WHERE e.event_id = ?
      GROUP BY e.event_id
    `, [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = rows[0];

    // Check student status
    if (req.user && req.user.role === 'student') {
      const [reg] = await db.query(
        'SELECT registration_id, qr_token, status, registration_date FROM registrations WHERE event_id = ? AND student_id = ?',
        [eventId, req.user.id]
      );
      event.is_registered = reg.length > 0 && reg[0].status === 'CONFIRMED';
      event.user_registration = reg[0] || null;
    }

    res.json({ success: true, event });
  } catch (error) {
    console.error('Error fetching event by id:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
  }
};

// Create new event (Admin or Organizer)
exports.createEvent = async (req, res) => {
  try {
    const { event_name, description, category, event_date, event_time, venue, capacity, banner_url } = req.body;

    if (!event_name || !description || !category || !event_date || !event_time || !venue || !capacity) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const [result] = await db.query(`
      INSERT INTO events (event_name, description, category, event_date, event_time, venue, capacity, banner_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      event_name.trim(),
      description.trim(),
      category.trim(),
      event_date,
      event_time,
      venue.trim(),
      parseInt(capacity, 10),
      banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      req.user.id
    ]);

    const eventId = result.insertId;
    res.status(201).json({
      success: true,
      message: 'Event published successfully!',
      eventId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { event_name, description, category, event_date, event_time, venue, capacity, banner_url } = req.body;

    const [existing] = await db.query('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await db.query(`
      UPDATE events 
      SET event_name = ?, description = ?, category = ?, event_date = ?, event_time = ?, venue = ?, capacity = ?, banner_url = ?
      WHERE event_id = ?
    `, [
      event_name || existing[0].event_name,
      description || existing[0].description,
      category || existing[0].category,
      event_date || existing[0].event_date,
      event_time || existing[0].event_time,
      venue || existing[0].venue,
      capacity ? parseInt(capacity, 10) : existing[0].capacity,
      banner_url !== undefined ? banner_url : existing[0].banner_url,
      eventId
    ]);

    res.json({ success: true, message: 'Event updated successfully!' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const [existing] = await db.query('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await db.query('DELETE FROM events WHERE event_id = ?', [eventId]);
    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};
