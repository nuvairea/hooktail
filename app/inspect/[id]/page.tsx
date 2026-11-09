import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export default async function InspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = neon(process.env.DATABASE_URL_POOLED!);

  const rows = await sql`
    SELECT id, method, query, body, created_at
    FROM requests
    WHERE bin_id = ${id}
    ORDER BY created_at DESC 
  `;

  return (
    <main>
      <h1>{id}</h1>
      {rows.length === 0 && <p>no requests yet</p>}
      {rows.map((r) => (
        <div key={r.id}>
          <p>
            {r.method} {r.query}
          </p>
          <pre>{r.body}</pre>
        </div>
      ))}
    </main>
  );
}
