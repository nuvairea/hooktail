import Link from 'next/link';
import { headers } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import CopyButton from './copy-button';
import { type Row, timeAgo, timeUntil, size, formatBody } from './format';
import { Json, MethodPill, KeyValueList } from './parts';
import { notFound } from 'next/navigation';
import Refresher from './refresher';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const dynamic = 'force-dynamic';

export default async function InspectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ r?: string; tab?: string; m?: string }> }) {
  const { id } = await params;
  const { r, tab = 'body', m = 'all' } = await searchParams;

  const sql = neon(process.env.DATABASE_URL_POOLED!);

  const bin = await sql`
    SELECT expires_at FROM bins
    WHERE id = ${id} AND expires_at > now()
  `;
  if (bin.length === 0) notFound();
  const expiresAt = bin[0].expires_at;

  const rows = (await sql`
    SELECT id, method, path, headers, query, body, created_at
    FROM requests
    WHERE bin_id = ${id}
    ORDER BY created_at DESC
  `) as Row[];

  // method filter: counts come from all rows, the list shows only the active method
  const counts = new Map<string, number>();
  for (const x of rows) counts.set(x.method, (counts.get(x.method) ?? 0) + 1);
  const methods = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const active = methods.some(([name]) => name.toLowerCase() === m.toLowerCase()) ? m.toLowerCase() : 'all';
  const visible = active === 'all' ? rows : rows.filter((x) => x.method.toLowerCase() === active);
  const mq = active === 'all' ? '' : `&m=${active}`;

  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const binUrl = `${proto}://${h.get('host')}/b/${id}`;

  const selected = visible.find((x) => String(x.id) === r) ?? visible[0];

  // on phones: show the list OR the detail. on desktop: both.
  const mobileDetail = Boolean(r) && visible.length > 0;
  const hideOnMobile = visible.length > 0 && !mobileDetail;

  let curl = '';
  let copyText = '';
  let copyLabel = 'copy body';
  let queryEntries: [string, string][] = [];
  if (selected) {
    const ct = selected.headers['content-type'];
    curl = [`curl -X ${selected.method} '${binUrl}${selected.path ?? ''}'`, ct && `-H 'content-type: ${ct}'`, selected.body && `-d '${selected.body.replace(/'/g, "'\\''")}'`]
      .filter(Boolean)
      .join(' ');

    queryEntries = [...new URLSearchParams(selected.query ?? '')];
    if (tab === 'headers') {
      copyText = JSON.stringify(selected.headers, null, 2);
      copyLabel = 'copy headers';
    } else if (tab === 'query') {
      copyText = selected.query ?? '';
      copyLabel = 'copy query';
    } else {
      copyText = selected.body ?? '';
    }
  }
  const body = formatBody(selected?.body ?? null);

  return (
    <div className='min-h-screen md:grid md:grid-cols-[360px_1fr]'>
      <Refresher />
      {/* left pane: bin info + request list */}
      <aside className={`border-line p-5 md:block md:border-r ${mobileDetail ? 'hidden' : ''}`}>
        <p className='text-white'>
          <span className='mr-2 text-accent'>●</span>hooktail
        </p>
        <p className='mt-1 text-xs'>
          {rows.length === 0 ? 'waiting' : `${rows.length} requests`} · expires in {timeUntil(expiresAt)}
        </p>

        <div className='mt-5 rounded-lg border border-line bg-panel p-4'>
          <p className='text-[11px]'>send requests to</p>
          <div className='mt-2 flex items-center justify-between gap-3'>
            <p className='break-all text-white'>{binUrl}</p>
            <CopyButton text={binUrl} label='copy' primary />
          </div>
          <p className='mt-3 break-all rounded-md border border-line bg-bg p-3 text-[11px]'>$ curl -X POST {binUrl} -d &apos;hello&apos;</p>
        </div>

        {rows.length > 0 && (
          <div className='mt-5 flex gap-4 overflow-x-auto whitespace-nowrap border-b border-line pb-3 text-[11px]'>
            <Link href={`/inspect/${id}`} className={active === 'all' ? 'text-accent' : ''}>
              {active === 'all' && '· '}all {rows.length}
            </Link>
            {methods.map(([method, n]) => {
              const key = method.toLowerCase();
              return (
                <Link key={method} href={`?m=${key}`} className={active === key ? 'text-accent' : ''}>
                  {active === key && '· '}
                  {key} {n}
                </Link>
              );
            })}
          </div>
        )}

        <div className='mt-4 space-y-2'>
          {visible.map((x) => (
            <Link
              key={x.id}
              href={`?r=${x.id}${mq}`}
              className={`flex items-center justify-between rounded-lg border bg-panel p-3 ${selected && x.id === selected.id ? 'md:border-accent border-line' : 'border-line'}`}
            >
              <span className='flex items-center gap-3'>
                <MethodPill method={x.method} />
                <span>
                  <span className='block text-white'>{x.path || '/'}</span>
                  <span className='block text-[11px]'>{timeAgo(x.created_at)}</span>
                </span>
              </span>
              <span className='text-[11px]'>{size(x.body)}</span>
            </Link>
          ))}
        </div>

        {rows.length === 0 && (
          <div className='mt-5 flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 text-center md:hidden'>
            <span className='mb-4 text-2xl text-accent'>●</span>
            <p className='text-white'>waiting for requests</p>
            <p className='mt-2 text-xs'>send any http request to your url. it shows up here within a couple of seconds.</p>
          </div>
        )}
      </aside>

      {/* right pane: selected request */}
      <section className={`p-5 md:block md:p-8 ${hideOnMobile ? 'hidden' : ''} ${rows.length === 0 ? 'hidden md:block' : ''}`}>
        {rows.length === 0 && (
          <div className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-line text-center'>
            <span className='mb-4 text-2xl text-accent'>●</span>
            <p className='text-white'>waiting for requests</p>
            <p className='mt-2 max-w-xs text-xs'>send any http request to your url. it shows up here within a couple of seconds.</p>
          </div>
        )}

        {selected && (
          <>
            <Link href={active === 'all' ? `/inspect/${id}` : `/inspect/${id}?m=${active}`} className='mb-6 block text-xs md:hidden'>
              ← requests
            </Link>

            <div className='flex items-center gap-3'>
              <MethodPill method={selected.method} />
              <span className='text-white'>{selected.path || '/'}</span>
            </div>
            <p className='mt-2 text-[11px]'>
              {timeAgo(selected.created_at)} · {size(selected.body)} · {selected.headers['content-type'] ?? 'no content-type'}
            </p>

            <div className='mt-6 flex border-b border-line text-xs'>
              {['body', 'headers', 'query'].map((t) => (
                <Link key={t} href={`?r=${selected.id}&tab=${t}${mq}`} className={`-mb-px flex-1 border-b-2 py-3 text-center ${tab === t ? 'border-accent text-accent' : 'border-transparent'}`}>
                  {t}
                </Link>
              ))}
            </div>

            <div className='mt-4'>
              {tab === 'body' && (
                <div className='overflow-x-auto rounded-lg border border-line bg-panel p-4 text-xs'>
                  <pre>{!body.text ? 'no body' : body.json ? <Json text={body.text} /> : body.text}</pre>
                </div>
              )}
              {tab === 'headers' && <KeyValueList entries={Object.entries(selected.headers)} empty='no headers' />}
              {tab === 'query' && <KeyValueList entries={queryEntries} empty='no query params' />}
            </div>

            <div className='mt-6 flex flex-col gap-3 md:flex-row'>
              <CopyButton text={curl} label='copy as curl' primary />
              <CopyButton text={copyText} label={copyLabel} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
