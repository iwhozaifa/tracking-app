import { useState } from 'react';
import { Lock } from 'lucide-react';
import { api } from './api.js';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.login(password);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-gray-500" />
          <h1 className="text-lg font-semibold text-gray-900">Goal Tracker</h1>
        </div>
        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
