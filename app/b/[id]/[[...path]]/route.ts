import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_POOLED!);

const MAX_BODY_BYTES = 256 * 1024;

// returns the body as text, or null if it goes over the limit
async function readBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('content-length'));
  if (declared > MAX_BODY_BYTES) return null;

  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(Buffer.concat(chunks));
}

async function handle(
  request: Request,
  { params }: { params: Promise<{ id: string; path?: string[] }> }
) {
  const { id, path } = await params;
  const pathname = '/' + (path ?? []).join('/');
  const body = await readBody(request);
  if (body === null) {
    return new Response('body too large (max 256 KB)', { status: 413 });
  }
  const query = new URL(request.url).search;

  const saved = await sql`
  INSERT INTO requests (bin_id, method, path, headers, query, body)
  SELECT
    ${id}::text,
    ${request.method}::text,
    ${pathname}::text,
    ${JSON.stringify(Object.fromEntries(request.headers))}::jsonb,
    ${query}::text,
    ${body}::text
  WHERE EXISTS (
    SELECT 1 FROM bins
    WHERE id = ${id} AND expires_at > now()
  )
  RETURNING id
`;

  if (saved.length === 0) {
    return new Response('bin not found', { status: 404 });
  }

  return new Response('ok');
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
