import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function EventCard({ event, onRegisterSuccess, onOpenQR }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isFull = event.available_seats <= 0;
  const isRegistered = event.is_registered;

  const categoryStyles = {
    'AI & ML': 'bg-gradient-to-r from-[#635BFF]/15 to-[#8B5CF6]/15 text-[#635BFF] border-[#635BFF]/30',
    'Technical': 'bg-gradient-to-r from-[#00D4FF]/15 to-[#0284C7]/15 text-[#0284C7] border-[#00D4FF]/30',
    'Hackathon': 'bg-gradient-to-r from-[#10B981]/15 to-[#059669]/15 text-[#059669] border-[#10B981]/30',
    'Cultural': 'bg-gradient-to-r from-[#FF3B8A]/15 to-[#EC4899]/15 text-[#FF3B8A] border-[#FF3B8A]/30',
    'Sports': 'bg-gradient-to-r from-[#F59E0B]/15 to-[#D97706]/15 text-[#D97706] border-[#F59E0B]/30',
    'Guest Lecture': 'bg-gradient-to-r from-[#4F46E5]/15 to-[#3730A3]/15 text-[#4F46E5] border-[#4F46E5]/30'
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      alert('Only students can register for events.');
      return;
    }

    try {
      const res = await api.post('/registrations', { event_id: event.event_id });
      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        if (onRegisterSuccess) onRegisterSuccess(res.data.registration);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const percentageFilled = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#635BFF]/30 transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Banner Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img 
          src={event.banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'} 
          alt={event.event_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111439]/70 via-transparent to-transparent" />
        
        {/* Category Pill with Gradient Tint */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full border shadow-sm backdrop-blur-md ${categoryStyles[event.category] || 'bg-white text-slate-700 border-slate-200'}`}>
          {event.category}
        </span>

        {/* Date Pill in Dark Blue (#111439) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-[#111439]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-[#111439] group-hover:text-[#635BFF] transition-colors line-clamp-1 mb-1.5">
            <Link to={`/events/${event.event_id}`}>
              {event.event_name}
            </Link>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#635BFF] shrink-0" />
              <span>{event.event_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity Bar & Action */}
        <div>
          <div className="mb-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1 text-[#111439]">
                <Users className="w-3 h-3 text-[#635BFF]" />
                <span>Seats Filled</span>
              </span>
              <span>{event.registered_count || 0} / {event.capacity} ({percentageFilled}%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  percentageFilled >= 90 
                    ? 'bg-[#FF3B8A]' 
                    : percentageFilled >= 60 
                    ? 'bg-amber-500' 
                    : 'bg-gradient-to-r from-[#635BFF] to-[#00D4FF]'
                }`}
                style={{ width: `${percentageFilled}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {isRegistered ? (
              <button
                onClick={() => onOpenQR && onOpenQR(event)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Pass Issued • View QR</span>
              </button>
            ) : isFull ? (
              <button 
                disabled 
                className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
              >
                Registration Closed (Full)
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={handleQuickRegister}
                  className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl btn-stripe-gradient shadow-sm transition"
                >
                  Register
                </button>
                <Link
                  to={`/events/${event.event_id}`}
                  className="p-2.5 text-[#111439] hover:text-[#635BFF] hover:bg-slate-100 rounded-xl transition border border-slate-200"
                  title="View Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
