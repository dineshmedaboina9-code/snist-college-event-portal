const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connecting to MySQL...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'college_event_portal'}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME || 'college_event_portal'}\`;`);

    console.log('Creating tables...');

    // 1. Students Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        student_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        roll_number VARCHAR(50) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Admins Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'organizer') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Events Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(180) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        venue VARCHAR(180) NOT NULL,
        capacity INT NOT NULL,
        banner_url VARCHAR(500) DEFAULT '',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admins(admin_id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 4. Registrations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        registration_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        event_id INT NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        qr_token VARCHAR(255) NOT NULL UNIQUE,
        status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
        UNIQUE KEY uq_student_event (student_id, event_id)
      ) ENGINE=InnoDB;
    `);

    // 5. Attendance Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        registration_id INT NOT NULL UNIQUE,
        event_id INT NOT NULL,
        check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        marked_by INT,
        FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES admins(admin_id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 6. Notifications Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        message TEXT NOT NULL,
        notification_type VARCHAR(50) DEFAULT 'GENERAL',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('Tables initialized. Checking seed data...');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const orgHash = await bcrypt.hash('organizer123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    // Seed Admins / Organizers
    const [existingAdmins] = await connection.query('SELECT COUNT(*) as count FROM admins');
    if (existingAdmins[0].count === 0) {
      await connection.query(`
        INSERT INTO admins (name, email, password, role) VALUES 
        ('Dr. K. Srinivas (Dean)', 'admin@snist.edu.in', ?, 'admin'),
        ('Prof. M. Anitha (Event Lead)', 'organizer@snist.edu.in', ?, 'organizer');
      `, [adminHash, orgHash]);
      console.log('Seeded Admins: admin@snist.edu.in / admin123, organizer@snist.edu.in / organizer123');
    }

    // Seed Students
    const [existingStudents] = await connection.query('SELECT COUNT(*) as count FROM students');
    if (existingStudents[0].count === 0) {
      await connection.query(`
        INSERT INTO students (name, email, roll_number, department, password) VALUES 
        ('Rahul Verma', 'rahul@snist.edu.in', '23311A66A6', 'AI & Data Science', ?),
        ('Priya Sharma', 'priya@snist.edu.in', '23311A0501', 'Computer Science & Engineering', ?),
        ('Karthik Reddy', 'karthik@snist.edu.in', '23311A0412', 'Electronics & Comm. Engg', ?),
        ('Sneha Rao', 'sneha@snist.edu.in', '23311A1208', 'Information Technology', ?),
        ('Vikram Teja', 'vikram@snist.edu.in', '23311A0325', 'Mechanical Engineering', ?);
      `, [studentHash, studentHash, studentHash, studentHash, studentHash]);
      console.log('Seeded 5 demo students with password: student123');
    }

    // Seed Events
    const [existingEvents] = await connection.query('SELECT COUNT(*) as count FROM events');
    if (existingEvents[0].count === 0) {
      await connection.query(`
        INSERT INTO events (event_name, description, category, event_date, event_time, venue, capacity, banner_url, created_by) VALUES 
        ('AI & Machine Learning Workshop', 'Hands-on immersion into deep learning, computer vision, and building LLM-powered applications using PyTorch & HuggingFace. Certificate included.', 'AI & ML', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00', 'Sreenidhi Central Seminar Hall 1', 120, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 1),
        ('Sreevision 2026 Technical Symposium', 'The premier annual national technical fest of SNIST! Featuring paper presentations, code sprints, robo-wars, and circuit debugging competitions.', 'Technical', DATE_ADD(CURDATE(), INTERVAL 12 DAY), '09:30:00', 'Campus Main Auditorium & Labs', 350, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', 1),
        ('24-Hour GenAI Campus Hackathon', 'Form a team of up to 4 to design, build, and pitch high-impact solutions for smart campuses, healthcare, and sustainability. Prize pool: ₹75,000.', 'Hackathon', DATE_ADD(CURDATE(), INTERVAL 18 DAY), '11:00:00', 'Innovation & Incubation Hub, SNIST', 80, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', 2),
        ('Rigolence Annual Cultural Fest', 'A vibrant celebration of music, street dance, battle of bands, theatrical drama, and fashion. Featuring live celebrity DJ night.', 'Cultural', DATE_ADD(CURDATE(), INTERVAL 25 DAY), '16:00:00', 'Open Air Amphitheatre', 500, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', 1),
        ('Inter-Department Sports League', 'Annual tournament featuring cricket, badminton, football, and chess championships across all college departments.', 'Sports', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '08:00:00', 'SNIST Sports Complex & Grounds', 200, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', 2),
        ('Cloud & DevOps Industry Keynote', 'Interactive technical session by senior architects from Google Cloud and AWS on microservices, Kubernetes, and continuous delivery.', 'Guest Lecture', DATE_ADD(CURDATE(), INTERVAL 15 DAY), '14:00:00', 'Mechanical Block Seminar Hall', 150, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 1);
      `);
      console.log('Seeded 6 SNIST campus events.');
    }

    // Seed Registrations & Attendance for demo
    const [existingRegs] = await connection.query('SELECT COUNT(*) as count FROM registrations');
    if (existingRegs[0].count === 0) {
      // Register Rahul (id 1) and Priya (id 2) to event 1 and event 2
      const token1 = 'QR-' + uuidv4().substring(0, 8).toUpperCase();
      const token2 = 'QR-' + uuidv4().substring(0, 8).toUpperCase();
      const token3 = 'QR-' + uuidv4().substring(0, 8).toUpperCase();
      const token4 = 'QR-' + uuidv4().substring(0, 8).toUpperCase();

      await connection.query(`
        INSERT INTO registrations (student_id, event_id, qr_token, status) VALUES 
        (1, 1, ?, 'CONFIRMED'),
        (1, 2, ?, 'CONFIRMED'),
        (2, 1, ?, 'CONFIRMED'),
        (3, 2, ?, 'CONFIRMED');
      `, [token1, token2, token3, token4]);

      // Seed 1 attendance for registration 1
      await connection.query(`
        INSERT INTO attendance (registration_id, event_id, marked_by) VALUES (1, 1, 2);
      `);

      // Seed Notifications
      await connection.query(`
        INSERT INTO notifications (student_id, message, notification_type) VALUES 
        (1, 'Registration confirmed for AI & Machine Learning Workshop! Present your QR code at the entrance.', 'REGISTRATION'),
        (1, 'Welcome to College Event Management Portal! Browse upcoming fests and workshops.', 'SYSTEM'),
        (2, 'Registration confirmed for AI & Machine Learning Workshop! Save your QR code.', 'REGISTRATION');
      `);

      console.log('Seeded initial registrations, attendance, and notifications.');
    }

    console.log('Database seeding complete successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await connection.end();
  }
}

seed();
