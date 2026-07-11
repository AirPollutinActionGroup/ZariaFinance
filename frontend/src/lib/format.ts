/** Allowed MoU file extensions. */
export const ALLOWED_DOC_EXTENSIONS = ['pdf', 'doc', 'docx'] as const;
/** Maximum MoU upload size, in bytes (25 MB). */
export const MAX_DOC_BYTES = 25 * 1024 * 1024;

/** Format a byte count as a compact human string. */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** ISO date (YYYY-MM-DD) for "uploaded" labels. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Allocation is healthy at 100%+, otherwise it is short. */
export function isAllocationHealthy(pct: number): boolean {
  return pct >= 100;
}

export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

/** Client-side validation mirroring the server contract. */
export function validateDocFile(file: File): FileValidationResult {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!(ALLOWED_DOC_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, error: `"${file.name}" is not a supported type (PDF, DOC, DOCX).` };
  }
  if (file.size > MAX_DOC_BYTES) {
    return { ok: false, error: `"${file.name}" exceeds the 25 MB limit.` };
  }
  return { ok: true };
}
