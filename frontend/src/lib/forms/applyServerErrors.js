/**
 * Merges backend validation failures (ApiError.fieldErrors, keyed by DTO
 * field name) into a React Hook Form instance so users see errors on the
 * exact fields the server rejected.
 *
 * @returns {boolean} true if at least one field error was applied.
 */
export function applyServerErrors(apiError, setError, knownFields) {
  if (!apiError?.fieldErrors) return false;
  let applied = false;
  for (const [field, message] of Object.entries(apiError.fieldErrors)) {
    if (!knownFields || knownFields.includes(field)) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  }
  return applied;
}
