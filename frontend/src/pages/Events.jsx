import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, X, RefreshCw } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import QRModal from '../components/QRModal';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'AI & ML', 'Technical', 'Hackathon', 'Cultural', 'Sports', 'Guest Lecture'];

export default function Events() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, upcomingOnly, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (upcomingOnly) {
        params.append('upcoming', 'true');
      }

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data?.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-lilac py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Title & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#635BFF]">Campus Directory</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111439] tracking-tight mt-0.5">Explore All Events</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Discover, enroll, and secure verified entry passes for all SNIST college activities.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event, topic, or venue..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent shadow-sm"
            />
            <Search className="w-4 h-4 text-[#635BFF] absolute left-3.5 top-3.5" />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(''); setTimeout(fetchEvents, 0); }}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Filter Chips & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'btn-stripe-gradient shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#111439]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Upcoming Toggle & Result Counter */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(e) => setUpcomingOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
              />
              <span>Upcoming Only</span>
            </label>

            <span className="text-slate-300">|</span>
            <span>Showing <strong className="text-[#111439]">{events.length}</strong> events</span>
          </div>

        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-white rounded-3xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#111439]">No events matched your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try choosing a different category or clearing your search term to see more campus events.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchTerm(''); setUpcomingOnly(false); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#635BFF] hover:underline pt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
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
