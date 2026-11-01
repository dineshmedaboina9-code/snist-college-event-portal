const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { sendEmailNotification } = require('../utils/emailService');

// Register a student for an event
exports.registerForEvent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    // 1. Fetch event details and current confirmed count
    const [events] = await db.query(`
      SELECT 
        e.*,
        COUNT(r.registration_id) AS current_regs
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'CONFIRMED'
      WHERE e.event_id = ?
      GROUP BY e.event_id
    `, [event_id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event does not exist.' });
    }

    const event = events[0];

    // 2. Check capacity
    if (event.current_regs >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration closed. This event has reached maximum capacity.'
      });
    }

    // 3. Check duplicate registration
    const [existing] = await db.query(
      'SELECT registration_id, status, qr_token FROM registrations WHERE student_id = ? AND event_id = ?',
      [studentId, event_id]
    );

    if (existing.length > 0 && existing[0].status === 'CONFIRMED') {
      return res.status(409).json({
        success: false,
        message: 'You have already registered for this event.',
        qr_token: existing[0].qr_token
      });
    }

    // 4. Generate unique QR Token (secure random identifier)
    const qrToken = `SNIST-${Date.now().toString(36).toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    let registrationId;
    if (existing.length > 0 && existing[0].status === 'CANCELLED') {
      // Re-activate cancelled registration
      await db.query(
        'UPDATE registrations SET status = "CONFIRMED", qr_token = ?, registration_date = CURRENT_TIMESTAMP WHERE registration_id = ?',
        [qrToken, existing[0].registration_id]
      );
      registrationId = existing[0].registration_id;
    } else {
      const [insertRes] = await db.query(
        'INSERT INTO registrations (student_id, event_id, qr_token, status) VALUES (?, ?, ?, "CONFIRMED")',
        [studentId, event_id, qrToken]
      );
      registrationId = insertRes.insertId;
    }

    // 5. Add In-App Notification
    const notifMsg = `You are successfully registered for "${event.event_name}" on ${event.event_date}. Save your QR code for entrance check-in.`;
    await db.query(
      'INSERT INTO notifications (student_id, message, notification_type) VALUES (?, ?, "REGISTRATION")',
      [studentId, notifMsg]
    );

    // 6. Send Email Notification (Async)
    sendEmailNotification({
      to: req.user.email,
      subject: `Registration Confirmed: ${event.event_name} - SNIST`,
      text: `Hello ${req.user.name},\n\nYour registration for "${event.event_name}" at ${event.venue} is confirmed.\nYour check-in QR Token is: ${qrToken}\n\nPlease present this at the venue entrance.\n\nSreenidhi Institute of Science and Technology.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">SNIST Event Registration Confirmed!</h2>
          <p>Hi <strong>${req.user.name}</strong>,</p>
          <p>You have successfully registered for <strong>${event.event_name}</strong>.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 4px 0;"><strong>Date:</strong> ${event.event_date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${event.event_time}</p>
            <p style="margin: 4px 0;"><strong>Venue:</strong> ${event.venue}</p>
            <p style="margin: 4px 0;"><strong>Your QR Token:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${qrToken}</code></p>
          </div>
          <p>Open your College Event Portal dashboard to view your dynamic QR code for instant check-in.</p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Sreenidhi Institute of Science and Technology (SNIST) Event Management Portal</p>
        </div>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event!',
      registration: {
        registration_id: registrationId,
        event_id,
        qr_token: qrToken,
        status: 'CONFIRMED'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete registration.' });
  }
};

// Student's My Registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await db.query(`
      SELECT 
        r.registration_id,
        r.qr_token,
        r.status,
        r.registration_date,
        e.event_id,
        e.event_name,
        e.category,
        e.event_date,
        e.event_time,
        e.venue,
        e.banner_url,
        a.attendance_id,
        a.check_in_time
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      LEFT JOIN attendance a ON r.registration_id = a.registration_id
      WHERE r.student_id = ?
      ORDER BY e.event_date ASC
    `, [studentId]);

    const formatted = rows.map(item => ({
      ...item,
      is_attended: Boolean(item.attendance_id)
    }));

    res.json({ success: true, count: formatted.length, registrations: formatted });
  } catch (error) {
    console.error('Error fetching my registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve registrations.' });
  }
};

// Get all registrations for a specific event (Admin / Organizer)
exports.getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const [rows] = await db.query(`
      SELECT 
        r.registration_id,
        r.qr_token,
        r.status,
        r.registration_date,
        s.student_id,
        s.name,
        s.email,
        s.roll_number,
        s.department,
        a.attendance_id,
        a.check_in_time,
        adm.name as checked_in_by
      FROM registrations r
      JOIN students s ON r.student_id = s.student_id
      LEFT JOIN attendance a ON r.registration_id = a.registration_id
      LEFT JOIN admins adm ON a.marked_by = adm.admin_id
      WHERE r.event_id = ?
      ORDER BY r.registration_date DESC
    `, [eventId]);

    const stats = {
      total_registered: rows.filter(r => r.status === 'CONFIRMED').length,
      total_attended: rows.filter(r => Boolean(r.attendance_id)).length
    };

    res.json({ success: true, stats, registrations: rows });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve attendees.' });
  }
};

// Cancel Registration
exports.cancelRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const [existing] = await db.query(`
      SELECT r.*, e.event_name 
      FROM registrations r 
      JOIN events e ON r.event_id = e.event_id 
      WHERE r.registration_id = ?
    `, [registrationId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    const reg = existing[0];
    if (req.user.role === 'student' && reg.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this registration.' });
    }

    await db.query('UPDATE registrations SET status = "CANCELLED" WHERE registration_id = ?', [registrationId]);

    await db.query(
      'INSERT INTO notifications (student_id, message, notification_type) VALUES (?, ?, "CANCELLATION")',
      [reg.student_id, `Registration for "${reg.event_name}" has been cancelled.`]
    );

    res.json({ success: true, message: 'Registration successfully cancelled.' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
};
