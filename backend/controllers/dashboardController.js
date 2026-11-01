const db = require('../config/database');

exports.getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Overall metric counts
    const [[{ total_events }]] = await db.query('SELECT COUNT(*) as total_events FROM events');
    const [[{ upcoming_events }]] = await db.query('SELECT COUNT(*) as upcoming_events FROM events WHERE event_date >= CURDATE()');
    const [[{ total_students }]] = await db.query('SELECT COUNT(*) as total_students FROM students');
    const [[{ total_registrations }]] = await db.query('SELECT COUNT(*) as total_registrations FROM registrations WHERE status = "CONFIRMED"');
    const [[{ total_attendance }]] = await db.query('SELECT COUNT(*) as total_attendance FROM attendance');

    // 2. Department-wise student participation
    const [departmentData] = await db.query(`
      SELECT s.department, COUNT(r.registration_id) as count
      FROM students s
      JOIN registrations r ON s.student_id = r.student_id
      WHERE r.status = 'CONFIRMED'
      GROUP BY s.department
      ORDER BY count DESC
    `);

    // 3. Category-wise event count
    const [categoryData] = await db.query(`
      SELECT category, COUNT(*) as count
      FROM events
      GROUP BY category
      ORDER BY count DESC
    `);

    // 4. Per-event attendance comparison
    const [eventPerformance] = await db.query(`
      SELECT 
        e.event_id,
        e.event_name,
        e.event_date,
        e.capacity,
        COUNT(DISTINCT r.registration_id) as total_registered,
        COUNT(DISTINCT a.attendance_id) as total_attended
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'CONFIRMED'
      LEFT JOIN attendance a ON e.event_id = a.event_id
      GROUP BY e.event_id
      ORDER BY e.event_date DESC
      LIMIT 6
    `);

    // 5. Recent Registrations Stream
    const [recentRegistrations] = await db.query(`
      SELECT 
        r.registration_id,
        r.registration_date,
        s.name as student_name,
        s.roll_number,
        s.department,
        e.event_name
      FROM registrations r
      JOIN students s ON r.student_id = s.student_id
      JOIN events e ON r.event_id = e.event_id
      ORDER BY r.registration_date DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      metrics: {
        total_events,
        upcoming_events,
        total_students,
        total_registrations,
        total_attendance,
        attendance_percentage: total_registrations > 0 ? Math.round((total_attendance / total_registrations) * 100) : 0
      },
      departmentData,
      categoryData,
      eventPerformance,
      recentRegistrations
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
  }
};
