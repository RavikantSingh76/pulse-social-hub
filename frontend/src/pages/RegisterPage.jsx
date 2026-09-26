import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PulseLogo } from '../components/common/PulseLogo';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form input states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error & validation states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Password strength calculation
  const calculateStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-zinc-700' };
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 9) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-emerald-500' };
    return { score: 4, label: 'Strong', color: 'bg-cyan-500' };
  };

  const strength = calculateStrength(password);

  const validateForm = () => {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Full display name is required.';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters.';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, or underscores).';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must review and agree to the Terms of Service & Privacy Policy.';
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
      await register(username.trim().toLowerCase(), email.trim().toLowerCase(), password, displayName.trim());
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Username or email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Dynamic Ambient Glassmorphism Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-purple-500/20 via-pink-500/15 to-transparent blur-3xl pointer-events-none transform rotate-12 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-cyan-500/15 to-transparent blur-3xl pointer-events-none transform -rotate-12" />

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
          <span>Join the Next-Gen Social Hub</span>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          Create an account to start sharing ideas, audio reels, and stories with creators worldwide.
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-zinc-900/80 p-7 sm:p-9 shadow-2xl shadow-indigo-500/10 dark:shadow-black/60 rounded-3xl border border-white/60 dark:border-white/10 space-y-5 transition-all duration-300">
          
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
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-displayName"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
              >
                Full Name
              </label>
              <div
                className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                  errors.displayName
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                    : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}
              >
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  id="register-displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: null }));
                  }}
                  placeholder="e.g. Jordan Smith"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />
              </div>
              {errors.displayName && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-username"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
              >
                Username
              </label>
              <div
                className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                  errors.username
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                    : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}
              >
                <AtSign className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
                  }}
                  placeholder="e.g. jordansmith"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
              >
                Email Address
              </label>
              <div
                className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                  errors.email
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                    : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}
              >
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="jordan@example.com"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field & Strength Indicator */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
              >
                Password
              </label>
              <div
                className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                  errors.password
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                    : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="Minimum 6 characters"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="pt-1 space-y-1 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    <span>Password Strength</span>
                    <span className="font-bold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          step <= strength.score ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Interactive Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label
                htmlFor="register-agreeTerms"
                className={`flex items-start space-x-3 cursor-pointer group p-2.5 rounded-2xl transition-all duration-200 ${
                  errors.agreeTerms
                    ? 'bg-rose-500/10 border border-rose-500/30'
                    : 'hover:bg-slate-100/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="relative mt-0.5 shrink-0">
                  <input
                    id="register-agreeTerms"
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
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Switch to Login */}
          <div className="text-center pt-3 border-t border-slate-200/60 dark:border-zinc-800">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline inline-flex items-center space-x-1"
              >
                <span>Sign In</span>
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
                Welcome to <strong>Pulse – Social Hub</strong>. By creating an account, you agree to comply with our community safety guidelines, intellectual property terms, and privacy practices.
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
