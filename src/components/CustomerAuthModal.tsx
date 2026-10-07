import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else if (mode === 'register') {
      if (password.length < 6) {
        setLoading(false);
        setError('Password must be at least 6 characters long');
        return;
      }
      const res = await register({
        email,
        password,
        fullName,
        phone,
        address: deliveryAddress,
        city,
        state,
        zipCode,
      });
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    } else if (mode === 'forgot') {
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg(`If an account exists for ${email}, a password reset link has been dispatched.`);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1826] rounded-2xl border border-white/15 shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-200 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0088FF]/15 border border-[#0088FF]/30 text-[#0088FF] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
            {mode === 'login' && 'Sign In to BlueWave'}
            {mode === 'register' && 'Create Customer Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access your orders, saved cart, messages, and receipts.'}
            {mode === 'register' && 'Join BlueWave Outboard Motors for tracked orders and direct quotes.'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name <span className="text-[#0088FF]">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain James Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Email Address <span className="text-[#0088FF]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password <span className="text-[#0088FF]">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#0088FF] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Delivery Address (Optional)
              </span>
              <input
                type="text"
                placeholder="Street address or Marina Dock"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Complete Registration'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-[#0088FF] font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-[#0088FF] font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
