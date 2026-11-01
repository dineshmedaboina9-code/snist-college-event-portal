const db = require('../config/database');

// Verify QR Token without marking check-in
exports.verifyQrToken = async (req, res) => {
  try {
    const { token, event_id } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'QR token is required.' });
    }

    const trimmedToken = token.trim();

    // Query registration details
    const [rows] = await db.query(`
      SELECT 
        r.registration_id,
        r.qr_token,
        r.status as registration_status,
        r.registration_date,
        s.student_id,
        s.name as student_name,
        s.email as student_email,
        s.roll_number,
        s.department,
        e.event_id,
        e.event_name,
        e.event_date,
        e.event_time,
        e.venue,
        a.attendance_id,
        a.check_in_time,
        adm.name as marked_by_name
      FROM registrations r
      JOIN students s ON r.student_id = s.student_id
      JOIN events e ON r.event_id = e.event_id
      LEFT JOIN attendance a ON r.registration_id = a.registration_id
      LEFT JOIN admins adm ON a.marked_by = adm.admin_id
      WHERE r.qr_token = ?
    `, [trimmedToken]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid QR Code. No matching registration record found in database.'
      });
    }

    const reg = rows[0];

    // If an event_id was specified by the scanner, verify it matches
    if (event_id && parseInt(event_id, 10) !== reg.event_id) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Mismatched Event! This pass is for "${reg.event_name}", not the currently selected event.`
      });
    }

    if (reg.registration_status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Registration is cancelled or inactive.'
      });
    }

    const alreadyCheckedIn = Boolean(reg.attendance_id);

    res.json({
      success: true,
      valid: true,
      alreadyCheckedIn,
      message: alreadyCheckedIn ? 'Warning: Student has already checked in!' : 'Valid registration!',
      registration: reg
    });
  } catch (error) {
    console.error('Error verifying QR token:', error);
    res.status(500).json({ success: false, message: 'Internal error verifying QR token.' });
  }
};

// Mark Attendance (Check-in student)
exports.checkInStudent = async (req, res) => {
  try {
    const { token, event_id } = req.body;
    const staffId = req.user.id;

    if (!token) {
      return res.status(400).json({ success: false, message: 'QR token is required.' });
    }

    const trimmedToken = token.trim();

    // 1. Look up registration
    const [rows] = await db.query(`
      SELECT 
        r.registration_id,
        r.qr_token,
        r.status as registration_status,
        s.student_id,
        s.name as student_name,
        s.roll_number,
        s.department,
        e.event_id,
        e.event_name
      FROM registrations r
      JOIN students s ON r.student_id = s.student_id
      JOIN events e ON r.event_id = e.event_id
      WHERE r.qr_token = ?
    `, [trimmedToken]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'QR Code is invalid or does not exist.'
      });
    }

    const reg = rows[0];

    if (event_id && parseInt(event_id, 10) !== reg.event_id) {
      return res.status(400).json({
        success: false,
        message: `Pass belongs to "${reg.event_name}", not the selected event.`
      });
    }

    if (reg.registration_status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Registration was cancelled.'
      });
    }

    // 2. Check for duplicate check-in
    const [existingAttendance] = await db.query(`
      SELECT a.*, adm.name as marked_by_name 
      FROM attendance a 
      LEFT JOIN admins adm ON a.marked_by = adm.admin_id 
      WHERE a.registration_id = ?
    `, [reg.registration_id]);

    if (existingAttendance.length > 0) {
      const att = existingAttendance[0];
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: `Duplicate check-in blocked! Student already checked in at ${att.check_in_time} by ${att.marked_by_name || 'Staff'}.`,
        details: {
          student_name: reg.student_name,
          roll_number: reg.roll_number,
          check_in_time: att.check_in_time
        }
      });
    }

    // 3. Insert attendance record
    const [result] = await db.query(`
      INSERT INTO attendance (registration_id, event_id, marked_by)
      VALUES (?, ?, ?)
    `, [reg.registration_id, reg.event_id, staffId]);

    // 4. Notify student
    await db.query(`
      INSERT INTO notifications (student_id, message, notification_type)
      VALUES (?, ?, 'ATTENDANCE')
    `, [reg.student_id, `Attendance confirmed for "${reg.event_name}". Welcome!`]);

    res.status(201).json({
      success: true,
      message: `Check-in recorded successfully for ${reg.student_name} (${reg.roll_number})!`,
      attendance_id: result.insertId,
      student: {
        name: reg.student_name,
        roll_number: reg.roll_number,
        department: reg.department,
        event_name: reg.event_name
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Server error marking attendance.' });
  }
};

// Get Attendance Report for an Event
exports.getEventAttendanceReport = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Total registrations
    const [regs] = await db.query(`
      SELECT 
        r.registration_id,
        r.qr_token,
        s.student_id,
        s.name,
        s.roll_number,
        s.department,
        s.email,
        a.attendance_id,
        a.check_in_time,
        adm.name as marked_by_name
      FROM registrations r
      JOIN students s ON r.student_id = s.student_id
      LEFT JOIN attendance a ON r.registration_id = a.registration_id
      LEFT JOIN admins adm ON a.marked_by = adm.admin_id
      WHERE r.event_id = ? AND r.status = 'CONFIRMED'
      ORDER BY a.check_in_time DESC, s.name ASC
    `, [eventId]);

    const totalRegistered = regs.length;
    const totalAttended = regs.filter(r => Boolean(r.attendance_id)).length;
    const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    res.json({
      success: true,
      report: {
        total_registered: totalRegistered,
        total_attended: totalAttended,
        attendance_percentage: attendanceRate,
        records: regs
      }
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate attendance report.' });
  }
};
