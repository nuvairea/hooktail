export function timeUntil(date: string | Date) {
  const s = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
  if (s < 60) return '<1m';
  const m = Math.ceil(s / 60);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return h === 0 ? `${rem}m` : `${h}h ${rem}m`;
}
