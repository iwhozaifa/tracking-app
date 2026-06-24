import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../api.js';

export default function HistoryView({ goals }) {
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!goalId) return;
    setLoading(true);
    api.getEntries(goalId).then((data) => {
      setEntries([...data].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1)));
      setLoading(false);
    });
  }, [goalId]);

  async function handleDelete(id) {
    await api.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-4">
      <select
        value={goalId}
        onChange={(e) => setGoalId(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {entries.length === 0 && <p className="p-4 text-sm text-gray-500">No entries yet.</p>}
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-2">
              <div>
                <span className="text-sm font-medium text-gray-800">{e.entry_date.slice(0, 10)}</span>
                <span className="text-sm text-gray-500 ml-3">value: {e.value}</span>
                {e.note && <span className="text-sm text-gray-400 ml-3">— {e.note}</span>}
              </div>
              <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
