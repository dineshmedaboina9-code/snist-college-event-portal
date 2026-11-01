import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Zap, 
  Award, 
  ShieldCheck, 
  Compass, 
  Search
} from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import QRModal from '../components/QRModal';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events?upcoming=true');
      if (res.data?.success) {
        setFeaturedEvents(res.data.events.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching home events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20 bg-lilac">
      
      {/* Stripe-Inspired Hero Section in Dark Blue (#111439) with Color Mesh Gradients */}
      <section className="relative overflow-hidden bg-[#111439] text-white py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-950/60">
        
        {/* Dynamic Stripe Gradient Mesh Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#635BFF]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#00D4FF]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-[#FF3B8A]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Diagonal Stripe Background Geometry */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-7 z-10">
          
          {/* Badge with Gradient Border */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wide backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
            <span className="text-slate-300">Sreenidhi Institute of Science and Technology</span>
            <span className="text-[#00D4FF]">• Autonomous</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Next-Gen Campus Events & <br />
            <span className="text-gradient-stripe">
              Automated QR Passports
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Discover technical symposiums, hackathons, AI workshops, and cultural fests through one centralized platform. 1-click registration, digital QR credentials, and zero entrance wait times.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to="/events"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl btn-stripe-gradient font-bold text-sm shadow-xl transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Events</span>
            </Link>

            {user?.role === 'student' ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition"
              >
                <QrCode className="w-4 h-4 text-[#00D4FF]" />
                <span>My Registered Passes</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition"
              >
                <span>Student Sign Up</span>
                <ArrowRight className="w-4 h-4 text-[#00D4FF]" />
              </Link>
            )}
          </div>

          {/* Metric Bar in Dark Blue with Color Gradient Accents */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10 mt-12">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-white">6+</p>
              <p className="text-xs text-slate-400 mt-0.5">Upcoming Campus Events</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#00D4FF]">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Automated Gate Verification</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#635BFF]">7</p>
              <p className="text-xs text-slate-400 mt-0.5">SNIST Engineering Branches</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#FF3B8A]">0s</p>
              <p className="text-xs text-slate-400 mt-0.5">Duplicate Gate Entries</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3-Step Flow on White Lilac Canvas (#F8F8F9) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold tracking-wider text-[#635BFF] uppercase">Streamlined Experience</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111439] tracking-tight mt-1">How CEMP Operates</h2>
          <p className="text-sm text-slate-600 mt-2">
            Engineered to replace fragmented WhatsApp posters and Google Forms with a single unified portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#635BFF]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#635BFF]/10 to-[#635BFF]/20 text-[#635BFF] flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-base font-bold text-[#111439] mb-2">Discover & 1-Click Register</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log in with your SNIST roll number, browse workshops, technical competitions, and fests with real-time seat availability.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#00D4FF]/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D4FF]/10 to-[#00D4FF]/25 text-[#0072ff] flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-base font-bold text-[#111439] mb-2">Instant Dynamic QR Pass</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a unique, cryptographically-generated QR token stored in your dashboard and emailed directly to your college account.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#FF3B8A]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF3B8A]/10 to-[#FF3B8A]/20 text-[#FF3B8A] flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-base font-bold text-[#111439] mb-2">Automated Entrance Scan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Show your QR pass at the entrance. Organizers scan it using the gatekeeper scanner, instantly blocking duplicates and logging attendance.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-wider text-[#635BFF] uppercase">Upcoming Schedule</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111439] tracking-tight mt-1">Featured Campus Events</h2>
            <p className="text-xs sm:text-sm text-slate-500">Live capacity counters updated in real-time.</p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#635BFF] hover:text-[#4F46E5] bg-white border border-slate-200 hover:border-[#635BFF]/30 px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <span>View All ({featuredEvents.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white rounded-3xl border border-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-sm">No upcoming events scheduled right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.event_id}
                event={event}
                onRegisterSuccess={fetchEvents}
                onOpenQR={(e) => setSelectedQR({
                  event_name: e.event_name,
                  qr_token: e.user_qr_token,
                  event_date: e.event_date,
                  event_time: e.event_time,
                  venue: e.venue
                })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Multi-disciplinary Section in Dark Blue (#111439) with Gradient Ribbons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111439] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-indigo-950">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00D4FF]/20 via-[#635BFF]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#00D4FF]">Multi-Disciplinary Innovation</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              One Synchronized Portal for All Engineering Branches
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              From Artificial Intelligence & Machine Learning Symposiums to Roborace hackathons and cultural festivals — SNIST departments coordinate seamlessly.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['AI & Data Science', 'Computer Science (CSE)', 'Electronics & Comm (ECE)', 'Information Tech (IT)', 'Mechanical', 'Electrical (EEE)', 'Civil'].map((dept) => (
                <span key={dept} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold text-slate-200 border border-white/10">
                  {dept}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      {selectedQR && (
        <QRModal
          registration={selectedQR}
          onClose={() => setSelectedQR(null)}
        />
      )}

    </div>
  );
}
