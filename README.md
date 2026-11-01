# College Event Management Portal (CEMP) – SNIST

> A centralized, full-stack web application designed for **Sreenidhi Institute of Science and Technology (SNIST)** to organize, publish, manage, and monitor college events with automated QR-code attendance verification.

---

## 🌟 Key Features

### 1. Student Module
* **Student Registration & Authentication**: Secure sign up with Roll Number, College Email, and Department (CSE, AI & DS, ECE, IT, EEE, Mechanical, Civil).
* **Interactive Event Catalog**: Filter by category (*AI & ML, Technical Symposiums, Hackathons, Cultural Fests, Sports, Guest Lectures*), search by keywords, and view real-time seat availability.
* **1-Click Registration**: Capacity-enforced registration with duplicate-prevention constraints.
* **Dynamic Digital QR Entry Passes**: Cryptographically unique pass tokens (`SNIST-XXXX-XXXX`) generated per event. View, download, or show directly on mobile.
* **Student Dashboard & Notification Center**: Live check-in attendance status, registration history, and event updates.

### 2. Admin Module
* **Executive Analytics Dashboard**: Real-time KPI metric cards (Total Events, Active Registrations, Verified Attendance, Turnout %).
* **Interactive Data Visualizations**: Built with Chart.js:
  * Department-wise student participation (bar chart)
  * Event category distribution (doughnut chart)
  * Real-time stream of recent student registrations
* **Event Management Console**: Full CRUD operations (Add, Edit, Delete events) with custom banner images, capacities, and venues.
* **Live Attendee Rosters**: Drill down into any event to see registered students and gate check-in status.

### 3. Event Organizer / Gatekeeper Module
* **Live Camera QR Scanner**: High-performance camera scanner using `html5-qrcode`.
* **Manual Token Fallback**: Instant token or roll number lookup when camera is unavailable.
* **Duplicate Prevention**: Immediate visual and auditory warning if a student pass was already used, showing the previous check-in timestamp and staff name.
* **Session Check-In Log**: Live counter and attendee feed at the gate.

---

## 🛠️ Technology Stack (100% Free Open-Source Tools)

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7, Axios, Lucide Icons, QRcode.react, Html5-qrcode, Chart.js |
| **Backend** | Node.js, Express.js, JWT (JSON Web Tokens), bcryptjs, UUIDv4, Nodemailer |
| **Database** | MySQL (Database: `college_event_portal`) with relational constraints and connection pooling |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **MySQL** (Running locally via Homebrew or standard MySQL server)

### 1. Start MySQL Server (macOS)
```bash
brew services start mysql
```

### 2. Seed Database
The seed script creates the database `college_event_portal`, builds the 6 relational tables, and populates initial SNIST events, admin staff, and sample student accounts:
```bash
npm run seed
```

### 3. Run Development Servers
Both frontend and backend can be run together:
```bash
npm run dev
```

Or run them in separate terminal windows:
* **Backend API**: `cd backend && npm start` (Runs on `http://localhost:5001`)
* **Frontend UI**: `cd frontend && npm run dev` (Runs on `http://localhost:3000`)

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Login Credentials

### Student Account:
* **Roll Number**: `23311A66A6`
* **Email**: `rahul@snist.edu.in`
* **Password**: `student123`
*(Or sign in as Priya: `23311A0501` / `student123`)*

### Administrator Account:
* **Email**: `admin@snist.edu.in`
* **Password**: `admin123`
* **Role**: Admin (Full access to event creation, analytics, and roster management)

### Gatekeeper / Organizer Account:
* **Email**: `organizer@snist.edu.in`
* **Password**: `organizer123`
* **Role**: Organizer (Direct access to the live QR gatekeeper scanner)

---

## 📂 Project Architecture

```
event manager/
├── backend/
│   ├── config/
│   │   └── database.js         # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Student & admin JWT authentication
│   │   ├── eventController.js  # CRUD operations & capacity calculations
│   │   ├── registrationController.js # QR token generation & pass tracking
│   │   ├── attendanceController.js   # QR verification & gate check-in
│   │   ├── dashboardController.js    # Aggregated KPI & department stats
│   │   └── notificationController.js # In-app notification center
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT validation & role enforcement
│   ├── routes/                 # REST API endpoints
│   ├── database/
│   │   └── seed.js             # Table setup & sample data seeder
│   ├── utils/
│   │   └── emailService.js     # Nodemailer integration
│   ├── .env                    # Environment configuration
│   └── server.js               # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation, role switcher & alerts
│   │   │   ├── Footer.jsx      # College branding & quick links
│   │   │   ├── EventCard.jsx   # Event item with capacity progress
│   │   │   └── QRModal.jsx     # Downloadable digital QR gate pass
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with live metrics
│   │   │   ├── Events.jsx      # Search & filter event catalog
│   │   │   ├── EventDetails.jsx# Detailed view & 1-click registration
│   │   │   ├── Login.jsx       # Student authentication
│   │   │   ├── Register.jsx    # Student account creation
│   │   │   ├── Dashboard.jsx   # My registrations & pass QR viewer
│   │   │   ├── AdminLogin.jsx  # Staff entrance portal
│   │   │   ├── AdminDashboard.jsx # Chart.js analytics & KPI cards
│   │   │   ├── EventManagement.jsx # Add/edit/delete events & rosters
│   │   │   └── AttendanceScanner.jsx # Gatekeeper camera QR scanner
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── services/
│   │   │   └── api.js          # Axios interceptor instance
│   │   ├── App.jsx             # React Router route definitions
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── package.json
```
