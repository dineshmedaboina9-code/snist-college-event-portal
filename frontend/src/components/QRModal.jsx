import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, CheckCircle, Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';

export default function QRModal({ registration, onClose }) {
  const modalRef = useRef();

  if (!registration) return null;

  const downloadQR = () => {
    const svg = document.getElementById('student-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `SNIST-Pass-${registration.qr_token}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111439]/70 backdrop-blur-md animate-fadeIn">
      <div 
        ref={modalRef} 
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header in Dark Blue (#111439) with Top Stripe Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#635BFF] via-[#00D4FF] to-[#FF3B8A]" />
        
        <div className="bg-[#111439] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00D4FF] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
            <span>Official Gate Pass</span>
          </div>
          <h3 className="text-lg font-extrabold text-white line-clamp-1">{registration.event_name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Sreenidhi Institute of Science and Technology</p>
        </div>

        {/* Pass Content on Lilac Background */}
        <div className="p-6 text-center space-y-4 bg-lilac">
          
          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white border border-slate-200 rounded-3xl shadow-sm mx-auto">
            <QRCodeSVG
              id="student-qr-svg"
              value={registration.qr_token}
              size={190}
              level="H"
              includeMargin={true}
            />
            <div className="mt-2 text-center">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Unique Pass Code</span>
              <p className="font-mono text-xs font-black text-[#111439] tracking-widest">{registration.qr_token}</p>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl p-4 text-left text-xs space-y-2.5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>Date:</span>
              </span>
              <span className="font-bold text-[#111439]">{registration.event_date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>Time:</span>
              </span>
              <span className="font-bold text-[#111439]">{registration.event_time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF3B8A]" />
                <span>Venue:</span>
              </span>
              <span className="font-bold text-[#111439] truncate max-w-[200px]">{registration.venue}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Entrance Status:</span>
              {registration.is_attended ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Checked In
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px] border border-amber-200">
                  Pending Scan
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Show this QR code to the event coordinator at the entrance gate for automated check-in.
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 btn-stripe-gradient text-xs font-bold rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Pass</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 bg-white hover:bg-slate-100 text-[#111439] text-xs font-bold rounded-xl border border-slate-200 transition"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
