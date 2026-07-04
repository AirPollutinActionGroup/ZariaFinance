/**
 * Normalised API error for the whole application.
 *
 * The backend's GlobalExceptionHandler returns:
 *   { timestamp, status, error, message, path, errors: { field: message } }
 * (see backend/finance/.../common/exception/ErrorResponse.java)
 *
 * Every failure that crosses the Axios boundary is converted into an
 * ApiError so that hooks, services and UI never inspect raw Axios errors.
 */
export class ApiError extends Error {
  /**
   * @param {object} params
   * @param {string} params.message      Human-readable message.
   * @param {number} [params.status]    HTTP status code (0 for network failures).
   * @param {string} [params.code]      Stable machine-readable code.
   * @param {Object<string,string>} [params.fieldErrors] Per-field validation messages.
   * @param {string} [params.path]      Backend request path that failed.
   * @param {unknown} [params.cause]    Original error.
   */
  constructor({ message, status = 0, code = 'UNKNOWN', fieldErrors = null, path = null, cause = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.path = path;
    this.cause = cause;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isValidationError() {
    return this.status === 400 && Boolean(this.fieldErrors);
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

/** Maps an Axios failure to an ApiError. Exported for unit testing. */
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  const response = error?.response;
  if (!response) {
    return new ApiError({
      message: 'Unable to reach the Zariya server. Check your connection and try again.',
      status: 0,
      code: 'NETWORK',
      cause: error,
    });
  }

  const body = response.data || {};
  return new ApiError({
    message: body.message || body.error || `Request failed with status ${response.status}`,
    status: response.status,
    code: body.error ? body.error.toUpperCase().replace(/\s+/g, '_') : `HTTP_${response.status}`,
    fieldErrors: body.errors || null,
    path: body.path || null,
    cause: error,
  });
}
