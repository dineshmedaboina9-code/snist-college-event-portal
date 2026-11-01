import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  LogOut, 
  QrCode, 
  LayoutDashboard, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, unreadNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#111439] text-white border-b border-indigo-950/80 shadow-lg shadow-[#111439]/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand with Stripe Gradient */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#635BFF] via-[#00D4FF] to-[#FF3B8A] p-[2px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#111439] rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#00D4FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight text-white">
                <span>SNIST</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#635BFF]/30 to-[#00D4FF]/30 text-[#00D4FF] border border-[#00D4FF]/40">
                  CEMP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Event Management Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link 
              to="/" 
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/') 
                  ? 'bg-white/10 text-[#00D4FF] shadow-inner' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/events') 
                  ? 'bg-white/10 text-[#00D4FF] shadow-inner' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse Events
            </Link>

            {user && user.role === 'student' && (
              <Link 
                to="/dashboard" 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard') 
                    ? 'bg-white/10 text-[#00D4FF] shadow-inner' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[#635BFF]" />
                <span>My Registrations</span>
              </Link>
            )}

            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive('/admin/dashboard') 
                      ? 'bg-white/10 text-[#00D4FF] shadow-inner' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#635BFF]" />
                  <span>Admin Panel</span>
                </Link>

                <Link 
                  to="/scanner" 
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive('/scanner') 
                      ? 'bg-gradient-to-r from-[#635BFF] to-[#00D4FF] text-white shadow-md' 
                      : 'text-emerald-400 hover:bg-white/5'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Gatekeeper</span>
                </Link>
              </>
            )}
          </div>

          {/* User actions / Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'student' && (
                  <Link 
                    to="/dashboard?tab=notifications" 
                    className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF3B8A] rounded-full ring-2 ring-[#111439] animate-pulse" />
                    )}
                  </Link>
                )}

                <div className="flex items-center gap-2.5 pl-3 border-l border-indigo-900/60">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#635BFF]/30 to-[#00D4FF]/30 text-[#00D4FF] border border-[#00D4FF]/30">
                      {user.role} {user.roll_number ? `• ${user.roll_number}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold btn-stripe-gradient rounded-xl shadow-md transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/login"
                  className="text-xs text-slate-400 hover:text-slate-200 border-l border-indigo-900/60 pl-3 py-1 flex items-center gap-1 transition"
                  title="Staff Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111439] border-b border-indigo-950 px-4 pt-2 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            Browse Events
          </Link>

          {user && user.role === 'student' && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#00D4FF] hover:bg-white/5"
            >
              My Registrations & QR Passes
            </Link>
          )}

          {user && (user.role === 'admin' || user.role === 'organizer') && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#00D4FF] hover:bg-white/5"
              >
                Admin Panel
              </Link>
              <Link
                to="/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-white/5"
              >
                QR Gatekeeper Scanner
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-indigo-950">
            {user ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-bold text-white bg-white/10 rounded-xl"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-bold btn-stripe-gradient rounded-xl"
                >
                  Register Account
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs text-amber-300"
                >
                  Staff / Admin Login →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
