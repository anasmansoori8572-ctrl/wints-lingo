import React, { useState } from 'react';
import { Logo } from './Logo';
import { Lock, User as UserIcon, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { User, SiteSettings } from '../types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBackToHome: () => void;
  siteSettings?: SiteSettings;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
  siteSettings,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage('Please enter both Username and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanUsername,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error || 'Invalid username or password');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A1C] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,58,180,0.25),rgba(255,255,255,0))] text-white font-['Plus_Jakarta_Sans'] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-purple-500/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Website</span>
        </button>
        <span className="text-[11px] font-medium text-purple-300/60 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Secure Portal
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-[#181126]/90 backdrop-blur-xl border border-purple-800/40 shadow-2xl shadow-purple-950/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-purple-800/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Portal Header */}
          <div className="text-center space-y-3 pb-6 border-b border-purple-900/30">
            <div className="flex justify-center">
              <Logo size="lg" variant="light" showTagline={true} />
            </div>
            <div className="pt-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Outfit']">
                Admin Login
              </h1>
              <p className="text-xs text-purple-200/70 font-normal mt-1">
                Enter your credentials to access the Administration Panel
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-5 p-3.5 rounded-2xl bg-red-950/70 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/40 border border-purple-800/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white placeholder-purple-400/40 text-xs sm:text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-purple-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-purple-300 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/40 border border-purple-800/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white placeholder-purple-400/40 text-xs sm:text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-6 pt-4 border-t border-purple-900/30 text-center">
            <p className="text-[11px] text-purple-300/60 leading-relaxed">
              Protected by secure token and server-side authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-md w-full mx-auto text-center pt-6 text-[11px] text-purple-300/40">
        © {siteSettings?.academyName || 'WITS LINGO'}. All Rights Reserved.
      </div>
    </div>
  );
};
