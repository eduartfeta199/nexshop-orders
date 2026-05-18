'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (isRegister) {
      setMessage('Account created. Now login.');
      setIsRegister(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.20),transparent_30%)]" />

      <div className="relative w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-bold shadow-lg">
            N
          </div>
          <h1 className="text-3xl font-bold">NexShop Orders</h1>
          <p className="text-sm text-slate-300 mt-2">
            Menaxho porositë, klientët dhe dërgesat në një vend.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            className="w-full rounded-xl bg-white/90 text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl bg-white/90 text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && (
            <p className="text-sm text-center text-amber-300">{message}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 transition py-3 font-semibold shadow-lg disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage('');
          }}
          className="mt-6 w-full text-sm text-indigo-200 hover:text-white"
        >
          {isRegister
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </button>
      </div>
    </main>
  );
}
