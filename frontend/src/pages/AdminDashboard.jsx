import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  QrCode, 
  CheckCircle, 
  PlusCircle, 
  TrendingUp, 
  Settings, 
  ShieldCheck, 
  Download,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lilac py-12">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="h-10 w-48 bg-white rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Department chart data (Stripe Gradient Purple/Blue)
  const deptLabels = stats?.departmentData?.map(d => d.department.split(' ')[0]) || [];
  const deptCounts = stats?.departmentData?.map(d => d.count) || [];

  const departmentChartData = {
    labels: deptLabels.length > 0 ? deptLabels : ['AI & DS', 'CSE', 'ECE', 'IT', 'MECH'],
    datasets: [
      {
        label: 'Registered Students',
        data: deptCounts.length > 0 ? deptCounts : [12, 19, 8, 15, 6],
        backgroundColor: '#635BFF',
        borderRadius: 8
      }
    ]
  };

  // Event category chart data (Stripe multi-color palette)
  const catLabels = stats?.categoryData?.map(c => c.category) || [];
  const catCounts = stats?.categoryData?.map(c => c.count) || [];

  const categoryChartData = {
    labels: catLabels.length > 0 ? catLabels : ['AI & ML', 'Technical', 'Hackathons', 'Cultural', 'Sports'],
    datasets: [
      {
        data: catCounts.length > 0 ? catCounts : [2, 1, 1, 1, 1],
        backgroundColor: ['#635BFF', '#00D4FF', '#FF3B8A', '#F59E0B', '#10B981', '#111439'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="min-h-screen bg-lilac py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Banner & Quick Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF] bg-[#635BFF]/10 px-3 py-1 rounded-full border border-[#635BFF]/20">
                SNIST Admin Central
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111439] tracking-tight mt-1">College Event Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-500">Live monitoring of registrations, capacity utilization, and attendance.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/events"
              className="flex items-center gap-2 px-5 py-3 btn-stripe-gradient font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manage Events</span>
            </Link>

            <Link
              to="/scanner"
              className="flex items-center gap-2 px-5 py-3 bg-[#111439] hover:bg-[#1c2466] text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <QrCode className="w-4 h-4 text-[#00D4FF]" />
              <span>Launch Gatekeeper</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards on White Lilac */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Events</span>
            <p className="text-3xl font-extrabold text-[#111439]">{stats?.metrics?.total_events || 0}</p>
            <p className="text-[11px] text-[#635BFF] font-semibold">{stats?.metrics?.upcoming_events || 0} Upcoming</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Students</span>
            <p className="text-3xl font-extrabold text-[#111439]">{stats?.metrics?.total_students || 0}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Portal Registered</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Pass Registrations</span>
            <p className="text-3xl font-extrabold text-[#635BFF]">{stats?.metrics?.total_registrations || 0}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Confirmed Passes</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Verified Attendance</span>
            <p className="text-3xl font-extrabold text-[#00D4FF]">{stats?.metrics?.total_attendance || 0}</p>
            <p className="text-[11px] text-slate-500 font-semibold">QR Scans at Gate</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Turnout Rate</span>
            <p className="text-3xl font-extrabold text-[#FF3B8A]">{stats?.metrics?.attendance_percentage || 0}%</p>
            <p className="text-[11px] text-slate-500 font-semibold">Attendance Ratio</p>
          </div>

        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Department Participation Bar Chart */}
          <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111439]">Department-wise Student Registrations</h3>
              <span className="text-xs text-slate-400">SNIST Branch Breakdown</span>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Bar
                data={departmentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                  }
                }}
              />
            </div>
          </div>

          {/* Category Breakdown Doughnut Chart */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111439]">Events by Category</h3>
              <p className="text-xs text-slate-400">Campus Activity Distribution</p>
            </div>
            <div className="h-56 flex items-center justify-center">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
                  }
                }}
              />
            </div>
          </div>

        </div>

        {/* Two Column Section: Event Attendance Overview vs Recent Registrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Event Performance Table */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111439]">Event Capacity & Turnout</h3>
              <Link to="/admin/events" className="text-xs text-[#635BFF] font-bold hover:underline">
                View All Events →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5">Event Name</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Capacity</th>
                    <th className="py-2.5">Registered</th>
                    <th className="py-2.5">Attended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.eventPerformance?.map((evt) => (
                    <tr key={evt.event_id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-bold text-[#111439] line-clamp-1 max-w-[180px]">{evt.event_name}</td>
                      <td className="py-2.5 text-slate-500">{evt.event_date}</td>
                      <td className="py-2.5 text-slate-600">{evt.capacity}</td>
                      <td className="py-2.5 text-[#635BFF] font-bold">{evt.total_registered}</td>
                      <td className="py-2.5 text-[#00D4FF] font-bold">{evt.total_attended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Stream of Registrations */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111439]">Recent Registrations Stream</h3>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {stats?.recentRegistrations?.map((r) => (
                <div key={r.registration_id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-[#111439]">{r.student_name} <span className="font-mono text-[10px] text-slate-500 font-normal">({r.roll_number})</span></p>
                    <p className="text-[11px] text-[#635BFF] font-semibold line-clamp-1">{r.event_name}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <p className="font-semibold text-slate-600">{r.department.split(' ')[0]}</p>
                    <p>{new Date(r.registration_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
