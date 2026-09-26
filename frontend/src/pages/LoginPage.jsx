import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Check,
  AlertCircle,
  Shield,
  User,
  Sparkles,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PulseLogo } from '../components/common/PulseLogo';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error & validation states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!identifier.trim()) {
      newErrors.identifier = 'Email or username is required.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions to sign in.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (id, pwd) => {
    setIdentifier(id);
    if (!pwd) {
      setPassword('');
      setApiError('Demo password is not set in environment (VITE_DEMO_ADMIN_PASSWORD / VITE_DEMO_USER_PASSWORD). Please enter password manually.');
      return;
    }
    setPassword(pwd);
    setAgreeTerms(true);
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await login(id, pwd);
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Dynamic Ambient Glassmorphism Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none transform -rotate-12 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-cyan-500/20 via-sky-500/15 to-transparent blur-3xl pointer-events-none transform rotate-12" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-radial-glow pointer-events-none opacity-40 dark:opacity-20" />

      {/* Top Navbar Actions */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-3">
        <ThemeToggle />
      </div>

      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-3">
        <div className="flex justify-center mb-1 drop-shadow-md">
          <PulseLogo variant="full" size="lg" showLink={false} />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Visual Social Experience</span>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          Welcome back! Sign in to continue streaming reels, visual stories, and real-time community feeds.
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-zinc-900/80 p-7 sm:p-9 shadow-2xl shadow-indigo-500/10 dark:shadow-black/60 rounded-3xl border border-white/60 dark:border-white/10 space-y-6 transition-all duration-300">
          
          {/* Top API Error Banner */}
          {apiError && (
            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{apiError}</div>
              <button
                type="button"
                onClick={() => setApiError('')}
                className="text-rose-500 hover:text-rose-700 font-bold text-sm"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Identifier Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-identifier"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
              >
                Username or Email
              </label>
              <div
                className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                  errors.identifier
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                    : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}
              >
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
                  }}
                  placeholder="e.g. ravikant or alex@pulse.in"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                  {errors.identifier}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                  errors.password
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                    : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Interactive Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label
                htmlFor="login-agreeTerms"
                className={`flex items-start space-x-3 cursor-pointer group p-2.5 rounded-2xl transition-all duration-200 ${
                  errors.agreeTerms
                    ? 'bg-rose-500/10 border border-rose-500/30'
                    : 'hover:bg-slate-100/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="relative mt-0.5 shrink-0">
                  <input
                    id="login-agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                      agreeTerms
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/40 scale-105'
                        : errors.agreeTerms
                        ? 'border-rose-500 bg-white dark:bg-zinc-900 ring-2 ring-rose-500/20'
                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-indigo-400'
                    }`}
                  >
                    {agreeTerms && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50" />}
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400 select-none">
                  I agree to Pulse's{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTermsModalOpen(true);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and acknowledge the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTermsModalOpen(true);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </div>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-3 mt-1 animate-fadeIn">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Pulse</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          {import.meta.env.VITE_SHOW_DEMO_ACCOUNTS !== 'false' && (
            <div className="pt-4 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Quick Demo Accounts
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Instant Test Login
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin(
                      'ravikantsinghravi7@gmail.com',
                      import.meta.env.VITE_DEMO_ADMIN_PASSWORD
                    )
                  }
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all hover:scale-[1.02] col-span-2 shadow-sm"
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>👑 Ravikant Singh (Chief Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin(
                      'aarav.sharma1@pulse.in',
                      import.meta.env.VITE_DEMO_USER_PASSWORD
                    )
                  }
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all hover:scale-[1.02]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Aarav Sharma 🇮🇳</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin(
                      'ananya.verma2@pulse.in',
                      import.meta.env.VITE_DEMO_USER_PASSWORD
                    )
                  }
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all hover:scale-[1.02]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ananya Verma 🇮🇳</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Switch to Register */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline inline-flex items-center space-x-1"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>Terms of Service & Privacy Policy</span>
              </h3>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-3 leading-relaxed">
              <p>
                Welcome to <strong>Pulse – Social Hub</strong>. By creating an account or signing in, you agree to comply with our community safety guidelines, intellectual property terms, and privacy practices.
              </p>
              <h4 className="font-bold text-slate-800 dark:text-zinc-200">1. Safe & Respectful Community</h4>
              <p>
                Hate speech, harassment, impersonation, and harmful media are strictly prohibited and subject to immediate administrative suspension.
              </p>
              <h4 className="font-bold text-slate-800 dark:text-zinc-200">2. Content & Creator Ownership</h4>
              <p>
                You retain ownership of the original audio, reels, photos, and stories you publish while granting Pulse the license to stream and distribute to your followers.
              </p>
              <h4 className="font-bold text-slate-800 dark:text-zinc-200">3. Data & Privacy</h4>
              <p>
                We protect your authentication tokens and conversation messages with end-to-end access control and zero third-party data tracking.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setErrors((prev) => ({ ...prev, agreeTerms: null }));
                  setTermsModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
