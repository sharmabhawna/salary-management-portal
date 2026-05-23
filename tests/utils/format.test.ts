import { formatHeadcount } from '@/utils/format';

describe('formatHeadcount', () => {
  it('formats headcount with comma separators', () => {
    expect(formatHeadcount(1000)).toBe('1,000');
    expect(formatHeadcount(42)).toBe('42');
  });
});
