import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useInsights } from '@/hooks/useInsights';
import { server } from '../mocks/server';

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

describe('useInsights', () => {
  it('loads department and headcount data on mount', async () => {
    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
      expect(result.current.headcountLoading).toBe(false);
    });

    expect(result.current.departmentStats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ department: 'Engineering' }),
      ]),
    );
    expect(result.current.headcountStats.length).toBe(4);
  });

  it('fetches country stats when requested', async () => {
    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    act(() => {
      result.current.setCountryStatsCountry('United States');
    });

    await act(async () => {
      await result.current.fetchCountryStats();
    });

    expect(result.current.countryStats).toEqual({
      country: 'United States',
      min: 95000,
      max: 95000,
      average: 95000,
    });
  });

  it('uses a generic error message for non-error failures', async () => {
    const originalFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (requestUrl(input).includes('/insights/salary/country')) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- tests non-Error branch
        return Promise.reject('network failure');
      }

      return originalFetch(input, init);
    });

    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    act(() => {
      result.current.setCountryStatsCountry('United States');
    });

    await waitFor(() => {
      expect(result.current.countryStatsCountry).toBe('United States');
    });

    await act(async () => {
      await result.current.fetchCountryStats();
    });

    expect(result.current.countryStatsError).toBe('Failed to load country stats');
  });

  it('ignores stale department responses after unmount', async () => {
    server.use(
      http.get('/api/insights/salary/department', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });

        return HttpResponse.json({
          data: [{ department: 'Engineering', average: 95000 }],
        });
      }),
    );

    const { unmount } = renderHook(() => useInsights());
    unmount();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });

  it('sorts headcount results in descending order', async () => {
    server.use(
      http.get('/api/insights/headcount/country', () =>
        HttpResponse.json({
          data: [
            { country: 'Canada', headcount: 1 },
            { country: 'United States', headcount: 3 },
            { country: 'Germany', headcount: 2 },
          ],
        }),
      ),
    );

    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.headcountLoading).toBe(false);
    });

    expect(result.current.headcountStats.map((stat) => stat.headcount)).toEqual([
      3, 2, 1,
    ]);
  });

  it('does not fetch country stats when country is empty', async () => {
    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.fetchCountryStats();
    });

    expect(result.current.countryStats).toBeNull();
    expect(result.current.countryStatsLoading).toBe(false);
  });

  it('fetches job title insight when requested', async () => {
    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    act(() => {
      result.current.setJobTitleInput('Software Engineer');
      result.current.setJobTitleCountry('United States');
    });

    await waitFor(() => {
      expect(result.current.jobTitleInput).toBe('Software Engineer');
    });

    await act(async () => {
      await result.current.fetchJobTitleInsight();
    });

    expect(result.current.jobTitleInsight).toEqual({
      country: 'United States',
      jobTitle: 'Software Engineer',
      average: 95000,
    });
  });

  it('sets department error when department request fails', async () => {
    server.use(
      http.get('/api/insights/salary/department', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Department error' } },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    expect(result.current.departmentError).toBe('Department error');
    expect(result.current.departmentStats).toEqual([]);
  });

  it('sets headcount error when headcount request fails', async () => {
    server.use(
      http.get('/api/insights/headcount/country', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Headcount error' } },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.headcountLoading).toBe(false);
    });

    expect(result.current.headcountError).toBe('Headcount error');
    expect(result.current.headcountStats).toEqual([]);
  });

  it('ignores stale headcount responses after unmount', async () => {
    server.use(
      http.get('/api/insights/headcount/country', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });

        return HttpResponse.json({
          data: [{ country: 'United States', headcount: 1 }],
        });
      }),
    );

    const { unmount } = renderHook(() => useInsights());
    unmount();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });

  it('does not fetch job title insight when inputs are missing', async () => {
    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.fetchJobTitleInsight();
    });

    expect(result.current.jobTitleInsight).toBeNull();
    expect(result.current.jobTitleLoading).toBe(false);
  });

  it('uses a generic error message for job title non-error failures', async () => {
    const originalFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (requestUrl(input).includes('/insights/salary/job-title')) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- tests non-Error branch
        return Promise.reject('network failure');
      }

      return originalFetch(input, init);
    });

    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
    });

    act(() => {
      result.current.setJobTitleInput('Software Engineer');
      result.current.setJobTitleCountry('United States');
    });

    await waitFor(() => {
      expect(result.current.jobTitleCountry).toBe('United States');
    });

    await act(async () => {
      await result.current.fetchJobTitleInsight();
    });

    expect(result.current.jobTitleError).toBe('Failed to load job title insight');
  });

  it('ignores stale department error responses after unmount', async () => {
    server.use(
      http.get('/api/insights/salary/department', async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });

        return HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Department error' } },
          { status: 500 },
        );
      }),
    );

    const { unmount } = renderHook(() => useInsights());
    unmount();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });

  it('uses generic department and headcount error messages for non-error failures', async () => {
    const originalFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = requestUrl(input);

      if (url.includes('/insights/salary/department')) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- tests non-Error branch
        return Promise.reject('department failure');
      }

      if (url.includes('/insights/headcount/country')) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- tests non-Error branch
        return Promise.reject('headcount failure');
      }

      return originalFetch(input, init);
    });

    const { result } = renderHook(() => useInsights());

    await waitFor(() => {
      expect(result.current.departmentLoading).toBe(false);
      expect(result.current.headcountLoading).toBe(false);
    });

    expect(result.current.departmentError).toBe('Failed to load department salaries');
    expect(result.current.headcountError).toBe('Failed to load headcount');
  });
});
