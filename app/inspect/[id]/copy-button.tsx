'use client';

import { useEffect, useRef, useState } from 'react';

export default function CopyButton({
  text,
  label,
  primary = false,
}: {
  text: string;
  label: string;
  primary?: boolean;
}) {
  const [status, setStatus] = useState<'copied' | 'failed' | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  function showStatus(nextStatus: 'copied' | 'failed') {
    setStatus(nextStatus);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => setStatus(null), 1600);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      showStatus('copied');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        showStatus(document.execCommand('copy') ? 'copied' : 'failed');
      } catch {
        showStatus('failed');
      } finally {
        textarea.remove();
      }
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
      aria-live='polite'
    >
      {status === 'copied' ? 'copied' : status === 'failed' ? 'copy failed' : label}
    </button>
  );
}
