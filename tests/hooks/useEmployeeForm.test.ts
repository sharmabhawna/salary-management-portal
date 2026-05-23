import { act, renderHook, waitFor } from '@testing-library/react';
import type { SubmitEvent } from 'react';
import { http, HttpResponse } from 'msw';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { mockEmployees } from '../mocks/employees';
import { server } from '../mocks/server';

describe('useEmployeeForm', () => {
  it('uses a generic error message for non-error failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce('network failure');

    const { result } = renderHook(() =>
      useEmployeeForm({ employee: mockEmployees[0], onSuccess: vi.fn() }),
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as SubmitEvent<HTMLFormElement>);
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });

    expect(result.current.submitError).toBe('Failed to save employee');
  });

  it('does not call onSuccess when validation fails', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useEmployeeForm({ onSuccess }));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as SubmitEvent<HTMLFormElement>);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.fullName).toBeDefined();
  });

  it('submits updates for an existing employee', async () => {
    const onSuccess = vi.fn();

    server.use(
      http.put('/api/employees/emp-1', () =>
        HttpResponse.json({
          data: {
            ...mockEmployees[0],
            fullName: 'Updated Employee',
          },
        }),
      ),
    );

    const { result } = renderHook(() =>
      useEmployeeForm({ employee: mockEmployees[0], onSuccess }),
    );

    result.current.setField('fullName', 'Updated Employee');

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as SubmitEvent<HTMLFormElement>);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Updated Employee' }),
      );
    });
  });
});
