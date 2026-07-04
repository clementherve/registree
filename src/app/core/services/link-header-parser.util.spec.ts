import { parseNextLinkCursor } from './link-header-parser.util';

describe('parseNextLinkCursor', () => {
  it('extracts the last cursor from a valid Link header', () => {
    const header = '</v2/_catalog?last=foo&n=50>; rel="next"';
    expect(parseNextLinkCursor(header)).toBe('foo');
  });

  it('extracts the last cursor from a tags/list style Link header', () => {
    const header = '</v2/my-repo/tags/list?n=20&last=v1.2.3>; rel="next"';
    expect(parseNextLinkCursor(header)).toBe('v1.2.3');
  });

  it('returns null when there is no Link header', () => {
    expect(parseNextLinkCursor(null)).toBeNull();
  });

  it('returns null when the Link header has no rel="next" entry', () => {
    const header = '</v2/_catalog?last=foo&n=50>; rel="prev"';
    expect(parseNextLinkCursor(header)).toBeNull();
  });

  it('returns null for a malformed Link header', () => {
    expect(parseNextLinkCursor('not a link header')).toBeNull();
  });
});
