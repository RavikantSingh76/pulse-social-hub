import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, LogIn } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PulseLogo } from '../components/common/PulseLogo';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      // Handled in AuthContext with toast
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (id, pwd) => {
    setIdentifier(id);
    setPassword(pwd);
    setLoading(true);
    try {
      await login(id, pwd);
      navigate('/');
    } catch (err) {
      // error toasted
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center mb-1">
          <PulseLogo variant="full" size="lg" showLink={false} />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Connect, share, and explore real-time visual stories.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 shadow-xl shadow-gray-200/50 dark:shadow-black/40 rounded-3xl border border-gray-100 dark:border-zinc-800/80 sm:px-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. alex@social.com or alexmorgan"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
            <p className="text-xs font-bold text-center text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('ravikantsinghravi7@gmail.com', 'Admin@123')}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition-colors col-span-2 shadow-sm"
              >
                <Shield className="w-4 h-4" />
                <span>👑 Ravikant Singh (Chief Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('aarav.sharma1@pulse.in', 'User@123')}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Aarav Sharma 🇮🇳</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ananya.verma2@pulse.in', 'User@123')}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ananya Verma 🇮🇳</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
