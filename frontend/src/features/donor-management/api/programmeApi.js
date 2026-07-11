import { http } from '../../../lib/api/apiClient.js';

export const programmeApi = {
  list: () => http.get('/v1/programmes'),
};
