import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate('/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-white p-6 shadow-sm shadow-green-900/5">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-green-900">
            Admin Padukuhan Piji
          </h1>
          <p className="mt-1 text-sm text-green-700">
            Masuk untuk mengelola data Padukuhan Piji.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-green-900">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-950 outline-none transition placeholder:text-green-900/40 focus:border-green-700 focus:ring-2 focus:ring-green-600/30"
              placeholder="admin@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-green-900">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-950 outline-none transition placeholder:text-green-900/40 focus:border-green-700 focus:ring-2 focus:ring-green-600/30"
              placeholder="Masukkan password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
