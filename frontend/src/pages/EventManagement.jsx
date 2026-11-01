import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Search 
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = ['AI & ML', 'Technical', 'Hackathon', 'Cultural', 'Sports', 'Guest Lecture', 'Workshop'];

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Attendee Roster Modal
  const [rosterEvent, setRosterEvent] = useState(null);
  const [rosterList, setRosterList] = useState([]);
  const [rosterStats, setRosterStats] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    category: CATEGORIES[0],
    event_date: '',
    event_time: '10:00',
    venue: '',
    capacity: 100,
    banner_url: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data?.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      event_name: '',
      description: '',
      category: CATEGORIES[0],
      event_date: new Date().toISOString().split('T')[0],
      event_time: '10:00',
      venue: '',
      capacity: 100,
      banner_url: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      event_name: evt.event_name,
      description: evt.description,
      category: evt.category,
      event_date: evt.event_date ? evt.event_date.split('T')[0] : '',
      event_time: evt.event_time,
      venue: evt.venue,
      capacity: evt.capacity,
      banner_url: evt.banner_url || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.event_id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove registrations.')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleOpenRoster = async (evt) => {
    setRosterEvent(evt);
    setRosterLoading(true);
    try {
      const res = await api.get(`/registrations/event/${evt.event_id}`);
      if (res.data?.success) {
        setRosterList(res.data.registrations);
        setRosterStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lilac py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111439] tracking-tight">Event Management Console</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Publish new events, modify details, monitor registration rosters and attendance.</p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-3 btn-stripe-gradient font-bold text-xs rounded-xl shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Event</span>
          </button>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#111439] text-white text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Event Name</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Venue</th>
                  <th className="py-3.5 px-5 text-center">Registrations</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">Loading events...</td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No events found. Click "Add New Event" to publish one.</td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.event_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5 font-bold text-[#111439] max-w-xs truncate">
                        {evt.event_name}
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-600">
                        <div className="font-semibold text-[#111439]">{evt.event_date}</div>
                        <div className="text-[10px] text-slate-400">{evt.event_time}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 truncate max-w-[160px]">
                        {evt.venue}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className="font-extrabold text-[#635BFF]">{evt.registered_count || 0}</span> / {evt.capacity}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenRoster(evt)}
                          className="p-2 text-[#635BFF] hover:bg-[#635BFF]/10 rounded-xl transition"
                          title="View Registered Students"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.event_id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Event Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111439]/70 backdrop-blur-md">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 bg-[#111439] text-white">
                <h3 className="font-bold text-base">
                  {editingEvent ? 'Edit Event Details' : 'Publish New Campus Event'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 bg-lilac">
                <div>
                  <label className="block text-xs font-bold text-[#111439] mb-1">Event Name</label>
                  <input
                    type="text"
                    required
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    placeholder="e.g. AI & Machine Learning Workshop"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">Total Capacity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">Event Date</label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">Event Time</label>
                    <input
                      type="time"
                      required
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. SNIST Central Seminar Hall 1"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] mb-1">Description</label>
                  <textarea
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event details, prerequisites, speaker notes..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-[#111439] text-xs font-bold rounded-xl border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 btn-stripe-gradient text-xs font-bold rounded-xl shadow-md"
                  >
                    {editingEvent ? 'Save Changes' : 'Publish Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Attendee Roster Modal */}
        {rosterEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111439]/70 backdrop-blur-md">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Header */}
              <div className="p-6 bg-[#111439] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base">{rosterEvent.event_name} - Attendee Roster</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Total Registered: <strong className="text-white">{rosterStats?.total_registered || 0}</strong> | Checked In: <strong className="text-[#00D4FF]">{rosterStats?.total_attended || 0}</strong>
                  </p>
                </div>
                <button onClick={() => setRosterEvent(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Roster list */}
              <div className="p-6 overflow-y-auto flex-1 bg-lilac">
                {rosterLoading ? (
                  <p className="text-center text-xs text-slate-400 py-8">Loading participants...</p>
                ) : rosterList.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">No students have registered for this event yet.</p>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Roll No</th>
                          <th className="py-3 px-4">Branch</th>
                          <th className="py-3 px-4">Pass Token</th>
                          <th className="py-3 px-4 text-right">Gate Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rosterList.map((st) => (
                          <tr key={st.registration_id}>
                            <td className="py-3 px-4 font-bold text-[#111439]">{st.name}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{st.roll_number}</td>
                            <td className="py-3 px-4 text-slate-500">{st.department}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[#635BFF] font-bold">{st.qr_token}</td>
                            <td className="py-3 px-4 text-right">
                              {st.attendance_id ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Checked In
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setRosterEvent(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#111439] text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
