import { describe, expect, it } from 'vitest';
import { toCsv } from './csv.js';

describe('toCsv', () => {
  it('writes a header row and escapes commas, quotes and newlines', () => {
    const fields = [
      { header: 'Id', value: (r) => r.id },
      { header: 'Remarks', value: (r) => r.remarks },
      { header: 'Amount', value: (r) => r.amount },
    ];
    const csv = toCsv(fields, [
      { id: 'DN-1', remarks: 'Rent, June', amount: 100 },
      { id: 'DN-2', remarks: 'Said "extra"\nline two', amount: null },
    ]);
    expect(csv).toBe('Id,Remarks,Amount\r\nDN-1,"Rent, June",100\r\nDN-2,"Said ""extra""\nline two",');
  });
});
