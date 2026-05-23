import { http, HttpResponse } from 'msw';
import { ApiError, apiDelete, apiGet } from '@/services/apiClient';
import { server } from '../mocks/server';

describe('apiClient', () => {
  it('returns parsed JSON for successful GET requests', async () => {
    server.use(
      http.get('/api/employees', () =>
        HttpResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
        }),
      ),
    );

    const result = await apiGet<{ total: number }>('/employees', {
      page: 1,
      limit: 20,
      search: '',
    });

    expect(result.total).toBe(0);
  });

  it('throws ApiError with API error details when available', async () => {
    server.use(
      http.get('/api/employees', () =>
        HttpResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid page' } },
          { status: 400 },
        ),
      ),
    );

    await expect(apiGet('/employees')).rejects.toEqual(
      new ApiError('Invalid page', 'VALIDATION_ERROR', 400),
    );
  });

  it('throws ApiError with fallback details for non-JSON error responses', async () => {
    server.use(
      http.get('/api/employees', () => new HttpResponse('Bad Gateway', { status: 502 })),
    );

    await expect(apiGet('/employees')).rejects.toMatchObject({
      message: 'Bad Gateway',
      code: 'UNKNOWN_ERROR',
      status: 502,
    });
  });

  it('throws ApiError when DELETE requests fail', async () => {
    server.use(
      http.delete('/api/employees/emp-1', () =>
        HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Employee not found' } },
          { status: 404 },
        ),
      ),
    );

    await expect(apiDelete('/employees/emp-1')).rejects.toEqual(
      new ApiError('Employee not found', 'NOT_FOUND', 404),
    );
  });

  it('handles successful DELETE requests with no response body', async () => {
    server.use(
      http.delete('/api/employees/emp-1', () => new HttpResponse(null, { status: 204 })),
    );

    await expect(apiDelete('/employees/emp-1')).resolves.toBeUndefined();
  });
});
