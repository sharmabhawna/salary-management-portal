import { http, HttpResponse } from 'msw';
import type { Employee, EmployeeInput } from '@/types/employee';
import { mockEmployees, mockEmployeesPage2 } from './employees';

const API_BASE = '/api';

function filterEmployees(
  employees: Employee[],
  search: string | null,
  country: string | null,
  department: string | null,
  employmentType: string | null,
) {
  return employees.filter((employee) => {
    if (search && !employee.fullName.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (country && employee.country !== country) {
      return false;
    }

    if (department && employee.department !== department) {
      return false;
    }

    if (employmentType && employee.employmentType !== employmentType) {
      return false;
    }

    return true;
  });
}

const employeeStore: Employee[] = [...mockEmployees, ...mockEmployeesPage2];

export const handlers = [
  http.get(`${API_BASE}/employees`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);
    const search = url.searchParams.get('search');
    const country = url.searchParams.get('country');
    const department = url.searchParams.get('department');
    const employmentType = url.searchParams.get('employmentType');

    const filtered = filterEmployees(
      employeeStore,
      search,
      country,
      department,
      employmentType,
    );

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      total: filtered.length,
      page,
      limit,
    });
  }),

  http.post(`${API_BASE}/employees`, async ({ request }) => {
    const body = (await request.json()) as EmployeeInput;
    const newEmployee: Employee = {
      id: `emp-${String(employeeStore.length + 1)}`,
      fullName: body.fullName,
      email: body.email,
      jobTitle: body.jobTitle,
      department: body.department,
      country: body.country,
      salary: body.salary,
      employmentType: body.employmentType,
      startDate: body.startDate,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    employeeStore.push(newEmployee);

    return HttpResponse.json({ data: newEmployee }, { status: 201 });
  }),

  http.put(`${API_BASE}/employees/:id`, async ({ request, params }) => {
    const id = params.id as string;
    const body = (await request.json()) as EmployeeInput;
    const index = employeeStore.findIndex((employee) => employee.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Employee not found' } },
        { status: 404 },
      );
    }

    const updatedEmployee: Employee = {
      ...employeeStore[index],
      ...body,
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    employeeStore[index] = updatedEmployee;

    return HttpResponse.json({ data: updatedEmployee });
  }),

  http.delete(`${API_BASE}/employees/:id`, ({ params }) => {
    const id = params.id as string;

    if (id === 'missing') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Employee not found' } },
        { status: 404 },
      );
    }

    const index = employeeStore.findIndex((employee) => employee.id === id);
    if (index !== -1) {
      employeeStore.splice(index, 1);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
