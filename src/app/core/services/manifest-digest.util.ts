export async function computeManifestDigest(rawBody: string): Promise<string> {
  const bytes = new TextEncoder().encode(rawBody);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}
