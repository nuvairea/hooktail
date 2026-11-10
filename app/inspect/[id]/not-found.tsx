import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col p-5'>
      <p className='text-white'>
        <span className='mr-2 text-accent'>●</span>hooktail
      </p>
      <p className='mt-1 text-xs'>404</p>

      <div className='my-auto'>
        <h1 className='text-3xl text-white'>bin not found</h1>
        <p className='mt-3 text-xs'>
          this bin expired or never existed. expired bins are deleted when a new bin is created.
        </p>
      </div>

      <Link
        href='/'
        prefetch={false}
        className='w-full rounded-md bg-accent px-4 py-3 text-center text-xs font-bold text-bg md:min-w-36 md:w-fit md:self-start md:px-5 md:py-2.5'
      >
        create new bin
      </Link>
    </main>
  );
}