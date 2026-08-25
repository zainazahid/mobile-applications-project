const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatWatchedDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function getMonthYear(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

// Group an array of watched entries by month/year label
export function groupByMonth(watchedMovies) {
  const groups = {};
  const sorted = [...watchedMovies].sort(
    (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)
  );
  sorted.forEach((entry) => {
    const label = getMonthYear(entry.watchedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  });
  return groups;
}
