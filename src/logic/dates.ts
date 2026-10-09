const pad = (num: number) => String(num).padStart(2, '0');

export function toLocalDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const today = () => toLocalDay(new Date());

export function monthsBefore(day: string, months: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return toLocalDay(new Date(y, m - 1 - months, d));
}

export function describeAgo(day: string, from: string = today()): string {
  const [y1, m1, d1] = day.split('-').map(Number);
  const [y2, m2, d2] = from.split('-').map(Number);
  const days = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 730) return `${Math.floor(days / 30.44)} months ago`;
  return `${Math.floor(days / 365.25)} years ago`
}