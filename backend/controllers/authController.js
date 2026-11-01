const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, roll_number, department, password } = req.body;

    if (!name || !email || !roll_number || !department || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check existing email or roll number
    const [existing] = await db.query(
      'SELECT student_id, email, roll_number FROM students WHERE email = ? OR roll_number = ?',
      [email.trim().toLowerCase(), roll_number.trim().toUpperCase()]
    );

    if (existing.length > 0) {
      const match = existing[0];
      if (match.email === email.trim().toLowerCase()) {
        return res.status(409).json({ success: false, message: 'A student with this email already exists.' });
      }
      return res.status(409).json({ success: false, message: 'A student with this roll number already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO students (name, email, roll_number, department, password) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), roll_number.trim().toUpperCase(), department.trim(), hashedPassword]
    );

    const studentId = result.insertId;

    // Create a welcome notification
    await db.query(
      'INSERT INTO notifications (student_id, message, notification_type) VALUES (?, ?, ?)',
      [studentId, 'Welcome to the SNIST College Event Portal! Discover, register, and attend campus events.', 'SYSTEM']
    );

    const token = jwt.sign(
      { id: studentId, email: email.trim().toLowerCase(), roll_number: roll_number.trim().toUpperCase(), name: name.trim(), department: department.trim(), role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student registration successful!',
      token,
      user: {
        id: studentId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roll_number: roll_number.trim().toUpperCase(),
        department: department.trim(),
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// Student Login
exports.loginStudent = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or roll_number

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Roll Number and password are required.' });
    }

    const trimmed = identifier.trim();
    const [rows] = await db.query(
      'SELECT * FROM students WHERE email = ? OR roll_number = ?',
      [trimmed.toLowerCase(), trimmed.toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Student record not found.' });
    }

    const student = rows[0];
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign(
      {
        id: student.student_id,
        email: student.email,
        roll_number: student.roll_number,
        name: student.name,
        department: student.department,
        role: 'student'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: student.student_id,
        name: student.name,
        email: student.email,
        roll_number: student.roll_number,
        department: student.department,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

// Admin / Organizer Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Admin account not found.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrative password.' });
    }

    const token = jwt.sign(
      {
        id: admin.admin_id,
        email: admin.email,
        name: admin.name,
        role: admin.role // 'admin' or 'organizer'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Staff authentication successful!',
      token,
      user: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during admin login.' });
  }
};

// User Profile
exports.getProfile = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const [rows] = await db.query(
        'SELECT student_id, name, email, roll_number, department, created_at FROM students WHERE student_id = ?',
        [req.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
      return res.json({ success: true, user: { ...rows[0], role: 'student' } });
    } else {
      const [rows] = await db.query(
        'SELECT admin_id, name, email, role, created_at FROM admins WHERE admin_id = ?',
        [req.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Admin not found.' });
      return res.json({ success: true, user: rows[0] });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};
