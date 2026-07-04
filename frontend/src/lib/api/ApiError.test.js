import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from './ApiError.js';

describe('toApiError', () => {
  it('maps the backend ErrorResponse envelope', () => {
    const axiosError = {
      response: {
        status: 400,
        data: {
          timestamp: '2026-07-03T10:00:00',
          status: 400,
          error: 'Validation Failed',
          message: 'Validation failed for one or more fields',
          path: '/api/v1/donors',
          errors: { donorCode: 'Donor code is required' },
        },
      },
    };
    const apiError = toApiError(axiosError);
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.status).toBe(400);
    expect(apiError.code).toBe('VALIDATION_FAILED');
    expect(apiError.isValidationError).toBe(true);
    expect(apiError.fieldErrors).toEqual({ donorCode: 'Donor code is required' });
    expect(apiError.path).toBe('/api/v1/donors');
  });

  it('maps network failures to status 0', () => {
    const apiError = toApiError(new Error('Network Error'));
    expect(apiError.status).toBe(0);
    expect(apiError.isNetworkError).toBe(true);
    expect(apiError.code).toBe('NETWORK');
  });

  it('handles bodies without a message', () => {
    const apiError = toApiError({ response: { status: 502, data: {} } });
    expect(apiError.status).toBe(502);
    expect(apiError.message).toMatch(/502/);
  });
});
