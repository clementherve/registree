export function parseNextLinkCursor(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const match = linkHeader.match(/<([^>]+)>\s*;\s*rel="next"/);
  if (!match) return null;

  try {
    const url = new URL(match[1], window.location.origin);
    return url.searchParams.get('last');
  } catch {
    return null;
  }
}
