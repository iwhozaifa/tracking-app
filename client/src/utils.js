export function isCompleted(entry, goal) {
  if (!entry) return false;
  const value = Number(entry.value);
  if (goal.type === 'checkbox') return value > 0;
  if (goal.type === 'number') return goal.target ? value >= Number(goal.target) : value > 0;
  return value > 0; // rating
}

export function calcStreak(entries, goal) {
  const map = new Map(entries.map((e) => [e.entry_date.slice(0, 10), e]));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayKey = cursor.toISOString().slice(0, 10);
  if (!isCompleted(map.get(todayKey), goal)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (isCompleted(map.get(key), goal)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcCompletionRate(entries, goal, days = 30) {
  const map = new Map(entries.map((e) => [e.entry_date.slice(0, 10), e]));
  let completed = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (isCompleted(map.get(key), goal)) completed++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { completed, total: days };
}
