import { sql } from '../../../../lib/db';
import { readBody, MAX_BODY_BYTES } from '../../../../lib/body';

const MAX_REQUESTS_PER_BIN = 200;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  'access-control-allow-headers': '*',
};

function reply(body: string, status = 200) {
  return new Response(body, { status, headers: CORS });
}

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
      return reply('bin not found', 404);
    }
    if (bins[0].count >= MAX_REQUESTS_PER_BIN) {
      return reply(`bin is full (max ${MAX_REQUESTS_PER_BIN} requests)`, 429);
    }

    // 2. body, capped
    const body = await readBody(request);
    if (body === null) {
      return reply(`body too large (max ${MAX_BODY_BYTES / 1024} KB)`, 413);
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

    return reply('ok');
  } catch (err) {
    console.error('failed to save request', err);
    return reply('failed to save request', 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
