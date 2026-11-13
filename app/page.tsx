import { randomBytes } from 'crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '../lib/db';
import { hashedIp } from '../lib/ip';

export const dynamic = 'force-dynamic';

const MAX_BINS_PER_IP_PER_HOUR = 20;

export default async function Home() {
  const ip = hashedIp(await headers());

  await sql`DELETE FROM bins WHERE expires_at <= now()`;

  if (ip) {
    const recent = await sql`
      SELECT count(*)::int AS count
      FROM bins
      WHERE ip = ${ip}::text AND created_at > now() - interval '1 hour'
    `;
    if (recent[0].count >= MAX_BINS_PER_IP_PER_HOUR) return <SlowDown />;
  }

  const id = randomBytes(8).toString('hex');
  await sql`INSERT INTO bins (id, ip) VALUES (${id}::text, ${ip}::text)`;

  redirect(`/inspect/${id}`);
}

function SlowDown() {
  return (
    <main className='flex min-h-screen flex-col p-5'>
      <p className='text-white'>
        <span className='mr-2 text-accent'>●</span>hooktail
      </p>
      <p className='mt-1 text-xs'>429</p>

      <div className='my-auto'>
        <h1 className='text-3xl text-white'>slow down</h1>
        <p className='mt-3 text-xs'>
          you created {MAX_BINS_PER_IP_PER_HOUR} bins in the last hour. try again in a bit, or keep using one you already have.
        </p>
      </div>
    </main>
  );
}
