import { useState } from 'react';
import { Flame, CheckCircle2, Archive, Trash2 } from 'lucide-react';
import Heatmap from './Heatmap.jsx';
import { calcStreak, calcCompletionRate } from '../utils.js';

export default function GoalCard({ goal, entries, todayEntry, onLogToday, onArchive, onDelete }) {
  const [value, setValue] = useState(todayEntry?.value ?? (goal.type === 'checkbox' ? 0 : ''));
  const [note, setNote] = useState(todayEntry?.note ?? '');
  const [saving, setSaving] = useState(false);

  const streak = calcStreak(entries, goal);
  const { completed, total } = calcCompletionRate(entries, goal);

  async function handleSave(newValue) {
    setSaving(true);
    try {
      await onLogToday(goal.id, newValue, note);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{goal.name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Flame size={14} className="text-orange-500" /> {streak} day streak
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-500" /> {completed}/{total} days
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onArchive(goal.id)} title="Archive" className="text-gray-400 hover:text-gray-700">
            <Archive size={16} />
          </button>
          <button onClick={() => onDelete(goal.id)} title="Delete" className="text-gray-400 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {goal.type === 'checkbox' && (
          <button
            onClick={() => {
              const v = value > 0 ? 0 : 1;
              setValue(v);
              handleSave(v);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              value > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {value > 0 ? 'Done today ✓' : 'Mark done'}
          </button>
        )}
        {goal.type === 'number' && (
          <>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => handleSave(Number(value) || 0)}
              placeholder={goal.unit || 'value'}
              className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">
              {goal.unit}
              {goal.target ? ` / ${goal.target} target` : ''}
            </span>
          </>
        )}
        {goal.type === 'rating' && (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setValue(r);
                  handleSave(r);
                }}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  Number(value) >= r ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => handleSave(Number(value) || value)}
          placeholder="note (optional)"
          className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
        />
        {saving && <span className="text-xs text-gray-400">saving…</span>}
      </div>

      <div className="mt-4">
        <Heatmap entries={entries} type={goal.type} target={goal.target} />
      </div>
    </div>
  );
}
