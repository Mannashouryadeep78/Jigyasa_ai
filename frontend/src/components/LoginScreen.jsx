import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginScreen({ initialMode = 'login', onBack }) {
  const { signUp, signIn, verifyOtp, signInWithGoogle } = useAuth();
  
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // If successful, AuthContext listener will automatically handle redirect via App.jsx
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Attempt registration
    const { data, error } = await signUp({ 
        email, 
        password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Move to OTP phase
    setMode('otp');
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await verifyOtp({ email, token: otp, type: 'signup' });
    if (error) {
       setError(error.message);
       setLoading(false);
    }
    // If successful, AuthContext redirects
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e0ccb8] text-white p-4 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-md bg-[#1a0f0a] p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        {onBack && (
            <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition text-sm flex items-center gap-1 font-medium z-10">
                ← Back
            </button>
        )}

        <h1 className="text-3xl font-medium tracking-tighter text-white mb-2 text-center mt-4">
            <span className="text-[#b45309]">✦</span> Jigyasa Portal
        </h1>
        <p className="text-white/60 text-center mb-8 text-sm font-medium">
            {mode === 'otp' ? 'Check your email for the verification code' : 'Please authenticate to access your dashboard.'}
        </p>

        {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                {error}
            </div>
        )}

        {mode === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Verification Code</label>
                    <input 
                        type="text" 
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none text-white placeholder:text-white/20 text-center tracking-widest text-lg font-mono transition"
                        placeholder="00000000"
                        maxLength={8}
                    />
                </div>
                <button 
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="flex justify-center items-center w-full py-4 bg-white hover:bg-white/90 text-[#1a0f0a] font-bold tracking-widest uppercase text-xs rounded-full transition shadow-xl shadow-white/5 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
                </button>
            </form>
        ) : (
            <>
                <button 
                    onClick={() => signInWithGoogle()}
                    disabled={loading}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all flex items-center justify-center gap-3 mb-6 group"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"/>
                    </svg>
                    <span className="text-white font-bold tracking-widest uppercase text-xs">Continue with Google</span>
                </button>

                <div className="relative flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Or use email</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                </div>

                <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
                {mode === 'register' && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none transition text-white text-base placeholder:text-white/20"
                            placeholder="John Doe"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none transition text-white text-base placeholder:text-white/20"
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none transition text-white text-base placeholder:text-white/20"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
                <button 
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center w-full py-4 bg-white hover:bg-white/90 text-[#1a0f0a] font-bold tracking-widest uppercase text-xs rounded-full transition shadow-xl shadow-white/5 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? "Sign In" : "Create Account")}
                </button>
            </form>
            </>
        )}

        {mode !== 'otp' && (
            <div className="mt-8 text-center text-xs tracking-widest uppercase font-bold text-white/50">
                {mode === 'login' ? (
                    <p>Don't have an account? <button onClick={() => { setMode('register'); setError(null); }} className="text-[#b45309] hover:text-white font-bold tracking-widest ml-1">Register</button></p>
                ) : (
                    <p>Already have an account? <button onClick={() => { setMode('login'); setError(null); }} className="text-[#b45309] hover:text-white font-bold tracking-widest ml-1">Sign in</button></p>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
