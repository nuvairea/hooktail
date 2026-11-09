import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_POOLED!);
async function handle(
  request: Request,
  { params }: { params: Promise<{ id: string; path?: string[] }> }
) {
  const { id, path } = await params;
  const pathname = '/' + (path ?? []).join('/');
  const body = await request.text();
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
    WHERE id = ${id} AND created_at > now() - interval '24 hours'
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