import { useState } from 'react';

export default function GoalForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('checkbox');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      type,
      unit: unit.trim() || null,
      target: target ? Number(target) : null,
    });
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <label className="text-sm text-gray-600">Goal name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read every day"
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div>
          <label className="text-sm text-gray-600">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="checkbox">Checkbox (done/not done)</option>
            <option value="number">Number (e.g. minutes, km)</option>
            <option value="rating">Rating (1–5)</option>
          </select>
        </div>
        {type === 'number' && (
          <>
            <div>
              <label className="text-sm text-gray-600">Unit</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="min, km…"
                className="mt-1 w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Daily target</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="mt-1 w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Create goal
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
