'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EVERY_MS = 1000;

export default function Refresher() {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };

    const timer = setInterval(tick, EVERY_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
