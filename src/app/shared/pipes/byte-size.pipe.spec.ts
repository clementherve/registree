import { ByteSizePipe } from './byte-size.pipe';

describe('ByteSizePipe', () => {
  const pipe = new ByteSizePipe();

  it('formats bytes', () => {
    expect(pipe.transform(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(pipe.transform(2048)).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(pipe.transform(134217728)).toBe('128.0 MB');
  });

  it('handles zero', () => {
    expect(pipe.transform(0)).toBe('0 B');
  });

  it('handles null/undefined', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
