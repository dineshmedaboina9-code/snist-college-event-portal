import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Hash, Building2, ArrowRight, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science & Engineering',
  'Electronics & Communication Engg (ECE)',
  'Information Technology (IT)',
  'Electrical & Electronics Engg (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology'
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    department: DEPARTMENTS[0],
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        roll_number: formData.roll_number,
        department: formData.department,
        password: formData.password
      });

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-lilac flex items-center justify-center px-4 py-14">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-9 space-y-6">
        
        {/* Header with Stripe Gradient Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#635BFF]/10 via-[#00D4FF]/10 to-[#FF3B8A]/10 text-[#635BFF] rounded-2xl flex items-center justify-center mx-auto border border-[#635BFF]/20">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111439] tracking-tight">Create Student Account</h2>
          <p className="text-xs text-slate-500">Register with your college credentials to participate in SNIST campus events.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111439] mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Verma"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">Roll Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  placeholder="e.g. 23311A66A6"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm uppercase text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
                />
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">College Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@snist.edu.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111439] mb-1.5">Department / Branch</label>
            <div className="relative">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 btn-stripe-gradient font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#635BFF] hover:underline">
              Log in to your account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
