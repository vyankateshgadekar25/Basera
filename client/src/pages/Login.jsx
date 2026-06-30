import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { Mail, Lock, ArrowRight, User, Building2, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('renter');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const api = useApi();
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { email: email.trim().toLowerCase(), role, name: name || undefined });
      if (res.data.otp_debug) setDebugOtp(res.data.otp_debug);
      const delivery = res.data.delivery;
      addToast(
        delivery === 'email' ? 'Sign-in code sent — check your inbox.'
        : delivery === 'console' ? 'Dev mode: OTP printed in server console.'
        : 'Code generated.',
        'success'
      );
      setStep('otp');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      addToast('Please enter the 6-digit code', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: email.trim().toLowerCase(), code: otp });
      login(res.data.token, res.data.user);
      addToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
      navigate(res.data.user.role === 'owner' ? '/owner' : '/renter');
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full bg-accent-200/40 blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-[420px] h-[420px] rounded-full bg-cream-200/60 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-700/70 hover:text-accent-700 transition-colors mb-6" data-testid="back-to-search">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>

        <div className="text-center mb-8 animate-fade-up">
          <div className="w-14 h-14 bg-ink-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative overflow-hidden">
            <span className="font-display text-cream-50 text-2xl font-semibold">B</span>
            <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-accent-400" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-900 tracking-tight">Welcome to Basera</h1>
          <p className="text-ink-700/60 mt-2">Sign in with a one-time code — no passwords.</p>
        </div>

        <div className="card p-8 animate-fade-up" style={{ animationDelay: '120ms' }}>
          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="label flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ink-900/40" />
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="input"
                  required
                  autoComplete="email"
                  data-testid="login-email-input"
                />
                <p className="text-xs text-ink-700/50 mt-1.5">We'll send a 6-digit sign-in code to this address.</p>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Shield className="w-4 h-4 text-ink-900/40" />
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'owner',  label: 'Property Owner',  icon: Building2 },
                    { value: 'renter', label: 'Tenant / Renter', icon: User },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      data-testid={`role-${option.value}`}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.97] ${
                        role === option.value
                          ? 'border-accent-600 bg-accent-50 text-accent-700'
                          : 'border-ink-900/10 hover:border-ink-900/20 text-ink-700'
                      }`}
                    >
                      <option.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4 text-ink-900/40" />
                  Full Name {role === 'owner' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input"
                  required={role === 'owner'}
                  data-testid="login-name-input"
                />
                <p className="text-xs text-ink-700/50 mt-1.5">Used the first time only — we remember you after that.</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="login-send-otp">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  <>Send sign-in code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-accent-700" />
                </div>
                <h2 className="font-display text-lg font-semibold text-ink-900">Enter sign-in code</h2>
                <p className="text-sm text-ink-700/60 mt-1">
                  Sent to <span className="font-semibold text-ink-900">{email}</span>
                </p>
              </div>

              {debugOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">Development Mode</p>
                  <p className="text-2xl font-bold text-amber-800 tracking-widest font-mono">{debugOtp}</p>
                  <p className="text-xs text-amber-600 mt-1">Set GMAIL_USER + GMAIL_APP_PASSWORD on the server to deliver real emails.</p>
                </div>
              )}

              <div>
                <label className="label">6-Digit Code</label>
                <div className="relative">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="input text-center text-2xl tracking-[0.5em] font-mono pr-12"
                    required
                    autoComplete="one-time-code"
                    data-testid="login-otp-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-900/40 hover:text-ink-900 transition-colors"
                    aria-label="Toggle code visibility"
                  >
                    {showOtp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="login-verify-otp">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>Verify & Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setDebugOtp(''); }}
                className="w-full text-sm text-ink-700/60 hover:text-accent-700 font-medium transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-ink-700/50 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
