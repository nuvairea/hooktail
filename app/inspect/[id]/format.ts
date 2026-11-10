export type Row = {
  id: string | number;
  method: string;
  path: string | null;
  headers: Record<string, string>;
  query: string | null;
  body: string | null;
  created_at: string | Date;
};

export function timeAgo(date: string | Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function timeUntil(date: string | Date) {
  const s = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
  if (s < 60) return '<1m';
  if (s < 3600) return `${Math.ceil(s / 60)}m`;
  if (s < 86400) return `${Math.ceil(s / 3600)}h`;
  return `${Math.ceil(s / 86400)}d`;
}

export function size(body: string | null) {
  const n = Buffer.byteLength(body ?? '');
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

export function formatBody(body: string | null) {
  if (!body) return { text: '', json: false };
  try {
    return { text: JSON.stringify(JSON.parse(body), null, 2), json: true };
  } catch {
    return { text: body, json: false };
  }
}
