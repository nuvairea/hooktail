'use client';

import { useState } from 'react';

export default function CopyButton({
  text,
  label,
  primary = false,
}: {
  text: string;
  label: string;
  primary?: boolean;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } catch {
      // clipboard blocked, nothing to do
    }
  }

  return (
    <button
      onClick={copy}
      className={
        primary
          ? 'cursor-pointer rounded-md bg-accent px-4 py-3 text-xs font-bold text-bg'
          : 'cursor-pointer rounded-md border border-line px-4 py-3 text-xs text-white'
      }
    >
      {done ? 'copied' : label}
    </button>
  );
}
