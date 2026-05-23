import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { EmployeeForm } from '@/features/employees/EmployeeForm';
import { mockEmployees } from '../../mocks/employees';
import { server } from '../../mocks/server';

const validFormInput = {
  fullName: 'New Employee',
  email: 'new.employee@company.com',
  jobTitle: 'Product Analyst',
  department: 'Product',
  country: 'United States',
  salary: '85000',
  employmentType: 'FULL_TIME',
  startDate: '2024-06-01',
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  const form = within(screen.getByRole('dialog'));

  await user.type(form.getByLabelText(/full name/i), validFormInput.fullName);
  await user.type(form.getByLabelText(/^email$/i), validFormInput.email);
  await user.type(form.getByLabelText(/job title/i), validFormInput.jobTitle);
  await user.selectOptions(
    form.getByLabelText(/^department$/i),
    validFormInput.department,
  );
  await user.selectOptions(
    form.getByLabelText(/^country$/i),
    validFormInput.country,
  );
  await user.type(form.getByLabelText(/salary/i), validFormInput.salary);
  await user.selectOptions(
    form.getByLabelText(/^employment type$/i),
    validFormInput.employmentType,
  );
  await user.type(form.getByLabelText(/start date/i), validFormInput.startDate);
}

describe('EmployeeForm', () => {
  it('renders empty form for add mode', () => {
    render(<EmployeeForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    expect(
      screen.getByRole('dialog', { name: /add employee/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument();
  });

  it('pre-fills fields in edit mode', () => {
    render(
      <EmployeeForm
        employee={mockEmployees[0]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: /edit employee/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('jane.doe@company.com');
    expect(screen.getByLabelText(/job title/i)).toHaveValue('Software Engineer');
    expect(screen.getByLabelText(/^department$/i)).toHaveValue('Engineering');
    expect(screen.getByLabelText(/^country$/i)).toHaveValue('United States');
    expect(screen.getByLabelText(/salary/i)).toHaveValue(95000);
    expect(screen.getByLabelText(/^employment type$/i)).toHaveValue('FULL_TIME');
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2022-03-15');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();

    render(<EmployeeForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/job title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/department is required/i)).toBeInTheDocument();
    expect(screen.getByText(/country is required/i)).toBeInTheDocument();
    expect(screen.getByText(/salary is required/i)).toBeInTheDocument();
    expect(screen.getByText(/employment type is required/i)).toBeInTheDocument();
    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();

    render(<EmployeeForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/^email$/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(
      await screen.findByText(/email must be a valid email address/i),
    ).toBeInTheDocument();
  });

  it('calls create API on successful add submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    let createCalled = false;

    server.use(
      http.post('/api/employees', async ({ request }) => {
        createCalled = true;
        const body = await request.json();

        return HttpResponse.json(
          {
            data: {
              id: 'emp-new',
              ...(body as object),
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          },
          { status: 201 },
        );
      }),
    );

    render(<EmployeeForm onCancel={vi.fn()} onSuccess={onSuccess} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(createCalled).toBe(true);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: validFormInput.fullName,
          email: validFormInput.email,
        }),
      );
    });
  });

  it('calls update API on successful edit submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    let updateCalled = false;

    server.use(
      http.put('/api/employees/emp-1', async ({ request }) => {
        updateCalled = true;
        const body = await request.json();

        return HttpResponse.json({
          data: {
            ...mockEmployees[0],
            ...(body as object),
            fullName: 'Jane Updated',
          },
        });
      }),
    );

    render(
      <EmployeeForm
        employee={mockEmployees[0]}
        onCancel={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    const fullNameInput = screen.getByLabelText(/full name/i);
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Jane Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateCalled).toBe(true);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Jane Updated' }),
      );
    });
  });

  it('shows API error message when submission fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('/api/employees', () =>
        HttpResponse.json(
          { error: { code: 'CONFLICT', message: 'Email already exists' } },
          { status: 409 },
        ),
      ),
    );

    render(<EmployeeForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email already exists',
    );
  });

  it('cancel button closes the form', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<EmployeeForm onCancel={onCancel} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('clears a field error when the field is updated', async () => {
    const user = userEvent.setup();

    render(<EmployeeForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));
    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/full name/i), 'Updated Name');

    expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument();
  });
});

describe('EmployeeForm wiring in EmployeeList', () => {
  it('opens add form from Add Employee button and refreshes list on success', async () => {
    const user = userEvent.setup();

    const { EmployeeList } = await import('@/features/employees/EmployeeList');
    render(<EmployeeList pageSize={20} />);

    await screen.findByRole('cell', { name: 'Jane Doe' });

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(
      screen.getByRole('dialog', { name: /add employee/i }),
    ).toBeInTheDocument();

    await fillValidForm(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(await screen.findByRole('cell', { name: 'New Employee' })).toBeInTheDocument();
  });

  it('opens edit form from row Edit button', async () => {
    const user = userEvent.setup();

    const { EmployeeList } = await import('@/features/employees/EmployeeList');
    render(<EmployeeList pageSize={20} />);

    await screen.findByRole('cell', { name: 'Jane Doe' });

    const row = screen.getByRole('row', { name: /jane doe/i });
    await user.click(within(row).getByRole('button', { name: /edit/i }));

    expect(
      screen.getByRole('dialog', { name: /edit employee/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Doe');
  });

  it('closes the form when cancel is clicked from the employee list', async () => {
    const user = userEvent.setup();

    const { EmployeeList } = await import('@/features/employees/EmployeeList');
    render(<EmployeeList pageSize={20} />);

    await screen.findByRole('cell', { name: 'Jane Doe' });
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
