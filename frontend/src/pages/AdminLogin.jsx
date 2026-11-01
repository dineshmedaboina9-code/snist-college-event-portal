import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        if (res.user.role === 'organizer') {
          navigate('/scanner');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(res.message || 'Staff login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPwd) => {
    setEmail(demoEmail);
    setPassword(demoPwd);
  };

  return (
    <div className="min-h-[85vh] bg-lilac flex items-center justify-center px-4 py-14">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-9 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#111439] text-[#00D4FF] rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111439] tracking-tight">Staff & Admin Portal</h2>
          <p className="text-xs text-slate-500">Authorized access for SNIST event faculty coordinators and gatekeepers.</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-[#111439] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#635BFF]" /> Fast Demo Credentials:
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@snist.edu.in', 'admin123')}
              className="text-left text-[11px] px-3.5 py-2 bg-white hover:bg-slate-100 text-[#111439] rounded-xl border border-slate-200 transition font-mono font-bold shadow-sm"
            >
              <strong>Admin:</strong> admin@snist.edu.in / admin123
            </button>
            <button
              type="button"
              onClick={() => fillDemo('organizer@snist.edu.in', 'organizer123')}
              className="text-left text-[11px] px-3.5 py-2 bg-white hover:bg-slate-100 text-[#111439] rounded-xl border border-slate-200 transition font-mono font-bold shadow-sm"
            >
              <strong>Gatekeeper:</strong> organizer@snist.edu.in / organizer123
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111439] mb-1.5">Staff College Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@snist.edu.in"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111439] transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111439] mb-1.5">Administrative Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111439] transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#111439] hover:bg-[#1c2466] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Access Staff Console'}</span>
            <ArrowRight className="w-4 h-4 text-[#00D4FF]" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link to="/login" className="text-xs text-[#635BFF] font-bold hover:underline">
            ← Switch to Student Login
          </Link>
        </div>

      </div>
    </div>
  );
}
