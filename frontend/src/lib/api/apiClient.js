import axios from 'axios';
import { env } from '../config/env.js';
import { toApiError } from './ApiError.js';

/**
 * The single Axios instance for the application.
 *
 * Rules (enforced by review, see docs/CODE_REVIEW_CHECKLIST.md):
 *  - UI components never import this file. Only repository modules
 *    (features/<feature>/api/*) may call it.
 *  - The backend uses cookie-based Spring Security sessions, so requests
 *    carry credentials; no token header management is required today.
 *  - All errors are normalised to ApiError before they leave this layer.
 */
const normalizedBaseUrl = (env.apiBaseUrl || '/api').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: env.apiTimeoutMs,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function normalizeRequestUrl(url = '') {
  if (url == null || url === '') return url;
  if (/^https?:\/\//i.test(url)) return url;
  return String(url).replace(/^\/+/, '');
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

/** Thin helpers so repositories stay declarative. */
export const http = {
  get: async (url, config) => (await apiClient.get(normalizeRequestUrl(url), config)).data,
  post: async (url, body, config) => (await apiClient.post(normalizeRequestUrl(url), body, config)).data,
  put: async (url, body, config) => (await apiClient.put(normalizeRequestUrl(url), body, config)).data,
  patch: async (url, body, config) => (await apiClient.patch(normalizeRequestUrl(url), body, config)).data,
  delete: async (url, config) => (await apiClient.delete(normalizeRequestUrl(url), config)).data,
};
