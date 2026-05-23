import {
  createEmptyFormValues,
  createFormValuesFromEmployee,
  hasValidationErrors,
  toEmployeeInput,
  validateEmployeeForm,
} from '@/utils/employeeFormValidation';
import { mockEmployees } from '../mocks/employees';

describe('employeeFormValidation', () => {
  it('returns no errors for valid values', () => {
    const errors = validateEmployeeForm({
      fullName: 'Jane Doe',
      email: 'jane@company.com',
      jobTitle: 'Engineer',
      department: 'Engineering',
      country: 'United States',
      salary: '95000',
      employmentType: 'FULL_TIME',
      startDate: '2024-01-01',
    });

    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('returns salary validation error for non-positive values', () => {
    const errors = validateEmployeeForm({
      ...createEmptyFormValues(),
      salary: '0',
    });

    expect(errors.salary).toBe('Salary must be a positive number');
  });

  it('creates form values from an employee', () => {
    expect(createFormValuesFromEmployee(mockEmployees[0])).toEqual({
      fullName: 'Jane Doe',
      email: 'jane.doe@company.com',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      country: 'United States',
      salary: '95000',
      employmentType: 'FULL_TIME',
      startDate: '2022-03-15',
    });
  });

  it('converts form values to API input', () => {
    expect(
      toEmployeeInput({
        fullName: ' Jane Doe ',
        email: ' jane@company.com ',
        jobTitle: ' Engineer ',
        department: 'Engineering',
        country: 'United States',
        salary: '95000',
        employmentType: 'FULL_TIME',
        startDate: '2024-01-01',
      }),
    ).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@company.com',
      jobTitle: 'Engineer',
      department: 'Engineering',
      country: 'United States',
      salary: 95000,
      employmentType: 'FULL_TIME',
      startDate: '2024-01-01',
    });
  });
});
