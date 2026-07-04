import { computeManifestDigest } from './manifest-digest.util';

describe('computeManifestDigest', () => {
  it('computes the sha256 digest of the raw manifest bytes', async () => {
    // Known value: echo -n '{"a":1}' | sha256sum
    const digest = await computeManifestDigest('{"a":1}');
    expect(digest).toBe('sha256:015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862');
  });

  it('produces different digests for different bodies', async () => {
    const a = await computeManifestDigest('{"a":1}');
    const b = await computeManifestDigest('{"a":2}');
    expect(a).not.toBe(b);
  });
});
