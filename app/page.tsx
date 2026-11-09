import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sql = neon(process.env.DATABASE_URL_POOLED!);
  const id = randomBytes(8).toString('hex');

  await sql`DELETE FROM bins WHERE created_at < now() - interval '24 hours'`;
  await sql`INSERT INTO bins (id) VALUES (${id})`;

  redirect(`/inspect/${id}`);
}
