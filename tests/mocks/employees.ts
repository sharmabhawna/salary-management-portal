import type { Employee } from '@/types/employee';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    fullName: 'Jane Doe',
    email: 'jane.doe@company.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    country: 'United States',
    salary: 95000,
    employmentType: 'FULL_TIME',
    startDate: '2022-03-15',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'emp-2',
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    country: 'Canada',
    salary: 110000,
    employmentType: 'FULL_TIME',
    startDate: '2020-07-01',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'emp-3',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    jobTitle: 'Marketing Specialist',
    department: 'Marketing',
    country: 'United Kingdom',
    salary: 72000,
    employmentType: 'PART_TIME',
    startDate: '2023-01-10',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const mockEmployeesPage2: Employee[] = [
  {
    id: 'emp-4',
    fullName: 'Bob Wilson',
    email: 'bob.wilson@company.com',
    jobTitle: 'Financial Analyst',
    department: 'Finance',
    country: 'Germany',
    salary: 88000,
    employmentType: 'CONTRACT',
    startDate: '2021-05-20',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];
