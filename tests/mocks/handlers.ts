import { http, HttpResponse } from 'msw';
import { mockEmployees, mockEmployeesPage2 } from './employees';

const API_BASE = '/api';

function filterEmployees(
  employees: typeof mockEmployees,
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

export const handlers = [
  http.get(`${API_BASE}/employees`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);
    const search = url.searchParams.get('search');
    const country = url.searchParams.get('country');
    const department = url.searchParams.get('department');
    const employmentType = url.searchParams.get('employmentType');

    const allEmployees = [...mockEmployees, ...mockEmployeesPage2];
    const filtered = filterEmployees(
      allEmployees,
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

  http.delete(`${API_BASE}/employees/:id`, ({ params }) => {
    const id = params.id as string;

    if (id === 'missing') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Employee not found' } },
        { status: 404 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
