const db = require('../config/database');

exports.getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
      [studentId]
    );

    const unreadCount = rows.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications: rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { notification_id } = req.params;

    if (notification_id === 'all') {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE student_id = ?', [studentId]);
    } else {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND student_id = ?', [notification_id, studentId]);
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification.' });
  }
};
