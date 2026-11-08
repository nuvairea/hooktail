const sample = (
  <>
    <p className='text-[#ff6b5b]'>● inspector</p>
    <p className='text-sm'>live · expires in 23h 41m</p>
    <p className='mt-4 text-white'>POST /stripe/events</p>
    <p className='text-xs'>12s ago · 2.1 KB · application/json</p>
  </>
);

export default function Home() {
  return (
    <main className='min-h-screen bg-[#0a0a0a] p-8 text-gray-400'>
      <div>{sample}</div>
    </main>
  );
}
