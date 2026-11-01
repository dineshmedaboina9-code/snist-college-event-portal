import React from 'react';
import { Calendar, Heart, Shield, Award, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#111439] border-t border-indigo-950 text-slate-400 text-sm mt-auto relative overflow-hidden">
      {/* Top Stripe Gradient Border Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#635BFF] via-[#00D4FF] to-[#FF3B8A]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635BFF] via-[#00D4FF] to-[#FF3B8A] flex items-center justify-center p-[2px]">
                <div className="w-full h-full bg-[#111439] rounded-[10px] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#00D4FF]" />
                </div>
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">SNIST CEMP</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized College Event Management Portal for Sreenidhi Institute of Science and Technology (Autonomous), Yamnampet, Ghatkesar, Hyderabad.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>NAAC A+ & NBA Accredited Institution</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-[#00D4FF] transition">Portal Home</Link></li>
              <li><Link to="/events" className="hover:text-[#00D4FF] transition">Browse Upcoming Events</Link></li>
              <li><Link to="/events?category=Technical" className="hover:text-[#00D4FF] transition">Technical Symposiums</Link></li>
              <li><Link to="/events?category=Hackathon" className="hover:text-[#00D4FF] transition">Hackathons & Competitions</Link></li>
              <li><Link to="/login" className="hover:text-[#00D4FF] transition">Student Portal Login</Link></li>
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Event Categories</h4>
            <div className="flex flex-wrap gap-2">
              {['AI & ML', 'Technical', 'Hackathons', 'Cultural', 'Sports', 'Guest Lectures', 'Workshops'].map((cat) => (
                <Link
                  key={cat}
                  to={`/events?category=${encodeURIComponent(cat)}`}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[11px] rounded-lg text-slate-300 border border-white/5 transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Gatekeeper */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00D4FF] shrink-0" />
                <span>SNIST Campus, Hyderabad - 501301</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#635BFF] shrink-0" />
                <span>events@snist.edu.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF3B8A] shrink-0" />
                <span>+91 (040) 2763-0229</span>
              </li>
              <li className="pt-2">
                <Link to="/admin/login" className="text-xs text-[#00D4FF] hover:underline flex items-center gap-1.5 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin & Organizer Portal Login →</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-indigo-950/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Sreenidhi Institute of Science and Technology. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Powered by React, Node.js & MySQL
          </p>
        </div>
      </div>
    </footer>
  );
}
