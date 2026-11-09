import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_POOLED!);
async function handle(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.text();
  const query = new URL(request.url).search;

  await sql`
  INSERT INTO requests (bin_id, method, headers, query, body)
  VALUES (
    ${id},
    ${request.method},
    ${JSON.stringify(Object.fromEntries(request.headers))}::jsonb,
    ${query},
    ${body}
  )`;

  return new Response('ok');
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;