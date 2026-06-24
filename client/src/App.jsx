import { useEffect, useState } from 'react';
import { Plus, LogOut } from 'lucide-react';
import { api, setUnauthorizedHandler } from './api.js';
import Login from './Login.jsx';
import GoalCard from './components/GoalCard.jsx';
import GoalForm from './components/GoalForm.jsx';
import HistoryView from './components/HistoryView.jsx';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [goals, setGoals] = useState([]);
  const [entriesByGoal, setEntriesByGoal] = useState({});
  const [tab, setTab] = useState('today');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setGoals([]);
    setEntriesByGoal({});
  }

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
  }, []);

  useEffect(() => {
    if (token) loadGoals();
    else setLoading(false);
  }, [token]);

  function handleLogin(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  async function loadGoals() {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data);
      const from = new Date();
      from.setDate(from.getDate() - 130);
      const entriesMap = {};
      await Promise.all(
        data.map(async (g) => {
          entriesMap[g.id] = await api.getEntries(g.id, from.toISOString().slice(0, 10));
        })
      );
      setEntriesByGoal(entriesMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal(goal) {
    const created = await api.createGoal(goal);
    setGoals((prev) => [...prev, created]);
    setEntriesByGoal((prev) => ({ ...prev, [created.id]: [] }));
    setShowForm(false);
  }

  async function handleLogToday(goalId, value, note) {
    const saved = await api.saveEntry({ goalId, date: todayStr(), value, note });
    setEntriesByGoal((prev) => {
      const list = (prev[goalId] || []).filter((e) => e.entry_date.slice(0, 10) !== todayStr());
      return { ...prev, [goalId]: [...list, saved] };
    });
  }

  async function handleArchive(goalId) {
    await api.updateGoal(goalId, { archived: true });
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  async function handleDelete(goalId) {
    if (!confirm('Delete this goal and all its history? This cannot be undone.')) return;
    await api.deleteGoal(goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Goal Tracker</h1>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['today', 'history'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize ${
                  tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} title="Log out" className="text-gray-400 hover:text-gray-700">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : tab === 'today' ? (
          <>
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                entries={entriesByGoal[g.id] || []}
                todayEntry={(entriesByGoal[g.id] || []).find(
                  (e) => e.entry_date.slice(0, 10) === todayStr()
                )}
                onLogToday={handleLogToday}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}

            {showForm ? (
              <GoalForm onCreate={handleCreateGoal} onCancel={() => setShowForm(false)} />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600"
              >
                <Plus size={16} /> Add a goal
              </button>
            )}

            {goals.length === 0 && !showForm && (
              <p className="text-center text-sm text-gray-400 py-8">No goals yet — add your first one above.</p>
            )}
          </>
        ) : (
          <HistoryView goals={goals} />
        )}
      </main>
    </div>
  );
}
