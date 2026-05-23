import { apiDelete, apiGet, apiPost, apiPut } from '@/services/apiClient';
import type {
  Employee,
  EmployeeInput,
  EmployeeResponse,
  GetEmployeesParams,
  PaginatedEmployees,
} from '@/types/employee';

export async function getEmployees(
  params: GetEmployeesParams,
): Promise<PaginatedEmployees> {
  return apiGet<PaginatedEmployees>('/employees', {
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    country: params.country,
    department: params.department,
    jobTitle: params.jobTitle,
    employmentType: params.employmentType,
    search: params.search,
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiDelete(`/employees/${id}`);
}

export async function createEmployee(data: EmployeeInput): Promise<Employee> {
  const response = await apiPost<EmployeeResponse>('/employees', data);
  return response.data;
}

export async function updateEmployee(
  id: string,
  data: EmployeeInput,
): Promise<Employee> {
  const response = await apiPut<EmployeeResponse>(`/employees/${id}`, data);
  return response.data;
}
