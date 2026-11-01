import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid roll number or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (id, pwd) => {
    setIdentifier(id);
    setPassword(pwd);
  };

  return (
    <div className="min-h-[85vh] bg-lilac flex items-center justify-center px-4 py-14">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-9 space-y-6">
        
        {/* Header with Stripe Gradient Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#635BFF]/10 via-[#00D4FF]/10 to-[#FF3B8A]/10 text-[#635BFF] rounded-2xl flex items-center justify-center mx-auto border border-[#635BFF]/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111439] tracking-tight">Student Portal Login</h2>
          <p className="text-xs text-slate-500">Sign in with your SNIST roll number to access your event passes.</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-[#111439] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#635BFF]" /> Fast Demo Credentials:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('23311A66A6', 'student123')}
              className="text-[11px] px-3 py-1.5 bg-white hover:bg-slate-100 text-[#111439] rounded-xl border border-slate-200 transition font-mono font-bold shadow-sm"
            >
              23311A66A6 (Rahul)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('23311A0501', 'student123')}
              className="text-[11px] px-3 py-1.5 bg-white hover:bg-slate-100 text-[#111439] rounded-xl border border-slate-200 transition font-mono font-bold shadow-sm"
            >
              23311A0501 (Priya)
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
            <label className="block text-xs font-bold text-[#111439] mb-1.5">Email or Roll Number</label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 23311A66A6 or student@snist.edu.in"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111439] mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 btn-stripe-gradient font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#635BFF] hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Are you an event faculty coordinator?{' '}
            <Link to="/admin/login" className="text-[#111439] font-bold hover:underline">
              Staff Entrance →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
