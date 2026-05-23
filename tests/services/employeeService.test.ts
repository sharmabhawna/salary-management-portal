import { http, HttpResponse } from 'msw';
import {
  createEmployee,
  updateEmployee,
} from '@/services/employeeService';
import { server } from '../mocks/server';

describe('employeeService mutations', () => {
  it('creates an employee', async () => {
    server.use(
      http.post('/api/employees', async ({ request }) => {
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

    const employee = await createEmployee({
      fullName: 'Test User',
      email: 'test@company.com',
      jobTitle: 'Engineer',
      department: 'Engineering',
      country: 'United States',
      salary: 90000,
      employmentType: 'FULL_TIME',
      startDate: '2024-01-01',
    });

    expect(employee.fullName).toBe('Test User');
  });

  it('updates an employee', async () => {
    server.use(
      http.put('/api/employees/emp-1', async ({ request }) => {
        const body = await request.json();

        return HttpResponse.json({
          data: {
            id: 'emp-1',
            ...(body as object),
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        });
      }),
    );

    const employee = await updateEmployee('emp-1', {
      fullName: 'Updated Name',
      email: 'updated@company.com',
      jobTitle: 'Engineer',
      department: 'Engineering',
      country: 'United States',
      salary: 90000,
      employmentType: 'FULL_TIME',
      startDate: '2024-01-01',
    });

    expect(employee.fullName).toBe('Updated Name');
  });
});
