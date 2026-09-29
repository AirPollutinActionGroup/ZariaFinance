/**
 * Minimal CSV export. `fields` is [{ header, value(row) }]. Values are quoted
 * when they contain a comma, quote or newline (RFC 4180); a UTF-8 BOM is
 * prepended on download so Excel shows ₹ and other non-ASCII text correctly.
 */
function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(fields, rows) {
  const header = fields.map((f) => escapeCell(f.header)).join(',');
  const body = rows.map((row) => fields.map((f) => escapeCell(f.value(row))).join(','));
  return [header, ...body].join('\r\n');
}

export function downloadCsv(filename, csv) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
