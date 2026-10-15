import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, CalendarCheck, BarChart3, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { loginPhone } from '../APIservices/authService';
import { useToast } from '../components/ToastContext';
export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      
      const result = await loginPhone(email, password);
      if (result.ok) {
        localStorage.setItem('adminUser', JSON.stringify(result.data));

        switch (result.data.role?.toLowerCase()) {
          case 'doctor':
            navigate('/doctor');
            break;
          case 'pharmacy':
            navigate('/pharmacy');
            break;
          case 'lab':
            navigate('/lab');
            break;
          case 'it_support':
            navigate('/it-support');
            break;
          case 'admin':
            navigate('/super-admin');
            break;
          default:
            navigate('/lab');
        }

      } else {
        useToast('error', result.data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
     useToast('error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F2F7F4]">
   
      <div className="lg:w-1/2 bg-gradient-to-br from-[#0B5338] via-[#127C55] to-[#1F8E64] p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        <div>
        
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-10 shadow-inner backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-[#A7F3D0]" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5">
            Hospital Operations & <br />
            OPD Governance Suite
          </h1>
          <p className="text-[#D1FAE5] text-sm sm:text-base max-w-md leading-relaxed mb-10">
            Comprehensive administrative control panel for managing clinic rosters, token routing, and hospital queue capacity.
          </p>

          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <SlidersHorizontal className="w-5 h-5 text-[#A7F3D0]" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">Live Counter & Queue Traffic Control</h3>
                <p className="text-[#D1FAE5] text-xs sm:text-sm">
                  Override token flows, reassign rooms, and dispatch emergency triage cases across active counters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="w-5 h-5 text-[#A7F3D0]" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">Doctor Rostering & Room Allocation</h3>
                <p className="text-[#D1FAE5] text-xs sm:text-sm">
                  Schedule physician duty shifts, assign consultation rooms, and configure daily patient intake quotas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5 text-[#A7F3D0]" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">OPD Throughput & Wait-Time Analytics</h3>
                <p className="text-[#D1FAE5] text-xs sm:text-sm">
                  Monitor patient turnover rates, identify clinic bottlenecks, and optimize peak-hour staffing levels.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-[#A7F3D0]" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">Role-Based Access & Audit Logging</h3>
                <p className="text-[#D1FAE5] text-xs sm:text-sm">
                  Govern staff permissions, monitor receptionist activities, and retain detailed clinical audit logs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs text-[#A7F3D0]/80">
          MediQueue Systems • Administrative Console v2.0
        </div>
      </div>

     
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-[#E2ECE6]">

          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-[#E8F6EF] text-[#0B5338] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              Staff Portal
            </span>
            <h2 className="text-3xl font-bold text-[#0F2A1D] tracking-tight mb-2">Admin Sign In</h2>
            <p className="text-slate-500 text-sm">Enter your hospital staff credentials to continue</p>
          </div>

       
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
           
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Staff Email or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mediqueue.lk or STF-001"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-[#D5E2DA] rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#127C55] focus:bg-white transition disabled:opacity-60"
                />
              </div>
            </div>

           
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-3 bg-[#F8FAF9] border border-[#D5E2DA] rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#127C55] focus:bg-white transition disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0B5338] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Device */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#127C55] border-[#D5E2DA] rounded focus:ring-[#127C55]"
                />
                <span>Remember this terminal</span>
              </label>
              <a href="#forgot" className="text-[#127C55] hover:text-[#0B5338] hover:underline font-semibold text-xs">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#127C55] hover:bg-[#0B5338] active:scale-[0.99] disabled:opacity-70 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#127C55]/25 transition-all duration-150"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#EDF2EE] text-center text-xs text-slate-500">
            Need system access or experiencing technical issues? <br />
            <a href="#helpdesk" className="text-[#127C55] font-semibold hover:underline">
              Contact Hospital IT Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}