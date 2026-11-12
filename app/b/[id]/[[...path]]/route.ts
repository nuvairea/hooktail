import { sql } from '../../../../lib/db';
import { readBody, MAX_BODY_BYTES } from '../../../../lib/body';

const MAX_REQUESTS_PER_BIN = 200;

async function handle(
  request: Request,
  { params }: { params: Promise<{ id: string; path?: string[] }> }
) {
  try {
    const { id, path } = await params;

    // 1. bin exists, not expired, and how full is it
    const bins = await sql`
      SELECT (SELECT count(*) FROM requests WHERE bin_id = ${id})::int AS count
      FROM bins
      WHERE id = ${id} AND expires_at > now()
    `;
    if (bins.length === 0) {
      return new Response('bin not found', { status: 404 });
    }
    if (bins[0].count >= MAX_REQUESTS_PER_BIN) {
      return new Response(`bin is full (max ${MAX_REQUESTS_PER_BIN} requests)`, {
        status: 429,
      });
    }

    // 2. body, capped
    const body = await readBody(request);
    if (body === null) {
      return new Response(`body too large (max ${MAX_BODY_BYTES / 1024} KB)`, {
        status: 413,
      });
    }

    // 3. save it
    const pathname = '/' + (path ?? []).join('/');
    const query = new URL(request.url).search;
    const headers = JSON.stringify(Object.fromEntries(request.headers));

    await sql`
      INSERT INTO requests (bin_id, method, path, headers, query, body)
      VALUES (
        ${id}::text,
        ${request.method}::text,
        ${pathname}::text,
        ${headers}::jsonb,
        ${query}::text,
        ${body}::text
      )
    `;

    return new Response('ok');
  } catch (err) {
    console.error('failed to save request', err);
    return new Response('failed to save request', { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
