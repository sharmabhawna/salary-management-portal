export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';

export type EmployeeSortField =
  | 'fullName'
  | 'email'
  | 'jobTitle'
  | 'department'
  | 'country'
  | 'salary'
  | 'startDate'
  | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number;
  employmentType: EmploymentType;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetEmployeesParams {
  page: number;
  limit: number;
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
  country?: string;
  department?: string;
  jobTitle?: string;
  employmentType?: EmploymentType;
  search?: string;
}

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeInput {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number;
  employmentType: EmploymentType;
  startDate: string;
}

export interface EmployeeResponse {
  data: Employee;
}

export type EmployeeFormField =
  | 'fullName'
  | 'email'
  | 'jobTitle'
  | 'department'
  | 'country'
  | 'salary'
  | 'employmentType'
  | 'startDate';

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: string;
  employmentType: EmploymentType | '';
  startDate: string;
}

export type EmployeeFormFieldErrors = Partial<Record<EmployeeFormField, string>>;
