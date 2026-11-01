import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import EventManagement from './pages/EventManagement';
import AttendanceScanner from './pages/AttendanceScanner';

// Protected Route for Students
const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route for Admin / Organizer
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading session...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-lilac text-darkblue antialiased selection:bg-stripe-purple selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Student Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <StudentRoute>
                    <Dashboard />
                  </StudentRoute>
                } 
              />

              {/* Admin & Organizer Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/events" 
                element={
                  <AdminRoute>
                    <EventManagement />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/scanner" 
                element={
                  <AdminRoute>
                    <AttendanceScanner />
                  </AdminRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
