// Resilient Mock Store for Vercel & Offline Deployments
// Ensures events are ALWAYS visible and demo logins ALWAYS work.

const INITIAL_EVENTS = [
  {
    event_id: 1,
    event_name: 'AI & Machine Learning Workshop',
    description: 'Hands-on immersion into deep learning, computer vision, and building LLM-powered applications using PyTorch & HuggingFace. Certificate included.',
    category: 'AI & ML',
    event_date: '2026-11-10',
    event_time: '10:00:00',
    venue: 'Sreenidhi Central Seminar Hall 1',
    capacity: 120,
    registered_count: 85,
    available_seats: 35,
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    creator_name: 'Dr. K. Srinivas (Dean)',
    creator_email: 'admin@snist.edu.in'
  },
  {
    event_id: 2,
    event_name: 'Sreevision 2026 Technical Symposium',
    description: 'The premier annual national technical fest of SNIST! Featuring paper presentations, code sprints, robo-wars, and circuit debugging competitions.',
    category: 'Technical',
    event_date: '2026-11-15',
    event_time: '09:30:00',
    venue: 'Campus Main Auditorium & Labs',
    capacity: 350,
    registered_count: 240,
    available_seats: 110,
    banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    creator_name: 'Dr. K. Srinivas (Dean)',
    creator_email: 'admin@snist.edu.in'
  },
  {
    event_id: 3,
    event_name: '24-Hour GenAI Campus Hackathon',
    description: 'Form a team of up to 4 to design, build, and pitch high-impact solutions for smart campuses, healthcare, and sustainability. Prize pool: ₹75,000.',
    category: 'Hackathon',
    event_date: '2026-11-20',
    event_time: '11:00:00',
    venue: 'Innovation & Incubation Hub, SNIST',
    capacity: 80,
    registered_count: 62,
    available_seats: 18,
    banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    creator_name: 'Prof. M. Anitha (Event Lead)',
    creator_email: 'organizer@snist.edu.in'
  },
  {
    event_id: 4,
    event_name: 'Rigolence Annual Cultural Fest',
    description: 'A vibrant celebration of music, street dance, battle of bands, theatrical drama, and fashion. Featuring live celebrity DJ night.',
    category: 'Cultural',
    event_date: '2026-11-28',
    event_time: '16:00:00',
    venue: 'Open Air Amphitheatre',
    capacity: 500,
    registered_count: 410,
    available_seats: 90,
    banner_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    creator_name: 'Dr. K. Srinivas (Dean)',
    creator_email: 'admin@snist.edu.in'
  },
  {
    event_id: 5,
    event_name: 'Inter-Department Sports League',
    description: 'Annual tournament featuring cricket, badminton, football, and chess championships across all college departments.',
    category: 'Sports',
    event_date: '2026-11-12',
    event_time: '08:00:00',
    venue: 'SNIST Sports Complex & Grounds',
    capacity: 200,
    registered_count: 165,
    available_seats: 35,
    banner_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    creator_name: 'Prof. M. Anitha (Event Lead)',
    creator_email: 'organizer@snist.edu.in'
  },
  {
    event_id: 6,
    event_name: 'Cloud & DevOps Industry Keynote',
    description: 'Interactive technical session by senior architects from Google Cloud and AWS on microservices, Kubernetes, and continuous delivery.',
    category: 'Guest Lecture',
    event_date: '2026-11-18',
    event_time: '14:00:00',
    venue: 'Mechanical Block Seminar Hall',
    capacity: 150,
    registered_count: 98,
    available_seats: 52,
    banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    creator_name: 'Dr. K. Srinivas (Dean)',
    creator_email: 'admin@snist.edu.in'
  }
];

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Rahul Verma',
    email: 'rahul@snist.edu.in',
    roll_number: '23311A66A6',
    department: 'Artificial Intelligence & Data Science',
    role: 'student',
    password: 'student123'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@snist.edu.in',
    roll_number: '23311A0501',
    department: 'Computer Science & Engineering',
    role: 'student',
    password: 'student123'
  },
  {
    id: 99,
    name: 'Dr. K. Srinivas (Dean)',
    email: 'admin@snist.edu.in',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: 98,
    name: 'Prof. M. Anitha (Event Lead)',
    email: 'organizer@snist.edu.in',
    role: 'organizer',
    password: 'organizer123'
  }
];

const INITIAL_REGISTRATIONS = [
  {
    registration_id: 101,
    student_id: 1,
    event_id: 1,
    qr_token: 'SNIST-AI-23311A66A6-9X4F',
    status: 'CONFIRMED',
    registration_date: '2026-11-01 10:30:00',
    attendance_id: 501,
    check_in_time: '2026-11-01 10:45:00',
    is_attended: true
  },
  {
    registration_id: 102,
    student_id: 1,
    event_id: 2,
    qr_token: 'SNIST-SREE-23311A66A6-7M2K',
    status: 'CONFIRMED',
    registration_date: '2026-11-02 14:15:00',
    attendance_id: null,
    check_in_time: null,
    is_attended: false
  }
];

export const getStore = () => {
  let store = null;
  try {
    const raw = localStorage.getItem('snist_cemp_mock_db');
    if (raw) store = JSON.parse(raw);
  } catch (e) {
    // fallback
  }

  if (!store || !store.events || store.events.length === 0) {
    store = {
      events: INITIAL_EVENTS,
      users: INITIAL_USERS,
      registrations: INITIAL_REGISTRATIONS,
      notifications: [
        {
          notification_id: 1,
          student_id: 1,
          message: 'Registration confirmed for AI & Machine Learning Workshop! Present your QR code at the entrance.',
          notification_type: 'REGISTRATION',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          notification_id: 2,
          student_id: 1,
          message: 'Welcome to the SNIST College Event Portal! Discover, register, and attend campus events.',
          notification_type: 'SYSTEM',
          is_read: true,
          created_at: new Date().toISOString()
        }
      ]
    };
    saveStore(store);
  }
  return store;
};

export const saveStore = (store) => {
  try {
    localStorage.setItem('snist_cemp_mock_db', JSON.stringify(store));
  } catch (e) {
    // ignore
  }
};
