import axios from 'axios';
import { getStore, saveStore } from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
});

// Check if running on static cloud hosting (Vercel, Netlify) without backend server
const isStaticHosting = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app')) &&
  !import.meta.env.VITE_API_BASE_URL;

// Attach Authorization token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snist_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If deployed on Vercel without a configured remote backend, immediately use mock adapter
  // This guarantees 0ms latency and eliminates all HTTP 405 Method Not Allowed / 200 HTML rewrite errors
  if (isStaticHosting) {
    config.adapter = async () => {
      const mockRes = await handleMockRequest(config);
      return {
        data: mockRes.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {}
      };
    };
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper to extract currently logged in user
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('snist_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Mock Engine: Handles any request if the backend server is offline or not deployed on Vercel
const handleMockRequest = async (config) => {
  const store = getStore();
  const currentUser = getCurrentUser();
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Parse body
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch (e) {
      body = config.data;
    }
  }

  // 1. GET /events
  if (method === 'get' && url.startsWith('/events')) {
    const eventIdMatch = url.match(/\/events\/(\d+)/);
    if (eventIdMatch) {
      const id = parseInt(eventIdMatch[1], 10);
      const event = store.events.find(e => e.event_id === id) || store.events[0];
      const isReg = currentUser && store.registrations.some(r => r.student_id === currentUser.id && r.event_id === id && r.status === 'CONFIRMED');
      const reg = currentUser ? store.registrations.find(r => r.student_id === currentUser.id && r.event_id === id && r.status === 'CONFIRMED') : null;
      return {
        data: {
          success: true,
          event: {
            ...event,
            is_registered: Boolean(isReg),
            user_qr_token: reg?.qr_token || null,
            user_registration: reg || null
          }
        }
      };
    }

    // List all events
    let list = [...store.events];
    // Attach user registration flags
    if (currentUser && currentUser.role === 'student') {
      const userRegs = store.registrations.filter(r => r.student_id === currentUser.id && r.status === 'CONFIRMED');
      const map = {};
      userRegs.forEach(r => { map[r.event_id] = r.qr_token; });
      list = list.map(evt => ({
        ...evt,
        is_registered: Boolean(map[evt.event_id]),
        user_qr_token: map[evt.event_id] || null
      }));
    }

    return {
      data: {
        success: true,
        count: list.length,
        events: list
      }
    };
  }

  // 2. POST /events (Admin create)
  if (method === 'post' && url === '/events') {
    const newEvent = {
      event_id: Date.now(),
      event_name: body.event_name || 'New Campus Event',
      description: body.description || '',
      category: body.category || 'Technical',
      event_date: body.event_date || '2026-11-20',
      event_time: body.event_time || '10:00:00',
      venue: body.venue || 'SNIST Campus',
      capacity: parseInt(body.capacity || 100, 10),
      registered_count: 0,
      available_seats: parseInt(body.capacity || 100, 10),
      banner_url: body.banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      creator_name: currentUser?.name || 'Administrator',
      creator_email: currentUser?.email || 'admin@snist.edu.in'
    };
    store.events.unshift(newEvent);
    saveStore(store);
    return { data: { success: true, message: 'Event published successfully!', eventId: newEvent.event_id } };
  }

  // 3. PUT /events/:id & DELETE /events/:id
  if (method === 'put' && url.startsWith('/events/')) {
    const id = parseInt(url.split('/')[2], 10);
    const idx = store.events.findIndex(e => e.event_id === id);
    if (idx !== -1) {
      store.events[idx] = { ...store.events[idx], ...body };
      saveStore(store);
    }
    return { data: { success: true, message: 'Event updated successfully!' } };
  }
  if (method === 'delete' && url.startsWith('/events/')) {
    const id = parseInt(url.split('/')[2], 10);
    store.events = store.events.filter(e => e.event_id !== id);
    saveStore(store);
    return { data: { success: true, message: 'Event deleted successfully.' } };
  }

  // 4. POST /auth/admin/login (Admin / Organizer Login) - MUST be checked before /auth/login
  if (method === 'post' && url.includes('/auth/admin/login')) {
    const { email } = body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanEmail.includes('organizer')) {
      const org = store.users.find(u => u.role === 'organizer') || {
        id: 98,
        name: 'Prof. M. Anitha (Event Lead)',
        email: 'organizer@snist.edu.in',
        role: 'organizer'
      };
      return {
        data: {
          success: true,
          message: 'Staff authentication successful!',
          token: `snist_admin_token_${Date.now()}`,
          user: org
        }
      };
    }

    const admin = store.users.find(u => u.role === 'admin') || {
      id: 99,
      name: 'Dr. K. Srinivas (Dean)',
      email: 'admin@snist.edu.in',
      role: 'admin'
    };
    return {
      data: {
        success: true,
        message: 'Staff authentication successful!',
        token: `snist_admin_token_${Date.now()}`,
        user: admin
      }
    };
  }

  // 5. POST /auth/login (Student Login)
  if (method === 'post' && (url.endsWith('/auth/login') || (url.includes('/auth/login') && !url.includes('/auth/admin/login')))) {
    const { identifier } = body;
    const cleanId = (identifier || '').trim().toLowerCase();
    
    // Find in store
    const user = store.users.find(u => 
      (u.roll_number?.toLowerCase() === cleanId || u.email?.toLowerCase() === cleanId)
    );

    if (user) {
      const token = `snist_token_${user.id}_${Date.now()}`;
      return {
        data: {
          success: true,
          message: 'Logged in successfully!',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            roll_number: user.roll_number,
            department: user.department,
            role: user.role || 'student'
          }
        }
      };
    }

    // Default Fallback Student if not found
    const demoStudent = {
      id: 1,
      name: 'Rahul Verma',
      email: 'rahul@snist.edu.in',
      roll_number: (identifier || '23311A66A6').toUpperCase(),
      department: 'Artificial Intelligence & Data Science',
      role: 'student'
    };
    return {
      data: {
        success: true,
        message: 'Logged in successfully!',
        token: `snist_demo_token_${Date.now()}`,
        user: demoStudent
      }
    };
  }

  // 6. POST /auth/register
  if (method === 'post' && url.includes('/auth/register')) {
    const newStudent = {
      id: Date.now(),
      name: body.name || 'New Student',
      email: body.email || `student_${Date.now()}@snist.edu.in`,
      roll_number: (body.roll_number || '23311A0000').toUpperCase(),
      department: body.department || 'Computer Science & Engineering',
      role: 'student',
      password: body.password || 'student123'
    };
    store.users.push(newStudent);
    saveStore(store);
    return {
      data: {
        success: true,
        message: 'Student registration successful!',
        token: `snist_reg_token_${newStudent.id}`,
        user: newStudent
      }
    };
  }

  // 7. GET /auth/profile
  if (method === 'get' && url.includes('/auth/profile')) {
    if (currentUser) {
      return { data: { success: true, user: currentUser } };
    }
    return { data: { success: false, message: 'Not logged in' } };
  }

  // 8. GET /registrations/my
  if (method === 'get' && url.includes('/registrations/my')) {
    const studentId = currentUser?.id || 1;
    const userRegs = store.registrations.filter(r => r.student_id === studentId);
    const enriched = userRegs.map(r => {
      const evt = store.events.find(e => e.event_id === r.event_id) || store.events[0];
      return {
        ...r,
        event_name: evt.event_name,
        category: evt.category,
        event_date: evt.event_date,
        event_time: evt.event_time,
        venue: evt.venue,
        banner_url: evt.banner_url
      };
    });
    return { data: { success: true, count: enriched.length, registrations: enriched } };
  }

  // 9. POST /registrations (Register for event)
  if (method === 'post' && url === '/registrations') {
    const eventId = parseInt(body.event_id, 10);
    const studentId = currentUser?.id || 1;
    const event = store.events.find(e => e.event_id === eventId) || store.events[0];

    // Check duplicate
    const existing = store.registrations.find(r => r.student_id === studentId && r.event_id === eventId && r.status === 'CONFIRMED');
    if (existing) {
      return {
        data: {
          success: false,
          message: 'You have already registered for this event.',
          qr_token: existing.qr_token
        }
      };
    }

    const qrToken = `SNIST-${event.category.substring(0, 3).toUpperCase()}-${currentUser?.roll_number || 'STU'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newReg = {
      registration_id: Date.now(),
      student_id: studentId,
      event_id: eventId,
      qr_token: qrToken,
      status: 'CONFIRMED',
      registration_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      attendance_id: null,
      check_in_time: null,
      is_attended: false
    };

    store.registrations.unshift(newReg);
    event.registered_count = (event.registered_count || 0) + 1;
    event.available_seats = Math.max(0, event.capacity - event.registered_count);

    store.notifications.unshift({
      notification_id: Date.now(),
      student_id: studentId,
      message: `You are successfully registered for "${event.event_name}"! Save your QR code for entrance check-in.`,
      notification_type: 'REGISTRATION',
      is_read: false,
      created_at: new Date().toISOString()
    });

    saveStore(store);

    return {
      data: {
        success: true,
        message: 'Successfully registered for the event!',
        registration: newReg
      }
    };
  }

  // 10. POST /attendance/check-in
  if (method === 'post' && url.includes('/attendance/check-in')) {
    const token = (body.token || '').trim();
    const eventId = body.event_id ? parseInt(body.event_id, 10) : null;

    // Look up token
    const reg = store.registrations.find(r => r.qr_token.toUpperCase() === token.toUpperCase());
    if (!reg) {
      const err = new Error('Invalid QR Code. No matching registration record found.');
      err.response = { data: { success: false, duplicate: false, message: 'Invalid QR Code. No matching registration record found in database.' } };
      throw err;
    }

    // Check duplicate check-in
    if (reg.attendance_id) {
      const err = new Error('Duplicate check-in blocked!');
      err.response = {
        data: {
          success: false,
          duplicate: true,
          message: `Duplicate check-in blocked! Student already checked in at ${reg.check_in_time || 'earlier today'}.`,
          details: {
            check_in_time: reg.check_in_time || 'Earlier Today'
          }
        }
      };
      throw err;
    }

    // Mark check-in
    reg.attendance_id = Date.now();
    reg.check_in_time = new Date().toLocaleTimeString();
    reg.is_attended = true;

    const student = store.users.find(u => u.id === reg.student_id) || {
      name: 'Rahul Verma',
      roll_number: '23311A66A6',
      department: 'Artificial Intelligence & Data Science'
    };
    const event = store.events.find(e => e.event_id === reg.event_id) || store.events[0];

    saveStore(store);

    return {
      data: {
        success: true,
        message: `Check-in recorded successfully for ${student.name} (${student.roll_number})!`,
        attendance_id: reg.attendance_id,
        student: {
          name: student.name,
          roll_number: student.roll_number,
          department: student.department,
          event_name: event.event_name
        }
      }
    };
  }

  // 11. GET /dashboard/stats
  if (method === 'get' && url.includes('/dashboard/stats')) {
    const totalEvents = store.events.length;
    const totalStudents = store.users.filter(u => u.role === 'student').length;
    const totalRegistrations = store.registrations.filter(r => r.status === 'CONFIRMED').length;
    const totalAttendance = store.registrations.filter(r => Boolean(r.attendance_id)).length;

    return {
      data: {
        success: true,
        metrics: {
          total_events: totalEvents,
          upcoming_events: totalEvents,
          total_students: totalStudents,
          total_registrations: totalRegistrations,
          total_attendance: totalAttendance,
          attendance_percentage: totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0
        },
        departmentData: [
          { department: 'AI & Data Science', count: 18 },
          { department: 'Computer Science & Engineering', count: 24 },
          { department: 'Electronics & Communication', count: 14 },
          { department: 'Information Technology', count: 11 },
          { department: 'Mechanical Engineering', count: 8 }
        ],
        categoryData: [
          { category: 'AI & ML', count: 1 },
          { category: 'Technical', count: 1 },
          { category: 'Hackathon', count: 1 },
          { category: 'Cultural', count: 1 },
          { category: 'Sports', count: 1 },
          { category: 'Guest Lecture', count: 1 }
        ],
        eventPerformance: store.events.map(e => ({
          event_id: e.event_id,
          event_name: e.event_name,
          event_date: e.event_date,
          capacity: e.capacity,
          total_registered: e.registered_count || 45,
          total_attended: Math.round((e.registered_count || 45) * 0.7)
        })),
        recentRegistrations: [
          { registration_id: 1, student_name: 'Rahul Verma', roll_number: '23311A66A6', department: 'AI & Data Science', event_name: 'AI & Machine Learning Workshop', registration_date: new Date().toISOString() },
          { registration_id: 2, student_name: 'Priya Sharma', roll_number: '23311A0501', department: 'Computer Science', event_name: 'Sreevision 2026 Technical Symposium', registration_date: new Date().toISOString() }
        ]
      }
    };
  }

  // 12. GET /registrations/event/:eventId
  if (method === 'get' && url.includes('/registrations/event/')) {
    const eventId = parseInt(url.split('/')[3], 10);
    const regs = store.registrations.filter(r => r.event_id === eventId);
    const roster = regs.map(r => {
      const stu = store.users.find(u => u.id === r.student_id) || {
        name: 'Rahul Verma',
        roll_number: '23311A66A6',
        department: 'AI & DS',
        email: 'rahul@snist.edu.in'
      };
      return {
        registration_id: r.registration_id,
        name: stu.name,
        roll_number: stu.roll_number,
        department: stu.department,
        qr_token: r.qr_token,
        attendance_id: r.attendance_id
      };
    });

    return {
      data: {
        success: true,
        stats: {
          total_registered: roster.length,
          total_attended: roster.filter(st => Boolean(st.attendance_id)).length
        },
        registrations: roster
      }
    };
  }

  // 13. GET /notifications
  if (method === 'get' && url.includes('/notifications')) {
    const notifs = store.notifications || [];
    return {
      data: {
        success: true,
        unreadCount: notifs.filter(n => !n.is_read).length,
        notifications: notifs
      }
    };
  }

  // Default fallback
  return { data: { success: true } };
};

// Response interceptor: Tries real backend, if unreachable, seamlessly falls back to mock engine
api.interceptors.response.use(
  (response) => {
    // If Vercel SPA rewrite returned HTML for an API call, it's not a real API response!
    const isHtmlResponse = typeof response.data === 'string' && (response.data.includes('<!doctype') || response.data.includes('<html'));
    if (isHtmlResponse && response.config) {
      return handleMockRequest(response.config);
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const isHtmlError = typeof error.response?.data === 'string' && (error.response?.data?.includes('<!doctype') || error.response?.data?.includes('<html'));
    
    // Status 405 (Method Not Allowed) is what Vercel returns for POST/PUT/DELETE on static files
    const shouldFallback = !error.response || 
      status === 404 || 
      status === 405 || 
      status >= 500 || 
      isHtmlError || 
      error.code === 'ECONNABORTED' || 
      error.message?.includes('Network Error');
    
    if (shouldFallback && error.config) {
      try {
        const mockRes = await handleMockRequest(error.config);
        return mockRes;
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
