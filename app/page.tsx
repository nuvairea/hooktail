import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Home() {
  const id = randomBytes(8).toString('hex');
  redirect(`/inspect/${id}`);
}
