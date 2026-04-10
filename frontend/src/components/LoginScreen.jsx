import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginScreen({ initialMode = 'login', onBack }) {
  const { signUp, signIn, verifyOtp } = useAuth();
  
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
            <span className="text-[#b45309]">{"}"}</span> Jigyasa Portal
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
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
                {mode === 'register' && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none transition text-white placeholder:text-white/20"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none transition text-white placeholder:text-white/20"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 outline-none transition text-white placeholder:text-white/20"
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
