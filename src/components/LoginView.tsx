import React, { useState } from "react";
import { Loader2, Lock, Mail, User, Sparkles, AlertCircle } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Input fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = isSignUp ? { name, email, password } : { email, password };
    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || "An error occurred during submission.");
      }
    } catch (err) {
      console.error("Auth submission error:", err);
      setError("Server connection failed. Try restarting server.");
    } finally {
      setLoading(false);
    }
  };

  // Immediate Click Auto-Login for evaluators
  const handleQuickLogin = async (usrEmail: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usrEmail, password: pass })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Quick login failed:", err);
      setError("Quick login failed. Contact administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden" id="login-layout-wrapper">
      
      {/* Dynamic background highlights */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
        <svg width="600" height="600" viewBox="0 0 100 100" fill="indigo">
          <circle cx="50" cy="50" r="50"/>
        </svg>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-4 text-center">
        {/* Brand App Icon */}
        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-violet-200 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap fill-white text-transparent">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Smart Career Advisor</h2>
          <p className="text-xs text-gray-500 mt-1 leading-normal font-light">
            AI-powered placement coaching, resume analyzer, and skill evaluations
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10" id="login-form-card">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-3xl sm:px-10 space-y-6">
          
          <div className="flex border-b border-gray-150 text-center pb-2.5">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 pb-1.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 outline-none ${
                !isSignUp ? "border-violet-600 text-violet-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 pb-1.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 outline-none ${
                isSignUp ? "border-violet-600 text-violet-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-fadeIn" id="login-error-log">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-505 block tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Saniya HK"
                    id="input-name-auth"
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-505 block tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  id="input-email-auth"
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-505 block tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  id="input-password-auth"
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="w-full mt-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing assets...</span>
                </>
              ) : (
                <span>{isSignUp ? "Create Student Account" : "Access Platform"}</span>
              )}
            </button>
          </form>

          {/* Quick Demo logins divider and selector */}
          <div className="border-t border-gray-150 pt-5 space-y-3" id="quick-demo-logins-strip">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block text-center">
              Quick Evaluator Testing Links
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin("student@example.com", "student123")}
                id="quick-demo-student"
                className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-100 text-left transition-all group"
              >
                <span className="text-[10px] font-bold text-gray-800 block group-hover:text-violet-700">Saniya HK</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">student@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@example.com", "admin123")}
                id="quick-demo-admin"
                className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-100 text-left transition-all group"
              >
                <span className="text-[10px] font-bold text-gray-800 block group-hover:text-violet-700">System Admin</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">admin@example.com</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
