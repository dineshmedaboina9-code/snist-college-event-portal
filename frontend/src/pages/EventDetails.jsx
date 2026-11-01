import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  ArrowLeft, 
  ShieldCheck, 
  QrCode, 
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import QRModal from '../components/QRModal';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data?.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      setErrorMsg('Event could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      alert('Only students can register for events.');
      return;
    }

    try {
      setRegistering(true);
      const res = await api.post('/registrations', { event_id: event.event_id });
      if (res.data?.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        await fetchEventDetails();
        setShowQRModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lilac py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="h-96 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!event || errorMsg) {
    return (
      <div className="min-h-screen bg-lilac py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-[#111439]">Event Not Found</h2>
          <p className="text-xs text-slate-500">The event you are looking for may have been removed or does not exist.</p>
          <Link to="/events" className="inline-flex items-center gap-2 text-xs font-bold text-[#635BFF] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Events Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.available_seats <= 0;
  const isRegistered = event.is_registered;
  const percentageFilled = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));

  return (
    <div className="min-h-screen bg-lilac py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back button */}
        <div>
          <Link 
            to="/events" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#111439] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Main Banner Header in Dark Blue (#111439) */}
        <div className="relative rounded-3xl overflow-hidden bg-[#111439] border border-indigo-950 shadow-xl">
          <img 
            src={event.banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'} 
            alt={event.event_name}
            className="w-full h-72 sm:h-96 object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111439] via-[#111439]/60 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold px-3.5 py-1 btn-stripe-gradient rounded-full shadow-sm">
                {event.category}
              </span>
              <span className="text-xs text-[#00D4FF] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                SNIST Campus Event
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {event.event_name}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00D4FF]" />
                {event.event_date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#635BFF]" />
                {event.event_time}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF3B8A]" />
                {event.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Details vs Registration Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Description & Overview on White */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#111439]">About the Event</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Organizer / College Department Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Organized by</h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#00D4FF] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                  SN
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#111439]">{event.creator_name || 'Department Event Coordinator'}</p>
                  <p className="text-slate-500">{event.creator_email || 'events@snist.edu.in'}</p>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white border border-[#635BFF]/20 rounded-3xl p-6 space-y-2.5 text-xs text-slate-700 shadow-sm">
              <div className="flex items-center gap-2 text-[#111439] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#635BFF]" />
                <span>Event Day Instructions</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                <li>Present your digital QR gate pass directly from your smartphone or printed card.</li>
                <li>Please arrive at the venue 15 minutes before the scheduled time ({event.event_time}).</li>
                <li>The QR scanner marks attendance once; duplicate check-ins at the gate are rejected.</li>
              </ul>
            </div>

          </div>

          {/* Right 1 Col: Pass & Registration Status Card */}
          <div className="space-y-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-lg space-y-5 sticky top-24">
              
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Seat Capacity</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-3xl font-black text-[#111439]">
                    {event.available_seats} <span className="text-xs font-semibold text-slate-500">remaining</span>
                  </span>
                  <span className="text-xs font-bold text-[#111439] bg-slate-100 px-3 py-1 rounded-full">
                    Total {event.capacity}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>{percentageFilled}% Booked</span>
                  <span>{event.registered_count || 0} Registered</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      percentageFilled >= 90 ? 'bg-[#FF3B8A]' : 'bg-gradient-to-r from-[#635BFF] to-[#00D4FF]'
                    }`}
                    style={{ width: `${percentageFilled}%` }}
                  />
                </div>
              </div>

              {/* Registration Action */}
              <div className="pt-2">
                {isRegistered ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-emerald-900">Pass Issued & Active</p>
                      <p className="text-[11px] text-emerald-700">Ready for entrance check-in.</p>
                    </div>

                    <button
                      onClick={() => setShowQRModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View / Download QR Pass</span>
                    </button>
                  </div>
                ) : isFull ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-rose-700">Capacity Full</p>
                    <p className="text-[11px] text-rose-500">No more seats are available for this session.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 btn-stripe-gradient font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{registering ? 'Securing Pass...' : 'Register for Event'}</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center font-medium">
                Instant digital confirmation & unique QR passport.
              </div>

            </div>
          </div>

        </div>

        {/* QR Modal */}
        {showQRModal && (
          <QRModal
            registration={{
              event_name: event.event_name,
              qr_token: event.user_registration?.qr_token || event.user_qr_token,
              event_date: event.event_date,
              event_time: event.event_time,
              venue: event.venue,
              is_attended: false
            }}
            onClose={() => setShowQRModal(false)}
          />
        )}

      </div>
    </div>
  );
}
