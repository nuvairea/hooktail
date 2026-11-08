export async function handle(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.text();

  console.log('bin:', id);
  console.log('method:', request.method);
  console.log('headers:', Object.fromEntries(request.headers));
  console.log('body:', request.body);

  return new Response('ok');
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;