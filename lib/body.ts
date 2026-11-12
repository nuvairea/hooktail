export const MAX_BODY_BYTES = 256 * 1024;

// returns the body as text, or null if it goes over the limit.
// null bytes get stripped because postgres text columns reject them.
export async function readBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('content-length'));
  if (declared > MAX_BODY_BYTES) return null;

  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(Buffer.concat(chunks)).replaceAll('\u0000', '');
}
