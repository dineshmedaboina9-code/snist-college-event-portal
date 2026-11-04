import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Users, 
  Sparkles, 
  RotateCw, 
  Search,
  ShieldCheck,
  StopCircle
} from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';

export default function AttendanceScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data?.success && res.data.events.length > 0) {
        setEvents(res.data.events);
        setSelectedEventId(res.data.events[0].event_id.toString());
      }
    } catch (e) {
      console.error('Failed to load events:', e);
    }
  };

  const startScanner = async () => {
    try {
      setScanResult(null);
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleTokenScanned(decodedText);
        },
        (errorMessage) => {
          // ignore frame decode errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      alert('Could not access camera: ' + err.message + '. You can still use the Manual Token Entry below.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleTokenScanned = async (token) => {
    if (!token) return;
    setScanLoading(true);
    try {
      const res = await api.post('/attendance/check-in', {
        token: token.trim(),
        event_id: selectedEventId || undefined
      });

      if (res.data.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 }
        });
        const result = {
          status: 'success',
          message: res.data.message,
          student: res.data.student,
          timestamp: new Date().toLocaleTimeString()
        };
        setScanResult(result);
        setRecentScans(prev => [result, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      const isDup = err.response?.data?.duplicate;
      const result = {
        status: isDup ? 'duplicate' : 'error',
        message: err.response?.data?.message || 'Check-in validation failed.',
        details: err.response?.data?.details || null,
        timestamp: new Date().toLocaleTimeString()
      };
      setScanResult(result);
      if (isDup) {
        setRecentScans(prev => [result, ...prev.slice(0, 9)]);
      }
    } finally {
      setScanLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleTokenScanned(manualToken.trim());
    setManualToken('');
  };

  return (
    <div className="min-h-screen bg-lilac py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header in Dark Blue (#111439) with Stripe Gradient Glow */}
        <div className="bg-[#111439] text-white rounded-3xl p-7 sm:p-9 border border-indigo-950 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#00D4FF]/20 via-[#635BFF]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#00D4FF] border border-white/10 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Event Gatekeeper Scanner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Real-Time QR Attendance Check-In</h1>
            <p className="text-xs text-slate-300 mt-1">Scan student passes or enter tokens to verify registration and prevent duplicate entry.</p>
          </div>

          {/* Event Selector */}
          <div className="relative z-10 bg-white/5 p-3.5 rounded-2xl border border-white/10 min-w-[240px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Active Event Entrance</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-[#111439] border border-indigo-900 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              {events.map((evt) => (
                <option key={evt.event_id} value={evt.event_id}>
                  {evt.event_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Scanner & Manual Entry (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Camera Scanner Box */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#111439] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#635BFF]" />
                  <span>Live Camera Scanner</span>
                </h3>
                
                {isScanning ? (
                  <button
                    onClick={stopScanner}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={startScanner}
                    className="flex items-center gap-1.5 px-4 py-2 btn-stripe-gradient text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Camera</span>
                  </button>
                )}
              </div>

              {/* Video container */}
              <div className="relative bg-[#111439] rounded-2xl overflow-hidden min-h-[280px] flex items-center justify-center border border-indigo-950">
                <div id="qr-reader" className="w-full max-w-sm" />
                {!isScanning && (
                  <div className="text-center p-6 space-y-2 text-slate-400">
                    <QrCode className="w-12 h-12 mx-auto text-slate-600" />
                    <p className="text-xs">Camera is idle. Click "Start Camera" to scan passes directly from student smartphones.</p>
                  </div>
                )}
              </div>

              {/* Manual Token Fallback */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Manual Pass Token Entry
                  </span>
                  <span className="text-[10px] font-bold text-[#635BFF] bg-indigo-50 px-2 py-0.5 rounded-md">
                    Live Demo Ready
                  </span>
                </div>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Type or paste token (e.g. SNIST-...)"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[#111439] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                  <button
                    type="submit"
                    disabled={scanLoading || !manualToken.trim()}
                    className="px-5 py-2.5 btn-stripe-gradient font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {scanLoading ? 'Checking...' : 'Verify'}
                  </button>
                </form>

                {/* 5 Presentation Demo Passes */}
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3 text-[#635BFF]" /> Fast Presentation Pass Scans (5 Active Events):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '1. AI & ML Workshop', token: 'SNIST-AI-23311A66A6-9X4F', eventId: '1' },
                      { label: '2. Sreevision 2026', token: 'SNIST-SREE-23311A66A6-7M2K', eventId: '2' },
                      { label: '3. GenAI Hackathon', token: 'SNIST-HACK-23311A66A6-4P9L', eventId: '3' },
                      { label: '4. Cultural Fest', token: 'SNIST-CULT-23311A66A6-3W8R', eventId: '4' },
                      { label: '5. Sports League', token: 'SNIST-SPORT-23311A66A6-6V2Q', eventId: '5' }
                    ].map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedEventId(p.eventId);
                          handleTokenScanned(p.token);
                        }}
                        className="text-[10px] font-mono font-bold px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-[#635BFF] text-[#111439] rounded-lg border border-slate-200 transition shadow-xs flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3 text-[#635BFF]" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Tip: Click once to mark verified attendance. Click a second time to demonstrate duplicate prevention!
                  </p>
                </div>
              </div>

            </div>

            {/* Scan Result Feedback Card */}
            {scanResult && (
              <div className={`p-6 rounded-3xl border shadow-lg animate-fadeIn ${
                scanResult.status === 'success' 
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : scanResult.status === 'duplicate'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-start gap-3.5">
                  {scanResult.status === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />}
                  {scanResult.status === 'duplicate' && <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />}
                  {scanResult.status === 'error' && <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm">
                      {scanResult.status === 'success' && 'Valid Pass — Attendance Recorded!'}
                      {scanResult.status === 'duplicate' && 'Duplicate Check-In Alert!'}
                      {scanResult.status === 'error' && 'Check-In Rejected'}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">{scanResult.message}</p>

                    {scanResult.student && (
                      <div className="mt-3 p-3.5 bg-white/90 rounded-2xl border border-emerald-200 text-xs space-y-1">
                        <p><strong>Student:</strong> {scanResult.student.name} ({scanResult.student.roll_number})</p>
                        <p><strong>Branch:</strong> {scanResult.student.department}</p>
                        <p><strong>Event:</strong> {scanResult.student.event_name}</p>
                        <p className="text-[10px] text-slate-500">Timestamp: {scanResult.timestamp}</p>
                      </div>
                    )}

                    {scanResult.details && (
                      <div className="mt-2.5 p-2.5 bg-white/90 rounded-xl text-xs font-mono text-amber-900 border border-amber-200">
                        Already checked in at: {scanResult.details.check_in_time}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Recent Gate Logs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#111439]">Recent Gate Check-Ins</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#111439]">
                  Live Stream
                </span>
              </div>

              {recentScans.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No passes scanned yet in this session.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                  {recentScans.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                        s.status === 'success'
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-amber-50/50 border-amber-100'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-[#111439]">
                          {s.student ? s.student.name : 'Unknown Pass'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {s.student ? `${s.student.roll_number} • ${s.student.department}` : s.message}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {s.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
