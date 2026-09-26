import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/services';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PulseLogo } from '../components/common/PulseLogo';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Steps: 1 = Request OTP, 2 = Verify OTP & Reset Password, 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error & notice states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const strength = calculateStrength(newPassword);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setInfoMessage('');

    if (!email.trim()) {
      setErrors({ email: 'Please enter your registered email address.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      const serverMsg = res?.message || 'OTP sent successfully to your email!';
      setInfoMessage(serverMsg);
      toast.success(serverMsg);

      // In development/demo, if the server returns the generated OTP in payload, autofill it for instant testing convenience
      if (res?.data?.otp) {
        setOtp(res.data.otp);
      }

      setStep(2);
      setResendCooldown(60);
      setErrors({});
    } catch (err) {
      setApiError(err.message || 'Email not found or error dispatching OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = {};
    if (!otp.trim()) {
      newErrors.otp = '6-digit OTP code is required.';
    } else if (otp.trim().length !== 6) {
      newErrors.otp = 'OTP must be exactly 6 digits.';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(email.trim(), otp.trim(), newPassword);
      toast.success(res?.message || 'Password reset successfully!');
      setStep(3);
    } catch (err) {
      setApiError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Ambient Radial Glassmorphism Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none transform -rotate-12 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[520px] h-[520px] rounded-full bg-gradient-to-tl from-cyan-500/20 via-sky-500/15 to-transparent blur-3xl pointer-events-none transform rotate-12" />

      {/* Top Navbar Actions */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-3">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-3">
        <div className="flex justify-center mb-1 drop-shadow-md">
          <PulseLogo variant="full" size="lg" showLink={false} />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold backdrop-blur-md">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Account Recovery & Security</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          {step === 1 && 'Reset your password'}
          {step === 2 && 'Verify code & set new password'}
          {step === 3 && 'Password successfully updated!'}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          {step === 1 && 'Enter your registered email and we will send you a 6-digit verification code to reset your password.'}
          {step === 2 && `Enter the 6-digit code sent to ${email} and choose a strong new password.`}
          {step === 3 && 'Your account security credentials have been updated. You can now sign in with your new password.'}
        </p>
      </div>

      {/* Glassmorphic Form Container */}
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

          {/* Top Informational Banner */}
          {infoMessage && step === 2 && (
            <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-500" />
              <span className="font-medium">{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Email & Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
                >
                  Registered Email Address
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
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="e.g. ravikantsinghravi7@gmail.com"
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP & Input New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              {/* Target Email indicator & change button */}
              <div className="flex items-center justify-between text-xs bg-slate-100/60 dark:bg-zinc-800/60 px-3.5 py-2 rounded-xl">
                <span className="text-slate-600 dark:text-zinc-400 truncate max-w-[240px]">
                  Sending to: <strong>{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setApiError('');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-otp"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
                >
                  6-Digit Verification Code
                </label>
                <div
                  className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                    errors.otp
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                      : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <input
                    id="forgot-otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                    }}
                    placeholder="000000"
                    className="w-full bg-transparent text-center tracking-[0.4em] font-mono text-lg font-bold text-slate-900 dark:text-zinc-100 placeholder-slate-300 dark:placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                {errors.otp && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                    {errors.otp}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-newPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
                >
                  New Password
                </label>
                <div
                  className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                    errors.newPassword
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                      : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <input
                    id="forgot-newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
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

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      <span>Strength</span>
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

                {errors.newPassword && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
                >
                  Confirm New Password
                </label>
                <div
                  className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/80 border transition-all duration-200 ${
                    errors.confirmPassword
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
                      : 'border-slate-200/90 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20'
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <input
                    id="forgot-confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                    }}
                    placeholder="Re-enter password"
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pl-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Update Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password & Save</span>
                  </>
                )}
              </button>

              {/* Resend OTP button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Did not receive code? Resend OTP'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Your password has been changed. You can now use your new credentials to log into Pulse.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer Navigation Link */}
          <div className="text-center pt-2 border-t border-slate-200/60 dark:border-zinc-800">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
