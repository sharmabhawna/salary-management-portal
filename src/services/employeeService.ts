import { apiDelete, apiGet } from '@/services/apiClient';
import type {
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
