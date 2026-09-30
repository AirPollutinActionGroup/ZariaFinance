import { describe, expect, it } from 'vitest';
import { donorBook } from './donorBook.js';

describe('donorBook', () => {
  it('uses the saved book when there is one', () => {
    expect(donorBook({ book: 'FC', fundSourceDomicile: 'DOMESTIC' })).toBe('FC');
    expect(donorBook({ book: 'LC', fcraApplicable: true })).toBe('LC');
  });

  it('falls back like the backend when no book is saved', () => {
    expect(donorBook({ book: null, fcraApplicable: true })).toBe('FC');
    expect(donorBook({ book: '', fundSourceDomicile: 'FOREIGN' })).toBe('FC');
    expect(donorBook({ fundSourceDomicile: 'DOMESTIC' })).toBe('LC');
    expect(donorBook({})).toBe('LC');
    expect(donorBook(null)).toBe('');
  });
});
