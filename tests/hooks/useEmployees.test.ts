import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useEmployees } from '@/hooks/useEmployees';
import { server } from '../mocks/server';

describe('useEmployees', () => {
  it('uses a generic error message for non-error failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce('network failure');

    const { result } = renderHook(() => useEmployees({ pageSize: 2 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load employees');
  });

  it('toggles sort order back to ascending on a third click', async () => {
    const sortRequests: Array<{ sortBy: string | null; sortOrder: string | null }> = [];

    server.use(
      http.get('/api/employees', ({ request }) => {
        const url = new URL(request.url);
        sortRequests.push({
          sortBy: url.searchParams.get('sortBy'),
          sortOrder: url.searchParams.get('sortOrder'),
        });

        return HttpResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit: 2,
        });
      }),
    );

    const { result } = renderHook(() => useEmployees({ pageSize: 2 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.toggleSort('salary');
    result.current.toggleSort('salary');
    result.current.toggleSort('salary');

    await waitFor(() => {
      expect(sortRequests.at(-1)).toEqual({
        sortBy: 'salary',
        sortOrder: 'asc',
      });
    });
  });

  it('ignores stale responses after the hook unmounts', async () => {
    let resolveRequest: ((response: Response) => void) | undefined;

    server.use(
      http.get('/api/employees', () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
      ),
    );

    const { unmount } = renderHook(() => useEmployees({ pageSize: 2 }));

    unmount();

    resolveRequest?.(
      HttpResponse.json({
        data: [],
        total: 0,
        page: 1,
        limit: 2,
      }),
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

  it('ignores stale error responses after the hook unmounts', async () => {
    server.use(
      http.get('/api/employees', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });

        return HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'fail' } },
          { status: 500 },
        );
      }),
    );

    const { unmount } = renderHook(() => useEmployees({ pageSize: 2 }));

    unmount();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });

  it('refreshes employees when refreshEmployees is called', async () => {
    let requestCount = 0;

    server.use(
      http.get('/api/employees', () => {
        requestCount += 1;

        return HttpResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit: 2,
        });
      }),
    );

    const { result } = renderHook(() => useEmployees({ pageSize: 2 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.refreshEmployees();

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(1);
    });
  });
});
