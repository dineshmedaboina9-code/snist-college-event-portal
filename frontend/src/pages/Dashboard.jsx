import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import QRModal from '../components/QRModal';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle, 
  Clock3, 
  Bell, 
  XCircle, 
  Compass, 
  AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, fetchNotifications } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'registrations';

  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchRegistrations();
    fetchStudentNotifications();
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my');
      if (res.data?.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;
    try {
      const res = await api.delete(`/registrations/${regId}`);
      if (res.data.success) {
        fetchRegistrations();
        fetchStudentNotifications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      fetchStudentNotifications();
      if (fetchNotifications) fetchNotifications();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-lilac py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Student Profile Header in Dark Blue (#111439) with Stripe Gradient Accents */}
        <div className="bg-[#111439] rounded-3xl p-6 sm:p-9 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-950 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00D4FF]/20 via-[#635BFF]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#635BFF] via-[#00D4FF] to-[#FF3B8A] p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#111439] rounded-[14px] flex items-center justify-center font-black text-2xl text-white">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name}</h1>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#635BFF]/30 to-[#00D4FF]/30 text-[#00D4FF] border border-[#00D4FF]/30">
                  SNIST Student
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap gap-2 font-medium">
                <span><strong>Roll:</strong> {user?.roll_number}</span>
                <span>•</span>
                <span><strong>Branch:</strong> {user?.department}</span>
                <span>•</span>
                <span className="text-slate-400">{user?.email}</span>
              </p>
            </div>
          </div>

          <Link
            to="/events"
            className="relative z-10 inline-flex items-center gap-2 px-5 py-3 btn-stripe-gradient text-xs font-bold rounded-xl shadow-md transition self-start md:self-auto"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Events</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => { setSearchParams({ tab: 'registrations' }); }}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'registrations'
                ? 'border-[#635BFF] text-[#635BFF]'
                : 'border-transparent text-slate-500 hover:text-[#111439]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Registrations & Passes ({registrations.length})</span>
          </button>

          <button
            onClick={() => { setSearchParams({ tab: 'notifications' }); }}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'notifications'
                ? 'border-[#635BFF] text-[#635BFF]'
                : 'border-transparent text-slate-500 hover:text-[#111439]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications ({notifications.filter(n => !n.is_read).length})</span>
          </button>
        </div>

        {/* Tab 1: Registrations */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm">
                <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-[#111439]">No event registrations yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Explore upcoming technical symposiums, hackathons, and workshops to claim your digital QR pass.
                </p>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-5 py-2.5 btn-stripe-gradient text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  <span>Browse Upcoming Events</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {registrations.map((reg) => (
                  <div
                    key={reg.registration_id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#635BFF]/30 transition-all p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
                          {reg.category}
                        </span>
                        <h3 className="text-base font-bold text-[#111439] mt-1.5 line-clamp-1">
                          {reg.event_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#635BFF]" />
                            {reg.event_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
                            {reg.event_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#FF3B8A]" />
                            <span className="truncate max-w-[150px]">{reg.venue}</span>
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      {reg.is_attended ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          <Clock3 className="w-3 h-3 text-amber-600" />
                          <span>Pass Active</span>
                        </span>
                      )}
                    </div>

                    {/* Pass code token and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Pass Token</span>
                        <code className="font-mono font-bold text-[#111439]">{reg.qr_token}</code>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQR(reg)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 btn-stripe-gradient text-xs font-bold rounded-xl shadow-sm transition"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Open Pass QR</span>
                        </button>

                        {!reg.is_attended && (
                          <button
                            onClick={() => handleCancelRegistration(reg.registration_id)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition"
                            title="Cancel Registration"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#111439] text-sm">System & Event Alerts</h3>
              {notifications.some(n => !n.is_read) && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#635BFF] hover:underline font-bold"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No notifications at this time.</p>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.notification_id}
                    className={`p-4 rounded-2xl text-xs flex items-start gap-3 transition ${
                      n.is_read ? 'bg-slate-50 text-slate-600' : 'bg-gradient-to-r from-[#635BFF]/10 to-[#00D4FF]/10 border border-[#635BFF]/20 text-[#111439] font-medium'
                    }`}
                  >
                    <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${n.is_read ? 'text-slate-400' : 'text-[#635BFF]'}`} />
                    <div className="flex-1">
                      <p>{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QR Modal */}
        {selectedQR && (
          <QRModal
            registration={selectedQR}
            onClose={() => setSelectedQR(null)}
          />
        )}

      </div>
    </div>
  );
}
