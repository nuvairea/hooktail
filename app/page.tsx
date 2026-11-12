import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sql = neon(process.env.DATABASE_URL_POOLED!);
  const id = randomBytes(8).toString('hex');

  await sql`DELETE FROM bins WHERE expires_at <= now()`;
  await sql`INSERT INTO bins (id, expires_at) VALUES (${id}, now() + interval '24 hours')`;

  redirect(`/inspect/${id}`);
}
