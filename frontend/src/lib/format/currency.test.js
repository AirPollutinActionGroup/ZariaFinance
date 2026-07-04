import { describe, expect, it } from 'vitest';
import { formatInr, formatInrExact } from './currency.js';

describe('formatInr', () => {
  it('formats crores', () => {
    expect(formatInr(12000000)).toBe('₹1.20 Cr');
    expect(formatInr(36500000)).toBe('₹3.65 Cr');
  });

  it('formats lakhs', () => {
    expect(formatInr(8000000 / 100)).toBe('₹80,000');
    expect(formatInr(8000000)).toBe('₹80.00 L');
    expect(formatInr(9500000)).toBe('₹95.00 L');
  });

  it('formats small amounts with Indian grouping', () => {
    expect(formatInr(4500)).toBe('₹4,500');
  });

  it('handles negatives and empties', () => {
    expect(formatInr(-12000000)).toBe('-₹1.20 Cr');
    expect(formatInr(null)).toBe('—');
    expect(formatInr(undefined)).toBe('—');
    expect(formatInr('not-a-number')).toBe('—');
  });
});

describe('formatInrExact', () => {
  it('uses Indian digit grouping', () => {
    expect(formatInrExact(12000000)).toBe('₹1,20,00,000');
  });
});
