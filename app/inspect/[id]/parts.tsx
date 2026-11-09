const methodStyle: Record<string, string> = {
  GET: 'bg-green-400/10 text-green-400',
  POST: 'bg-accent/10 text-accent',
  PUT: 'bg-sky-400/10 text-sky-400',
  PATCH: 'bg-sky-400/10 text-sky-400',
  DELETE: 'bg-amber-400/10 text-amber-400',
};

// splits pretty JSON into tokens and colors keys, strings, numbers, literals
export function Json({ text }: { text: string }) {
  const parts = text.split(/("(?:\\.|[^"\\])*":?|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p;
        if (p.endsWith(':')) {
          return (
            <span key={i}>
              <span className='text-[#f48771]'>{p.slice(0, -1)}</span>:
            </span>
          );
        }
        if (p.startsWith('"')) {
          return (
            <span key={i} className='text-[#9fb28a]'>
              {p}
            </span>
          );
        }
        if (p === 'true' || p === 'false' || p === 'null') {
          return (
            <span key={i} className='text-[#7fa6c9]'>
              {p}
            </span>
          );
        }
        return (
          <span key={i} className='text-[#d4b483]'>
            {p}
          </span>
        );
      })}
    </>
  );
}

export function MethodPill({ method }: { method: string }) {
  return <span className={`rounded px-2 py-1 text-[10px] ${methodStyle[method] ?? 'bg-line text-muted'}`}>{method}</span>;
}

export function KeyValueList({ entries, empty }: { entries: [string, string][]; empty: string }) {
  if (entries.length === 0) return <p className='py-3 text-xs'>{empty}</p>;
  return (
    <div>
      {entries.map(([k, v]) => (
        <div key={k} className='border-b border-line py-3'>
          <p className='text-xs'>{k}</p>
          <p className='mt-1 break-all text-white'>{v}</p>
        </div>
      ))}
    </div>
  );
}
