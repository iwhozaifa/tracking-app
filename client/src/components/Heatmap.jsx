import { useMemo, useState } from 'react';

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function colorFor(value, max, type) {
  if (value === undefined || value === null) return 'bg-gray-100';
  if (type === 'checkbox') {
    return Number(value) > 0 ? 'bg-emerald-500' : 'bg-gray-100';
  }
  if (max <= 0) return 'bg-gray-100';
  const ratio = Math.min(Number(value) / max, 1);
  if (ratio === 0) return 'bg-gray-100';
  if (ratio < 0.25) return 'bg-emerald-200';
  if (ratio < 0.5) return 'bg-emerald-300';
  if (ratio < 0.75) return 'bg-emerald-400';
  return 'bg-emerald-600';
}

export default function Heatmap({ entries, type, target, weeks = 18 }) {
  const [hovered, setHovered] = useState(null);

  const entryMap = useMemo(() => {
    const m = new Map();
    entries.forEach((e) => m.set(e.entry_date.slice(0, 10), e));
    return m;
  }, [entries]);

  const days = weeks * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOffset = 6 - today.getDay();
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + endOffset);
  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridStart.getDate() - (days - 1));

  const cells = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    cells.push(d);
  }

  const maxValue = useMemo(() => {
    if (type === 'checkbox') return 1;
    if (target) return Number(target);
    return Math.max(1, ...entries.map((e) => Number(e.value) || 0));
  }, [entries, target, type]);

  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((d, di) => {
              const key = toDateStr(d);
              const entry = entryMap.get(key);
              const isFuture = d > today;
              return (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${
                    isFuture ? 'bg-transparent' : colorFor(entry?.value, maxValue, type)
                  } ${!isFuture ? 'cursor-pointer hover:ring-2 hover:ring-emerald-700' : ''}`}
                  onMouseEnter={() => !isFuture && setHovered({ date: key, entry })}
                  onMouseLeave={() => setHovered(null)}
                  title={isFuture ? '' : key}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="h-5 mt-1 text-xs text-gray-500">
        {hovered &&
          `${hovered.date}: ${
            hovered.entry
              ? `${hovered.entry.value}${hovered.entry.note ? ' — ' + hovered.entry.note : ''}`
              : 'no entry'
          }`}
      </div>
    </div>
  );
}
