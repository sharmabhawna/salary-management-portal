import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { EmployeeList } from '@/features/employees/EmployeeList';
import { mockEmployees } from '../../mocks/employees';
import { server } from '../../mocks/server';

describe('EmployeeList', () => {
  it('shows loading state initially', () => {
    render(<EmployeeList pageSize={2} />);

    expect(
      screen.getByRole('status', { name: /loading employees/i }),
    ).toBeInTheDocument();
  });

  it('renders employee table with data', async () => {
    render(<EmployeeList pageSize={2} />);

    expect(await screen.findByRole('cell', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Software Engineer' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '$95,000' })).toBeInTheDocument();
    expect(screen.getByText('4 employees total')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    server.use(
      http.get('/api/employees', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Server error' } },
          { status: 500 },
        ),
      ),
    );

    render(<EmployeeList pageSize={2} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error');
  });

  it('shows empty state when no employees match filters', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.type(screen.getByLabelText(/search/i), 'No Matching Name');

    expect(
      await screen.findByText(/no employees match the current filters/i),
    ).toBeInTheDocument();
  });

  it('fetches page 2 when next page is clicked', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(await screen.findByRole('cell', { name: 'Alice Johnson' })).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });

  it('fetches page 1 when previous page is clicked', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.click(screen.getByRole('button', { name: /next/i }));
    await screen.findByRole('cell', { name: 'Alice Johnson' });

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(await screen.findByRole('cell', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('triggers filtered request when typing in search input', async () => {
    const user = userEvent.setup();
    const requestedSearches: string[] = [];

    server.use(
      http.get('/api/employees', ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        if (search) {
          requestedSearches.push(search);
        }

        const filtered = mockEmployees.filter((employee) =>
          employee.fullName.toLowerCase().includes((search ?? '').toLowerCase()),
        );

        return HttpResponse.json({
          data: filtered,
          total: filtered.length,
          page: 1,
          limit: 2,
        });
      }),
    );

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.type(screen.getByLabelText(/search/i), 'Jane');

    await waitFor(() => {
      expect(requestedSearches.at(-1)).toBe('Jane');
    });

    expect(await screen.findByRole('cell', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'John Smith' })).not.toBeInTheDocument();
  });

  it('triggers filtered request when country filter changes', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.selectOptions(screen.getByLabelText(/country/i), 'Canada');

    expect(await screen.findByRole('cell', { name: 'John Smith' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Jane Doe' })).not.toBeInTheDocument();
  });

  it('triggers filtered request when department filter changes', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.selectOptions(screen.getByLabelText(/department/i), 'Marketing');

    expect(await screen.findByRole('cell', { name: 'Alice Johnson' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Jane Doe' })).not.toBeInTheDocument();
  });

  it('triggers filtered request when employment type filter changes', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.selectOptions(screen.getByLabelText(/employment type/i), 'PART_TIME');

    expect(await screen.findByRole('cell', { name: 'Alice Johnson' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Jane Doe' })).not.toBeInTheDocument();
  });

  it('toggles sort order when clicking the same column header', async () => {
    const user = userEvent.setup();
    const sortRequests: Array<{ sortBy: string | null; sortOrder: string | null }> = [];

    server.use(
      http.get('/api/employees', ({ request }) => {
        const url = new URL(request.url);
        sortRequests.push({
          sortBy: url.searchParams.get('sortBy'),
          sortOrder: url.searchParams.get('sortOrder'),
        });

        return HttpResponse.json({
          data: mockEmployees.slice(0, 2),
          total: mockEmployees.length,
          page: 1,
          limit: 2,
        });
      }),
    );

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    const salaryHeader = screen.getByRole('button', { name: /salary/i });
    await user.click(salaryHeader);

    await waitFor(() => {
      expect(sortRequests.at(-1)).toEqual({
        sortBy: 'salary',
        sortOrder: 'asc',
      });
    });

    await user.click(salaryHeader);

    await waitFor(() => {
      expect(sortRequests.at(-1)).toEqual({
        sortBy: 'salary',
        sortOrder: 'desc',
      });
    });
  });

  it('shows confirmation dialog and deletes employee on confirm', async () => {
    const user = userEvent.setup();
    let deleteCalled = false;
    let fetchCountAfterDelete = 0;

    server.use(
      http.delete('/api/employees/emp-1', () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get('/api/employees', ({ request }) => {
        const url = new URL(request.url);
        const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
        const limit = Number.parseInt(url.searchParams.get('limit') ?? '2', 10);

        const data = deleteCalled
          ? mockEmployees.filter((employee) => employee.id !== 'emp-1')
          : mockEmployees;

        const start = (page - 1) * limit;

        if (deleteCalled) {
          fetchCountAfterDelete += 1;
        }

        return HttpResponse.json({
          data: data.slice(start, start + limit),
          total: data.length,
          page,
          limit,
        });
      }),
    );

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    const row = screen.getByRole('row', { name: /jane doe/i });
    await user.click(within(row).getByRole('button', { name: /delete/i }));

    const dialog = screen.getByRole('dialog', { name: /delete employee/i });
    await user.click(within(dialog).getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
      expect(fetchCountAfterDelete).toBeGreaterThan(0);
    });

    expect(screen.queryByRole('cell', { name: 'Jane Doe' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes confirmation dialog when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<EmployeeList pageSize={2} />);
    await screen.findByRole('cell', { name: 'Jane Doe' });

    const row = screen.getByRole('row', { name: /jane doe/i });
    await user.click(within(row).getByRole('button', { name: /delete/i }));

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Jane Doe' })).toBeInTheDocument();
  });
});
