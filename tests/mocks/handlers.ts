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

function buildCountrySalaryStats(country: string) {
  const employees = employeeStore.filter((employee) => employee.country === country);

  if (employees.length === 0) {
    return {
      data: null,
      message: `No employees found in ${country}`,
    };
  }

  const salaries = employees.map((employee) => employee.salary);

  return {
    data: {
      country,
      min: Math.min(...salaries),
      max: Math.max(...salaries),
      average: salaries.reduce((total, salary) => total + salary, 0) / salaries.length,
    },
  };
}

function buildJobTitleSalaryInsight(jobTitle: string, country: string) {
  const employees = employeeStore.filter(
    (employee) =>
      employee.country === country &&
      employee.jobTitle.toLowerCase() === jobTitle.toLowerCase(),
  );

  if (employees.length === 0) {
    return {
      data: null,
      message: `No employees found with job title '${jobTitle}' in ${country}`,
    };
  }

  const average =
    employees.reduce((total, employee) => total + employee.salary, 0) /
    employees.length;

  return {
    data: {
      country,
      jobTitle,
      average,
    },
  };
}

function buildDepartmentSalaryStats() {
  const totals = new Map<string, { total: number; count: number }>();

  for (const employee of employeeStore) {
    const current = totals.get(employee.department) ?? { total: 0, count: 0 };
    totals.set(employee.department, {
      total: current.total + employee.salary,
      count: current.count + 1,
    });
  }

  return {
    data: [...totals.entries()].map(([department, stats]) => ({
      department,
      average: stats.total / stats.count,
    })),
  };
}

function buildHeadcountByCountry() {
  const totals = new Map<string, number>();

  for (const employee of employeeStore) {
    totals.set(employee.country, (totals.get(employee.country) ?? 0) + 1);
  }

  return {
    data: [...totals.entries()].map(([country, headcount]) => ({
      country,
      headcount,
    })),
  };
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

  http.get(`${API_BASE}/insights/salary/country`, ({ request }) => {
    const url = new URL(request.url);
    const country = url.searchParams.get('country') ?? '';

    return HttpResponse.json(buildCountrySalaryStats(country));
  }),

  http.get(`${API_BASE}/insights/salary/job-title`, ({ request }) => {
    const url = new URL(request.url);
    const country = url.searchParams.get('country') ?? '';
    const jobTitle = url.searchParams.get('jobTitle') ?? '';

    return HttpResponse.json(buildJobTitleSalaryInsight(jobTitle, country));
  }),

  http.get(`${API_BASE}/insights/salary/department`, () =>
    HttpResponse.json(buildDepartmentSalaryStats()),
  ),

  http.get(`${API_BASE}/insights/headcount/country`, () =>
    HttpResponse.json(buildHeadcountByCountry()),
  ),
];
